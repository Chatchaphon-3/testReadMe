import "dotenv/config";
import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/authService.js";
import { prisma } from "../config/prisma.js";

export const login = async (req: Request, res: Response) => {
  const bodySchema = z.object({ googleIdToken: z.string() });

  const { googleIdToken } = bodySchema.parse(req.body);
  const accessToken = await prisma.do((tx) =>
    AuthService(tx).login(googleIdToken),
  );

  return res.status(200).json({ success: true, data: accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const user = await prisma.do((tx) => AuthService(tx).logout(req.user!.id));
  return res.status(200).json({
    success: true,
    data: user,
  });
};
