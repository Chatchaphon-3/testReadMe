import type { Request, Response } from "express";
import { TeamService } from "../services/teamService.js";
import { z } from "zod";
import {
  includeSchema,
  queryManySchema,
  zPintString,
  zUintString,
} from "../utils/zodSchemas.js";
import { prisma } from "../config/prisma.js";

//path : POST /v1/teams คนนอกใช้บ่ได้ + แอดมินสร้าง
export const createTeam = async (req: Request, res: Response) => {
  const bodySchema = z.object({
    name: z.string(),
    members: z.array(z.string()),
    sportId: zUintString,
  });

  const data = bodySchema.parse(req.body);
  const result = await prisma.do((tx) => TeamService(tx).createTeam(data));

  return res.status(201).json({ success: true, data: result });
};

//path : get /v1/teams/:id ดูทีม (public api ?)
export const getTeam = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    id: zUintString,
  });
  const querySchema = z.object({
    include: includeSchema(["sport"]),
  });

  const identifier = paramsSchema.parse(req.params);
  const { include } = querySchema.parse(req.query);
  const data = await prisma.do((tx) =>
    TeamService(tx).getTeam({ identifier, include }),
  );

  return res.status(200).json({ success: true, data });
};

//path : patch /v1/teams/:id แก้ไขข้อมูล (name, member แบบไม่บังคับซักอย่าง)
export const editTeam = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    id: zUintString,
  });
  const bodySchema = z.object({
    name: z.string().optional(),
    members: z.array(z.string()).optional(),
  });

  const { id } = paramsSchema.parse(req.params);
  const data = bodySchema.parse(req.body);
  const result = await prisma.do((tx) => TeamService(tx).editTeam(id, data));

  return res.status(200).json({ success: true, data: result });
};

//path : get /v1/teams/
export const getTeams = async (req: Request, res: Response) => {
  const querySchema = queryManySchema(
    { sportId: zPintString, matchId: zPintString, q: z.string() },
    ["name"],
    { order: { field: "name", direction: "asc" } },
  );

  const params = querySchema.parse(req.query);
  const result = await prisma.do((tx) => TeamService(tx).getTeams(params));

  return res.status(200).json({ success: true, ...result });
};

//path : delete /v1/teams/:id
export const deleteTeam = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    id: zUintString,
  });

  const { id } = paramSchema.parse(req.params);
  const result = await prisma.do((tx) => TeamService(tx).deleteTeam(id));

  return res.status(200).json({ success: true, data: result });
};
