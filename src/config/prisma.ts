import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
import type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = {
  client: new PrismaClient({ adapter }),

  do: async <T>(fn: (tx: TransactionClient) => Promise<T>) => {
    return prisma.client.$transaction(fn);
  },
};
