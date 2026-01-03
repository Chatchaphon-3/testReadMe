import type { TransactionSource } from "../generated/prisma/client.js";
import type {
  TransactionClient,
  TransactionInclude,
  TransactionOrderByWithRelationInput,
  TransactionWhereInput,
  TransactionWhereUniqueInput,
} from "../generated/prisma/internal/prismaNamespace.js";
import { NotFoundError } from "../types/errors.js";
import type { QueryManyParams, QueryUniqueParams } from "../types/query.js";
import { getOrder } from "../utils/order.js";
import { getPaginationMeta, toSkipTake } from "../utils/pagination.js";
import { UserService } from "./userService.js";

export const TransactionService = (tx: TransactionClient) => ({
  getTransaction: async (
    params: QueryUniqueParams<[{ id: number }], ["user"]>,
  ) => {
    const where: TransactionWhereUniqueInput = params.identifier;
    const include: TransactionInclude = params.include ?? {};

    const transaction = await tx.transaction.findUnique({
      where,
      include,
    });
    if (!transaction) throw new NotFoundError("Transaction not found");
    return transaction;
  },

  getTransactions: async (
    params: QueryManyParams<
      { userId: number; source: TransactionSource },
      ["issueDate", "amount"]
    >,
  ) => {
    const where: TransactionWhereInput = params.filter;
    const orderBy: TransactionOrderByWithRelationInput = getOrder(params.order);

    const [data, total] = await Promise.all([
      tx.transaction.findMany({
        where,
        orderBy,
        ...toSkipTake(params.pagination),
      }),
      tx.transaction.count({ where }),
    ]);
    return {
      data,
      pagination: getPaginationMeta(params.pagination, total),
    };
  },

  createTransaction: async (data: {
    userId: number;
    amount: number;
    source: TransactionSource;
    description?: string;
    referenceId?: number;
  }) => {
    await UserService(tx).addPointsToUser(data.userId, data.amount);
    return await tx.transaction.create({ data });
  },
});
