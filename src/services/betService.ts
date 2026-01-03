import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../types/errors.js";
import type {
  BetInclude,
  BetOrderByWithRelationInput,
  BetWhereInput,
  BetWhereUniqueInput,
  TransactionClient,
} from "../generated/prisma/internal/prismaNamespace.js";
import type { BetResult } from "../types/prisma.js";
import { SportFormat, type Bet } from "../generated/prisma/client.js";
import { TransactionService } from "./transactionService.js";
import type { QueryManyParams, QueryUniqueParams } from "../types/query.js";
import { getPaginationMeta, toSkipTake } from "../utils/pagination.js";
import { getOrder } from "../utils/order.js";
import { isValidThaiTomorrow } from "../utils/dateUtils.js";
import { MatchService } from "./matchService.js";

const winMultipliers: Record<SportFormat, number> = {
  FFA: 1.5,
  ONE_ON_ONE: 1.25,
};

export const BetService = (tx: TransactionClient) => ({
  getBet: async (
    params: QueryUniqueParams<
      [{ userId_matchId: { userId: number; matchId: number } }, { id: number }],
      ["match", "user", "predTeam"]
    >,
  ) => {
    const where: BetWhereUniqueInput = params.identifier;
    const include: BetInclude = params.include ?? {};

    const bet = await tx.bet.findUnique({
      where,
      include,
    });
    if (!bet) throw new NotFoundError("Bet not found");
    return bet;
  },

  getBets: async (
    params: QueryManyParams<
      { userId: number; matchId: number },
      ["matchDate", "stake", "createdAt"]
    >,
  ) => {
    const where: BetWhereInput = params.filter;
    const orderBy: BetOrderByWithRelationInput = getOrder(
      params.order,
      (dir) => ({
        matchDate: {
          match: { startDate: dir },
        },
      }),
    );

    const [data, total] = await Promise.all([
      tx.bet.findMany({
        where: params.filter,
        orderBy,
        ...toSkipTake(params.pagination),
      }),
      tx.bet.count({ where }),
    ]);
    return {
      data,
      pagination: getPaginationMeta(params.pagination, total),
    };
  },

  createBet: async (data: {
    userId: number;
    matchId: number;
    predTeamId: number | null; // null for draw prediction
    stake: number;
  }) => {
    const match = await MatchService(tx).getMatch({
      identifier: { id: data.matchId },
      include: { sport: true, teams: true },
    });

    // Check if it is a valid prediction
    if (data.predTeamId !== null) {
      // if not null, check if in team
      const matchTeamIds = match.teams.map((matchTeam) => matchTeam.teamId);
      if (!matchTeamIds.includes(data.predTeamId))
        throw new BadRequestError(
          `predTeamId ${data.predTeamId} is not part of matchId ${data.matchId}`,
        );
    } else {
      // if null, check if match is ONE_ON_ONE
      if (match.sport.format !== "ONE_ON_ONE")
        throw new BadRequestError(
          `null prediction is only applicable to ONE_ON_ONE matches`,
        );
    }

    let bet: Bet;
    try {
      bet = await tx.bet.create({ data });
    } catch(error : any){
      // console.log(error);
      throw new ConflictError("Bet already exists");
    }
    if (!isValidThaiTomorrow(bet.createdAt, match.startDate))
      throw new BadRequestError(
        "Can only bet on matches that start on the next day",
      );

    await TransactionService(tx).createTransaction({
      userId: data.userId,
      amount: -data.stake,
      source: "BET",
      description: `Created bet for matchId ${data.matchId}`,
      referenceId: bet.id,
    });

    return bet;
  },

  settleBet: async (
    userId: number,
    matchId: number,
    betResult: BetResult,
    sportFormat: SportFormat,
  ) => {
    const userId_matchId = { userId, matchId };
    let bet: Bet;
    try {
      bet = await tx.bet.update({
        where: { userId_matchId },
        data: { status: betResult },
      });
    } catch {
      throw new NotFoundError("Bet not found");
    }

    // add points to user
    let amount: number;
    switch (betResult) {
      case "WIN":
        amount = winMultipliers[sportFormat];
        break;
      case "LOSE":
        amount = 0;
        break;
      case "REFUNDED":
        amount = bet.stake;
        break;
    }

    await TransactionService(tx).createTransaction({
      userId,
      amount,
      source: "BET",
      description: `Settled bet for matchId ${matchId} with result ${betResult}`,
      referenceId: bet.id,
    });

    return bet;
  },
});
