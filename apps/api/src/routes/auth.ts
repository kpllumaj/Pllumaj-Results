import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";

const ALLOWED_ROLES = new Set(["client", "expert", "business"]);
const TOKEN_EXPIRY = "7d";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
};

export default function createAuthRouter(prisma: PrismaClient) {
  const router = Router();

  router.post("/register", async (req, res) => {
    try {
      const { email, password, role } = req.body ?? {};

      if (typeof email !== "string" || typeof password !== "string" || typeof role !== "string") {
        return res.status(400).json({ error: "email, password, and role are required" });
      }

      const normalisedEmail = email.trim().toLowerCase();
      const normalisedRole = role.trim().toLowerCase();

      if (!ALLOWED_ROLES.has(normalisedRole)) {
        return res.status(400).json({ error: "role must be client, expert, or business" });
      }

      const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } });
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: normalisedEmail,
          password: hashedPassword,
          role: normalisedRole,
        },
      });

      res.status(201).json({ id: user.id, email: user.email, role: user.role });
    } catch (error) {
      console.error("Registration error", error);
      console.error(error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body ?? {};
      if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "email and password are required" });
      }

      const normalisedEmail = email.trim().toLowerCase();
      const user = await prisma.user.findUnique({ where: { email: normalisedEmail } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        getJwtSecret(),
        { expiresIn: TOKEN_EXPIRY },
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  return router;
}
