import type { Request, Response } from "express";
import { UserService } from "../services/userService.js";
import { BetService } from "../services/betService.js";
import { z } from "zod";
import {
  includeSchema,
  queryManySchema,
  zBoolString,
  zPintString,
  zUintString,
} from "../utils/zodSchemas.js";
import { prisma } from "../config/prisma.js";
import { TransactionSource, UserRole } from "../generated/prisma/enums.js";
import { TransactionService } from "../services/transactionService.js";

// GET /v1/users/top?limit=...
export const getTopUsers = async (req: Request, res: Response) => {
  const querySchema = queryManySchema({}, []);

  const params = querySchema.parse(req.query);
  const data = await prisma.do((tx) => UserService(tx).getTopUsers(params));

  res.status(200).json({
    success: true,
    data: data,
  });
};

// GET /v1/users/me
export const getSelf = async (req: Request, res: Response) => {
  const user = req.user!;
  return res.status(200).json({
    success: true,
    data: user,
  });
};

//path : GET /users/me/bets
export const getMyBets = async (req: Request, res: Response) => {
  const querySchema = queryManySchema({}, ["matchDate", "stake", "createdAt"], {
    order: { field: "createdAt", direction: "desc" },
  });

  const { filter, ...restParams } = querySchema.parse(req.query);
  const params = {
    filter: { userId: req.user!.id },
    ...restParams,
  };
  const result = await prisma.do((tx) => BetService(tx).getBets(params));

  return res.status(200).json({
    success: true,
    ...result,
  });
};

//path : GET /users (admin)
export const getUsers = async (req: Request, res: Response) => {
  const querySchema = queryManySchema(
    { q: z.string(), role: z.enum(UserRole), isActive: zBoolString },
    ["lastLogoutAt", "username", "points"],
    { order: { field: "username", direction: "asc" } },
  );

  const params = querySchema.parse(req.query);
  const result = await prisma.do((tx) => UserService(tx).getUsers(params));

  return res.status(200).json({
    success: true,
    ...result,
  });
};

//path : GET /users/:id
export const getUser = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    id: zPintString,
  });

  const identifier = paramSchema.parse(req.params);
  const user = await prisma.do((tx) => UserService(tx).getUser({ identifier }));
  return res.status(200).json({ success: true, data: user });
};

// GET /v1/users/me/transactions
export const getMyTransactions = async (req: Request, res: Response) => {
  const querySchema = queryManySchema(
    { source: z.enum(TransactionSource) },
    ["issueDate", "amount"],
    { order: { field: "issueDate", direction: "desc" } },
  );

  const { filter, ...restParams } = querySchema.parse(req.query);
  const params = {
    filter: { userId: req.user!.id, ...filter },
    ...restParams,
  };
  const result = await prisma.do((tx) =>
    TransactionService(tx).getTransactions(params),
  );

  return res.status(200).json({
    success: true,
    ...result,
  });
};

//POST  /v1/users/me/bets
export const createBet = async (req: Request, res: Response) => {
  const user = req.user!;
  // const user : any = {};
  // user.userId = 91;
  const bodySchema = z.object({
    matchId: zUintString,
    predTeamId: z.union([zUintString, z.literal(null)]),
    stake: zPintString,
  });
  const data = bodySchema.parse(req.body);
  const result = await prisma.do((tx) =>
    BetService(tx).createBet({ ...data, userId: user.id }),
  );

  return res.status(201).json({ success: true, data: result });
};

export const getMyBet = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    matchId: zUintString,
  });
  const querySchema = z.object({
    include: includeSchema(["match", "user", "predTeam"]).optional(),
  });

  const { matchId } = paramsSchema.parse(req.params);
  const identifier = { userId_matchId: { userId: req.user!.id, matchId } };
  const { include } = querySchema.parse(req.body);
  const bet = await prisma.do((tx) =>
    BetService(tx).getBet({ identifier, include }),
  );

  return res.status(200).json({
    success: true,
    data: bet,
  });
};
