import jwt from "jsonwebtoken";
import { oauth } from "../config/oauth.js";
import { ForbiddenError, UnauthorizedError } from "../types/errors.js";
import { UserService } from "./userService.js";
import { env } from "../config/env.js";
import type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.js";

export const AuthService = (tx: TransactionClient) => ({
  login: async (googleIdToken: string) => {
    let payload;
    try {
      const ticket = await oauth.verifyIdToken({
        idToken: googleIdToken,
        audience: env.GOOGLE_CLIENT_ID, // verify audience i guess
      });

      payload = ticket.getPayload();
      if (!payload?.email || !payload.email.endsWith("@student.chula.ac.th"))
        throw new ForbiddenError("Restricted to Chula students only");
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const user = await UserService(tx).upsertUser({
      username: payload.name || "New User",
      email: payload.email,
    });

    return jwt.sign({ email: user.email }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
  },

  logout: async (userId: number) => {
    return await UserService(tx).logoutUser(userId);
  },
});
