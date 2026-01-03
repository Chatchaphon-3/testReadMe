import type { Request, Response } from "express";
import {
  includeSchema,
  queryManySchema,
  zPintString,
  zUintString,
} from "../utils/zodSchemas.js";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { TransactionService } from "../services/transactionService.js";
import { TransactionSource } from "../generated/prisma/enums.js";

// path: GET /v1/transactions
export const getTransactions = async (req: Request, res: Response) => {
  const querySchema = queryManySchema(
    { userId: zPintString, source: z.enum(TransactionSource) },
    ["issueDate", "amount"],
    { order: { field: "issueDate", direction: "desc" } },
  );

  const params = querySchema.parse(req.query);
  const result = await prisma.do((tx) =>
    TransactionService(tx).getTransactions(params),
  );

  return res.status(200).json({
    success: true,
    ...result,
  });
};

// path: GET /v1/transactions/:id
export const getTransaction = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    id: zUintString,
  });
  const querySchema = z.object({
    include: includeSchema(["user"]).optional(),
  });

  const identifier = paramsSchema.parse(req.params);
  const { include } = querySchema.parse(req.body);
  const transaction = await prisma.do((tx) =>
    TransactionService(tx).getTransaction({ identifier, include }),
  );

  return res.status(200).json({
    success: true,
    data: transaction,
  });
};
