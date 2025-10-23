import { OfferStatus, PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pusher } from "../lib/pusher";

const MAX_MESSAGE_LENGTH = 500;

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function ensureJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function extractBearerToken(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice("Bearer ".length);
}

async function requireUser(prisma: PrismaClient, authHeader?: string) {
  const rawToken = extractBearerToken(authHeader);
  if (!rawToken) {
    throw new HttpError(401, "Missing authorization header");
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(rawToken, ensureJwtSecret()) as JwtPayload;
  } catch (error) {
    console.error("Invalid JWT", error);
    throw new HttpError(401, "Invalid token");
  }

  const userId = typeof payload.sub === "string" ? payload.sub : undefined;
  if (!userId) {
    throw new HttpError(401, "Invalid token payload");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
}

async function safeTrigger(channel: string, event: string, data: unknown) {
  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    console.error(`Pusher trigger failed (${channel}:${event})`, error);
  }
}

export default function createOffersRouter(prisma: PrismaClient) {
  const router = Router();

  router.post("/", async (req, res) => {
    try {
      const expert = await requireUser(prisma, req.headers.authorization);
      if (expert.role !== "expert") {
        throw new HttpError(403, "Only experts can send offers");
      }

      const { needId, amount, message, currency: rawCurrency } = req.body ?? {};

      const currency = typeof rawCurrency === "string" && rawCurrency.trim().length > 0 ? rawCurrency.trim() : "USD";

      if (typeof needId !== "string" || needId.length === 0) {
        throw new HttpError(400, "needId is required");
      }

      if (typeof amount !== "number" || Number.isNaN(amount) || !Number.isFinite(amount) || amount <= 0) {
        throw new HttpError(400, "amount must be a valid number greater than 0");
      }

      if (typeof message !== "string" || message.trim().length === 0 || message.trim().length > MAX_MESSAGE_LENGTH) {
        throw new HttpError(400, `message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`);
      }

      const need = await prisma.need.findUnique({
        where: { id: needId },
        select: { id: true, clientId: true },
      });
      if (!need) {
        throw new HttpError(404, "Need not found");
      }

      const offer = await prisma.offer.create({
        data: {
          amount,
          message: message.trim(),
          needId: need.id,
          expertId: expert.id,
          status: OfferStatus.PENDING,
        },
        include: {
          expert: { select: { id: true, email: true } },
          need: { select: { id: true, clientId: true } },
        },
      });

      const responseOffer = {
        ...offer,
        currency,
      };

      await Promise.all([
        safeTrigger(`need-${need.id}`, "offer:created", responseOffer),
        safeTrigger(`client-${need.clientId}`, "offer:created", responseOffer),
      ]);

      res.status(201).json(responseOffer);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error("Failed to create offer", error);
      return res.status(500).json({ error: "Failed to create offer" });
    }
  });

  router.get("/for-need/:needId", async (req, res) => {
    try {
      const { needId } = req.params;
      if (!needId) {
        throw new HttpError(400, "needId is required");
      }

      const user = await requireUser(prisma, req.headers.authorization);

      const need = await prisma.need.findUnique({
        where: { id: needId },
        select: { clientId: true },
      });
      if (!need) {
        throw new HttpError(404, "Need not found");
      }

      if (user.role === "client" && need.clientId !== user.id) {
        throw new HttpError(403, "Not authorized to view offers for this need");
      }

      if (user.role !== "client" && user.role !== "expert") {
        throw new HttpError(403, "Only clients or experts can view offers");
      }

      const offers = await prisma.offer.findMany({
        where: { needId },
        include: {
          expert: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(offers);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error("Failed to list offers", error);
      return res.status(500).json({ error: "Failed to list offers" });
    }
  });

  router.get("/mine", async (req, res) => {
    try {
      const expert = await requireUser(prisma, req.headers.authorization);
      if (expert.role !== "expert") {
        throw new HttpError(403, "Only experts can view their offers");
      }

      const offers = await prisma.offer.findMany({
        where: { expertId: expert.id },
        include: {
          need: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(offers);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error("Failed to list expert offers", error);
      return res.status(500).json({ error: "Failed to list offers" });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const user = await requireUser(prisma, req.headers.authorization);
      if (user.role !== "client") {
        throw new HttpError(403, "Only clients can respond to offers");
      }

      const { id } = req.params;
      const { action, status } = req.body ?? {};

      const normalized = typeof action === "string" ? action.toLowerCase() : typeof status === "string" ? status.toLowerCase() : null;

      let nextStatus: OfferStatus | null = null;
      if (normalized === "accept" || normalized === "accepted") {
        nextStatus = OfferStatus.ACCEPTED;
      } else if (normalized === "decline" || normalized === "declined") {
        nextStatus = OfferStatus.DECLINED;
      }

      if (!nextStatus) {
        throw new HttpError(400, "action must be accept or decline");
      }

      const offer = await prisma.offer.findUnique({
        where: { id },
        include: {
          need: { select: { id: true, clientId: true } },
          expert: { select: { id: true, email: true } },
        },
      });

      if (!offer) {
        throw new HttpError(404, "Offer not found");
      }

      if (offer.need.clientId !== user.id) {
        throw new HttpError(403, "Not authorized to update this offer");
      }

      const updated = await prisma.offer.update({
        where: { id },
        data: { status: nextStatus },
        include: {
          expert: { select: { id: true, email: true } },
          need: { select: { id: true, clientId: true } },
        },
      });

      await Promise.all([
        safeTrigger(`offer-${id}`, "offer:updated", updated),
        safeTrigger(`need-${offer.need.id}`, "offer:updated", updated),
        safeTrigger(`expert-${offer.expert.id}`, "offer:updated", updated),
        safeTrigger(`client-${offer.need.clientId}`, "offer:updated", updated),
      ]);

      res.json(updated);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error("Failed to update offer", error);
      return res.status(500).json({ error: "Failed to update offer" });
    }
  });

  return router;
}
