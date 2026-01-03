import type { BetStatus } from "../generated/prisma/enums.js";

export type BetResult = Exclude<BetStatus, "UNSETTLED">;
