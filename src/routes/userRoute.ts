import { Router } from "express";
import {
  getSelf,
  getTopUsers,
  getMyBets,
  getUsers,
  getUser,
  getMyTransactions,
  createBet,
  getMyBet,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// /users
export const userRouter = Router();

userRouter.get("/me", requireAuth, getSelf);
userRouter.get("/me/transactions", requireAuth, getMyTransactions);
userRouter.get("/me/bets", requireAuth, getMyBets);
userRouter.get("/me/bets/:matchId", requireAuth, getMyBet);
userRouter.post("/me/bets", requireAuth, createBet);

userRouter.get("/top", getTopUsers);
userRouter.get("/", requireAuth, requireRole(["ADMIN"]), getUsers);
userRouter.get("/:id", requireAuth, requireRole(["ADMIN"]), getUser);
