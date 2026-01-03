import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import z from "zod";
import { env } from "../config/env.js";
import { ForbiddenError, UnauthorizedError } from "../types/errors.js";
import { UserService } from "../services/userService.js";
import { prisma } from "../config/prisma.js";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const headersSchema = z
    .object({
      authorization: z.string().startsWith("Bearer "),
    })
    .transform((o) => ({
      token: o.authorization.split(" ")[1]!,
    }));
  const payloadSchema = z.object({
    email: z.email(),
    iat: z.number(),
    exp: z.number(),
  });

  let jwtPayload;
  try {
    const { token } = headersSchema.parse(req.headers);
    jwtPayload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  let payload;
  try {
    payload = payloadSchema.parse(jwtPayload);
  } catch {
    throw new UnauthorizedError("Invalid payload");
  }

  let user;
  try {
    user = await prisma.do((tx) =>
      UserService(tx).getUser({ identifier: { email: payload.email } }),
    );
  } catch {
    throw new UnauthorizedError("Unregistered");
  }

  if (user.lastLogoutAt) {
    const logoutTime = user.lastLogoutAt.getTime() / 1000;
    const tokenTime = payload.iat;
    if (tokenTime < logoutTime) {
      throw new UnauthorizedError("Session expired");
    }
  }

  req.user = user;
  next();
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user!.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  };
};
