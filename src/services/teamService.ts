import { BadRequestError, NotFoundError } from "../types/errors.js";
import type {
  TeamInclude,
  TeamOrderByWithRelationInput,
  TeamWhereInput,
  TeamWhereUniqueInput,
  TransactionClient,
} from "../generated/prisma/internal/prismaNamespace.js";
import type { QueryManyParams, QueryUniqueParams } from "../types/query.js";
import { getOrder } from "../utils/order.js";
import { getPaginationMeta, toSkipTake } from "../utils/pagination.js";

export const TeamService = (tx: TransactionClient) => ({
  getTeam: async (params: QueryUniqueParams<[{ id: number }], ["sport"]>) => {
    const where: TeamWhereUniqueInput = params.identifier;
    const include: TeamInclude = params.include ?? {};

    const team = await tx.team.findUnique({
      where,
      include,
    });
    if (!team) throw new NotFoundError("Team not found");
    return team;
  },

  getTeams: async (
    params: QueryManyParams<
      { sportId: number; matchId: number; q: string },
      ["name"]
    >,
  ) => {
    const { q, ...restFilter } = params.filter;
    const where: TeamWhereInput = {
      ...(q !== undefined ? { name: { contains: q } } : {}),
      ...restFilter,
    };
    const orderBy: TeamOrderByWithRelationInput = getOrder(params.order);

    const [data, total] = await Promise.all([
      tx.team.findMany({
        where,
        orderBy,
        include: { sport: true },
        ...toSkipTake(params.pagination),
      }),
      tx.team.count({ where }),
    ]);
    return {
      data,
      pagination: getPaginationMeta(params.pagination, total),
    };
  },

  createTeam: async (data: {
    sportId: number;
    name: string;
    members: string[];
  }) => {
    try {
      const team = await tx.team.create({ data, include: { sport: true } });
      return team;
    } catch (err: any) {
      if (err.code === "P2003")
        throw new BadRequestError(`sportId ${data.sportId} doesn't exist`);
      throw err;
    }
  },

  editTeam: async (
    teamId: number,
    data: { name?: string; members?: string[] },
  ) => {
    try {
      const team = await tx.team.update({
        where: { id: teamId },
        data,
        include: { sport: true },
      });
      return team;
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Team not found");
      throw err;
    }
  },

  deleteTeam: async (teamId: number) => {
    try {
      const deleteTeam = await tx.team.delete({
        where: { id: teamId },
      });
      return deleteTeam;
    } catch (err: any) {
      if (err.code === "P2025") throw new NotFoundError("Team not found");
      const foreignKeyViolation =
        err.code === "P2003" ||
        err.cause?.originalCode === "23001" ||
        err.cause?.originalCode === "23503";
      if (foreignKeyViolation)
        throw new BadRequestError(
          "Cannot delete this team. Its data exists in another table",
        );
      throw err;
    }
  },
});
