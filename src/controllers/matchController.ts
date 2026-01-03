import type { Request, Response } from "express";
import { MatchService } from "../services/matchService.js";
import { z } from "zod";
import {
  includeSchema,
  queryManySchema,
  zDateString,
  zDateTimeString,
  zMapRecord,
  zPintString,
  zUintString,
} from "../utils/zodSchemas.js";
import { prisma } from "../config/prisma.js";

// path: GET /v1/matches
export const getMatches = async (req: Request, res: Response) => {
  const querySchema = queryManySchema(
    { date: zDateString, sportId: zPintString },
    ["startDate", "endDate"],
    { order: { field: "startDate", direction: "asc" } },
  );

  const params = querySchema.parse(req.query);
  const result = await prisma.do((tx) => MatchService(tx).getMatches(params));

  return res.status(200).json({
    success: true,
    ...result,
  });
};

// path: POST /v1/matches
export const createMatch = async (req: Request, res: Response) => {
  const bodySchema = z.object({
    teamIds: z.array(z.uint32()),
    startDate: zDateTimeString,
    endDate: zDateTimeString,
    sportId: z.uint32(),
  });

  const data = bodySchema.parse(req.body);
  const result = await prisma.do((tx) => MatchService(tx).createMatch(data));

  return res.status(201).json({
    success: true,
    data: result,
  });
};

// path: GET /v1/matches/:id
export const getMatch = async (req: Request, res: Response) => {
  const paramsSchema = z.object({ id: zUintString });
  const querySchema = z.object({
    include: includeSchema(["teams"]).optional(),
  });

  const identifier = paramsSchema.parse(req.params);
  const { include } = querySchema.parse(req.query);
  const data = await prisma.do((tx) =>
    MatchService(tx).getMatch({ identifier, include }),
  );

  return res.status(200).json({
    success: true,
    data,
  });
};

// path: POST /v1/matches/:id/results
export const recordMatch = async (req: Request, res: Response) => {
  const paramsSchema = z.object({ id: zUintString });
  const bodySchema = zMapRecord(zUintString, z.uint32()); // maybe change score to be float in schema (?)

  const { id } = paramsSchema.parse(req.params);
  const scores = bodySchema.parse(req.body);
  const result = await prisma.do((tx) =>
    MatchService(tx).recordMatch(id, scores),
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
};
