import {
  type TransactionClient,
  type UserOrderByWithRelationInput,
  type UserWhereInput,
  type UserWhereUniqueInput,
} from "../generated/prisma/internal/prismaNamespace.js";
import { BadRequestError, NotFoundError } from "../types/errors.js";
import type { User, UserRole } from "../generated/prisma/client.js";
import type { QueryManyParams, QueryUniqueParams } from "../types/query.js";
import { getOrder } from "../utils/order.js";
import { getPaginationMeta, toSkipTake } from "../utils/pagination.js";

export const UserService = (tx: TransactionClient) => ({
  getUser: async (
    params: QueryUniqueParams<[{ email: string }, { id: number }], []>,
  ) => {
    const where: UserWhereUniqueInput = params.identifier;

    const user = await tx.user.findUnique({
      where,
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  getUsers: async (
    params: QueryManyParams<
      { role: UserRole; isActive: boolean; q: string },
      ["username", "lastLogoutAt", "points"]
    >,
  ) => {
    const { q, ...restFilter } = params.filter;
    const where: UserWhereInput = {
      ...(q !== undefined
        ? { OR: [{ username: { contains: q } }, { email: { contains: q } }] }
        : {}),
      ...restFilter,
    };
    const orderBy: UserOrderByWithRelationInput = getOrder(params.order);

    const [data, total] = await Promise.all([
      tx.user.findMany({
        where,
        orderBy,
        ...toSkipTake(params.pagination),
      }),
      tx.user.count({ where }),
    ]);
    return {
      data,
      pagination: getPaginationMeta(params.pagination, total),
    };
  },

  getTopUsers: async (params: QueryManyParams<{}, []>) => {
    const [data, total] = await Promise.all([
      tx.user.findMany({
        orderBy: { points: "desc" },
        ...toSkipTake(params.pagination),
      }),
      tx.user.count(),
    ]);
    return {
      data,
      pagination: getPaginationMeta(params.pagination, total),
    };
  },

  upsertUser: async (data: { email: string; username: string }) => {
    return await tx.user.upsert({
      where: { email: data.email },
      create: data,
      update: { username: data.username },
    });
  },

  logoutUser: async (id: number) => {
    try {
      return await tx.user.update({
        where: { id },
        data: { lastLogoutAt: new Date() },
      });
    } catch {
      throw new BadRequestError("Invalid user");
    }
  },

  // NOTE: not meant to be used; use TransactionService
  addPointsToUser: async (id: number, amount: number) => {
    let user: User;
    try {
      user = await tx.user.update({
        where: { id },
        data: { points: { increment: amount } },
      });
    } catch {
      throw new BadRequestError("Invalid user");
    }

    if (user.points < 0) throw new BadRequestError("Insufficient funds");
    return user;
  },
});
