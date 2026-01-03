import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getTransaction,
  getTransactions,
} from "../controllers/transactionController.js";

// /transactions
export const transactionRouter = Router();

transactionRouter.get(
  "/",
  requireAuth,
  requireRole(["ADMIN"]),
  getTransactions,
);
transactionRouter.get(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  getTransaction,
);
