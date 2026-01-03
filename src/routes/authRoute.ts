import { Router } from "express";
import { login, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

// /auth
export const authRouter = Router();

/**
 * POST /v1/auth/login
 * Logs user in with Google ID token
 *
 * REQUEST (JSON)
 * body: {
 *   googleIdToken: string
 * }
 *
 * RESPONSE (JSON)
 * data: string (access token)
 */
authRouter.post("/login", login);

/**
 * POST /v1/auth/logout
 * (auth required) Logs user out
 *
 * RESPONSE (JSON)
 * data: User
 */
authRouter.post("/logout", requireAuth, logout);
