import "dotenv/config";

import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { requireRole, requireAuth } from "./middleware/auth.js";
import { matchRouter } from "./routes/matchRoute.js";
import { userRouter } from "./routes/userRoute.js";
import { authRouter } from "./routes/authRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { betRouter } from "./routes/betRoute.js";
import { teamRouter } from "./routes/teamRoute.js";
import { transactionRouter } from "./routes/transactionRoute.js";
const app = express();
const PORT = process.env["PORT"] || 4000;

app.use(
  cors({
    origin: "*", // อนุยาดทุก port ไปก่อน ตอน deploy ค่อยกลับมาแก้
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// simple api check if everythin still fine
app.post("/check", async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Server is running" });
});
// test middleware
app.post(
  "/test-auth",
  requireAuth,
  requireRole(["USER", "ADMIN"]),
  (req: Request, res: Response) => {
    return res.status(200).json({ success: true, req: req.user });
  },
);

app.use("/v1/matches", matchRouter);
app.use("/v1/bets", betRouter);
app.use("/v1/transactions", transactionRouter);
app.use("/v1/users", userRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/teams", teamRouter);

app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
