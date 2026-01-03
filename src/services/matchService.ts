import type { Match, MatchTeam } from "../generated/prisma/client.js";
import type {
  MatchInclude,
  MatchOrderByWithRelationInput,
  MatchWhereInput,
  MatchWhereUniqueInput,
  TransactionClient,
} from "../generated/prisma/internal/prismaNamespace.js";
import { BadRequestError, NotFoundError } from "../types/errors.js";
import type { BetResult } from "../types/prisma.js";
import type { QueryManyParams, QueryUniqueParams } from "../types/query.js";
import { getRangeOfThaiDate } from "../utils/dateUtils.js";
import { getOrder } from "../utils/order.js";
import { getPaginationMeta, toSkipTake } from "../utils/pagination.js";
import { BetService } from "./betService.js";
import { TeamService } from "./teamService.js";

const BETS_TO_CONSIDER = 100;

export const MatchService = (tx: TransactionClient) => ({
  getMatch: async (
    params: QueryUniqueParams<[{ id: number }], ["teams", "sport"]>,
  ) => {
    const where: MatchWhereUniqueInput = params.identifier;
    const { teams, ...restInclude } = params.include ?? {};
    const include: MatchInclude = {
      ...(teams && { teams: { include: { team: true } } }),
      ...restInclude,
    };

    const match = await tx.match.findUnique({
      where,
      include,
    });
    if (!match) throw new NotFoundError("Match not found");
    return match;
  },

  getMatches: async (
    params: QueryManyParams<
      { date: Date; sportId: number },
      ["startDate", "endDate"]
    >,
  ) => {
    const { date, ...restFilter } = params.filter;
    const where: MatchWhereInput = {
      ...(date !== undefined
        ? ((o) => ({
            startDate: { lte: o.endOfDay },
            endDate: { gte: o.startOfDay },
          }))(getRangeOfThaiDate(date))
        : {}),
      ...restFilter,
    };
    const orderBy: MatchOrderByWithRelationInput = getOrder(params.order);

    const [data, total] = await Promise.all([
      tx.match.findMany({
        where,
        orderBy,
        ...toSkipTake(params.pagination),
      }),
      tx.match.count({ where }),
    ]);
    return {
      data,
      pagination: getPaginationMeta(params.pagination, total),
    };
  },

  createMatch: async (data: {
    teamIds: number[];
    startDate: Date;
    endDate: Date;
    sportId: number;
  }) => {
    const { teamIds, startDate, endDate, sportId } = data;

    // Validate teams
    for (const teamId of teamIds) {
      const team = await TeamService(tx).getTeam({
        identifier: { id: teamId },
      });
      if (team.sportId !== sportId)
        throw new BadRequestError(
          `teamId ${teamId} is not part of sportId ${sportId}`,
        );
    }

    return await tx.match.create({
      data: {
        startDate,
        endDate,
        sportId,
        teams: {
          createMany: { data: teamIds.map((teamId) => ({ teamId })) },
        },
      },
    });
  },

  recordMatch: async (id: number, scores: Map<number, number>) => {
    const match = await tx.match.update({
      where: { id },
      data: { isSettled: true },
      include: {
        teams: { select: { teamId: true, matchId: true } },
        bets: { orderBy: { createdAt: "asc" } },
        sport: { select: { format: true, ordering: true } },
      },
    });

    if (!match) throw new BadRequestError("Invalid match");

    let result: Match & {
      teams: (MatchTeam & { team: { name: string; members: string[] } })[];
    } = { ...match, teams: [] };
    let winningTeamIds: Set<number> = new Set();
    let winningScore = match.sport.ordering === "ASC" ? Infinity : -Infinity;

    // Update scores
    await Promise.all(
      match.teams.map(async (team) => {
        if (!scores.has(team.teamId))
          throw new BadRequestError(
            `All teams must be specified a score; missing teamId ${team.teamId}`,
          );

        // Keep track of winning team(s)
        const score = scores.get(team.teamId)!;
        if (score === winningScore) {
          winningTeamIds.add(team.teamId);
        }
        if (match.sport.ordering === "ASC") {
          if (score < winningScore) {
            winningScore = score;
            winningTeamIds = new Set([team.teamId]);
          }
        } else {
          if (score > winningScore) {
            winningScore = score;
            winningTeamIds = new Set([team.teamId]);
          }
        }

        const matchTeam = await tx.matchTeam.update({
          where: { teamId_matchId: team },
          data: { score },
          include: { team: { select: { name: true, members: true } } },
        });
        result.teams.push(matchTeam);
      }),
    );

    const betsToConsider = match.bets.slice(0, BETS_TO_CONSIDER);
    const betsToRefund = match.bets.slice(BETS_TO_CONSIDER);

    // Update bets
    await Promise.all([
      ...betsToConsider.map(async (bet) => {
        let betResult: BetResult;
        switch (match.sport.format) {
          case "FFA":
            if (bet.predTeamId !== null) {
              betResult = winningTeamIds.has(bet.predTeamId) ? "WIN" : "LOSE";
            } else {
              betResult = "LOSE"; // (how did this happen?)
            }
            break;
          case "ONE_ON_ONE":
            if (bet.predTeamId !== null) {
              betResult = winningTeamIds.has(bet.predTeamId) ? "WIN" : "LOSE";
            } else {
              betResult = winningTeamIds.size > 1 ? "WIN" : "LOSE"; // prediction is a draw
            }
            break;
        }
        return BetService(tx).settleBet(
          bet.userId,
          bet.matchId,
          betResult,
          match.sport.format,
        );
      }),
      ...betsToRefund.map(async (bet) =>
        BetService(tx).settleBet(
          bet.userId,
          bet.matchId,
          "REFUNDED",
          match.sport.format,
        ),
      ),
    ]);

    return result;
  },
});
