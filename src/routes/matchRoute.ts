import { Router } from "express";
import {
  createMatch,
  getMatch,
  getMatches,
  recordMatch,
} from "../controllers/matchController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// /matches
export const matchRouter = Router();

matchRouter.get("/", getMatches);
matchRouter.post("/", requireAuth, requireRole(["ADMIN"]), createMatch);
matchRouter.get("/:id", getMatch);
matchRouter.put(
  "/:id/results",
  requireAuth,
  requireRole(["ADMIN"]),
  recordMatch,
);
