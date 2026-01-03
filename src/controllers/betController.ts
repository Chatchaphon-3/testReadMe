import type { Request, Response } from "express";
import { BetService } from "../services/betService.js";
import {
  includeSchema,
  queryManySchema,
  zPintString,
  zUintString,
} from "../utils/zodSchemas.js";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

// path: GET /v1/bets , /v1/bets?userId=1&matchId=2
export const getBets = async (req: Request, res: Response) => {
  const querySchema = queryManySchema(
    { matchId: zPintString, userId: zPintString },
    ["matchDate", "stake", "createdAt"],
    { order: { field: "createdAt", direction: "desc" } },
  );

  const params = querySchema.parse(req.query);
  const result = await prisma.do((tx) => BetService(tx).getBets(params));

  return res.status(200).json({
    success: true,
    ...result,
  });
};

// path: GET /v1/bets/:id
export const getBet = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    id: zUintString,
  });
  const querySchema = z.object({
    include: includeSchema(["match", "user", "predTeam"]).optional(),
  });

  const identifier = paramsSchema.parse(req.params);
  const { include } = querySchema.parse(req.body);
  const bet = await prisma.do((tx) =>
    BetService(tx).getBet({ identifier, include }),
  );

  return res.status(200).json({
    success: true,
    data: bet,
  });
};
