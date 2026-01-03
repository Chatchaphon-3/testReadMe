import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getBet, getBets } from "../controllers/betController.js";

// /bets
export const betRouter = Router();

/**
 * GET /v1/bets
 * (admin required) Fetches bets
 *
 * QUERY PARAMS
 * userId: positive integer
 * matchId: positive integer
 * sort: {matchDate | stake | createdAt}:{asc | desc}
 * page: positive integer
 * pageSize: positive integer
 *
 * DEFAULTS
 * sortBy = createdAt:desc
 *
 * RESPONSE (JSON)
 * data: Bet[]
 * pagination: Pagination
 */
betRouter.get("/", requireAuth, requireRole(["ADMIN"]), getBets);

/**
 * POST /v1/bets/{id}
 * (admin required) Fetches a bet by its id
 *
 * QUERY PARAMS
 * include: comma-separated list of {match | user | predTeam}
 *
 * RESPONSE (JSON)
 * data: Bet
 */
betRouter.get("/:id", requireAuth, requireRole(["ADMIN"]), getBet);
