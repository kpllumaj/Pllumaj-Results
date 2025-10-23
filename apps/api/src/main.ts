import "dotenv/config";
import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import createAuthRouter from "./routes/auth";
import createNeedsRouter from "./routes/needs";
import createOffersRouter from "./routes/offers";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/auth", createAuthRouter(prisma));
app.use("/needs", createNeedsRouter(prisma));
app.use("/offers", createOffersRouter(prisma));

const PORT = Number(process.env.PORT || 3001);

app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV, time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
