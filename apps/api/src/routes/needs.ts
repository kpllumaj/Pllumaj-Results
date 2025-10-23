import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

function ensureJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

async function resolveCategory(prisma: PrismaClient, categoryId?: string) {
  if (categoryId) {
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (existing) {
      return existing;
    }
  }

  const fallback = await prisma.category.findFirst();
  if (fallback) {
    return fallback;
  }

  return prisma.category.create({
    data: {
      name: "General",
      slug: "general",
    },
  });
}

async function resolveCity(prisma: PrismaClient, cityId?: string) {
  if (cityId) {
    const existing = await prisma.city.findUnique({ where: { id: cityId } });
    if (existing) {
      return existing;
    }
  }

  const fallback = await prisma.city.findFirst();
  if (fallback) {
    return fallback;
  }

  return prisma.city.create({
    data: {
      name: "Default City",
      state: "N/A",
      country: "N/A",
      timezone: "UTC",
      latitude: 0,
      longitude: 0,
    },
  });
}

export default function createNeedsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const needs = await prisma.need.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: { email: true },
          },
        },
      });
      if (!Array.isArray(needs)) {
        console.warn("Unexpected needs result", needs);
        return res.json([]);
      }
      res.json(needs);
    } catch (error) {
      console.error("Failed to fetch needs", error);
      res.status(500).json({ error: "Unable to list needs" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing authorization header" });
      }

      let payload: JwtPayload;
      try {
        payload = jwt.verify(authHeader.slice("Bearer ".length), ensureJwtSecret()) as JwtPayload;
      } catch (error) {
        console.error("Invalid token", error);
        return res.status(401).json({ error: "Invalid token" });
      }

      const userId = typeof payload.sub === "string" ? payload.sub : undefined;
      if (!userId) {
        return res.status(401).json({ error: "Invalid token payload" });
      }

      const { title, description, budgetAmount, budgetCurrency = "USD", categoryId, cityId, timeEarliest, timeLatest } =
        req.body ?? {};

      if (typeof title !== "string" || typeof description !== "string") {
        return res.status(400).json({ error: "title and description are required" });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const category = await resolveCategory(prisma, categoryId);
      const city = await resolveCity(prisma, cityId);

      const need = await prisma.need.create({
        data: {
          title,
          description,
          budgetAmount: typeof budgetAmount === "number" ? budgetAmount : null,
          budgetCurrency,
          clientId: user.id,
          categoryId: category.id,
          cityId: city.id,
          timeEarliest: timeEarliest ? new Date(timeEarliest) : new Date(),
          timeLatest: timeLatest ? new Date(timeLatest) : null,
        },
      });

      res.status(201).json(need);
    } catch (error) {
      console.error("Failed to create need", error);
      res.status(500).json({ error: "Failed to create need" });
    }
  });

  return router;
}
