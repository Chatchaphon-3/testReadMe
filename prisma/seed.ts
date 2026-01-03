import "dotenv/config";
import { UserRole, Sport, BetStatus, TransactionSource } from "../src/generated/prisma/client.js";
import { prisma } from "../src/config/prisma.js";

const SPORTS: any[] = [
  { id: 1, name: "Football", format: "ONE_ON_ONE", ordering: "DESC" },
  { id: 2, name: "Basketball", format: "ONE_ON_ONE", ordering: "DESC" },
  { id: 3, name: "Volleyball", format: "ONE_ON_ONE", ordering: "DESC" },
  { id: 4, name: "Rubik's Cube", format: "FFA", ordering: "ASC" },
  { id: 5, name: "Type Racer", format: "FFA", ordering: "DESC" },
  { id: 6, name: "ROV", format: "FFA", ordering: "DESC" },
];

// Helpers
const generateChulaEmail = (i: number) =>
  `673${Math.floor(10000 + Math.random() * 90000)}${i}@student.chula.ac.th`;

const createSeedDate = (offsetDays = 0, hour = 18): Date => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const getEndDate = (startDate: Date) => {
  const end = new Date(startDate);
  end.setHours(end.getHours() + 2);
  return end;
};

async function main() {
  console.log("Clearing DB...");
  await prisma.client.$transaction([
    prisma.client.transaction.deleteMany(),
    prisma.client.bet.deleteMany(),
    prisma.client.matchTeam.deleteMany(),
    prisma.client.match.deleteMany(),
    prisma.client.team.deleteMany(),
    prisma.client.user.deleteMany(),
    prisma.client.sport.deleteMany(),
  ]);

  console.log("Seeding sports...");
  await prisma.client.sport.createMany({ data: SPORTS });

  console.log("Seeding teams...");
  const allTeams: Record<number, number[]> = {};
  for (const sport of SPORTS) {
    allTeams[sport.id] = [];
    for (let i = 1; i <= 10; i++) {
      const char = String.fromCharCode(64 + i);
      const members = sport.format === "FFA"
          ? [`Player ${char}`]
          : [`Player ${char}1`, `Player ${char}2`, `Player ${char}3`];

      const team = await prisma.client.team.create({
        data: {
          sportId: sport.id,
          name: `Team ${sport.name} ${char}`,
          members,
        },
      });
      allTeams[sport.id].push(team.id);
    }
  }

  console.log("Seeding users...");
  const userIds: number[] = [];
  for (let i = 0; i < 30; i++) {
    // สุ่มแต้มเริ่มต้น 100 - 1500
    const randomInitialPoints = Math.floor(Math.random() * 1401) + 100;

    const user = await prisma.client.user.create({
      data: {
        email: generateChulaEmail(i),
        username: `Nisit_Chula_${i + 1}`,
        points: randomInitialPoints,
        role: i === 0 ? UserRole.ADMIN : UserRole.USER,
      },
    });
    userIds.push(user.id);
  }

  console.log("Seeding matches...");
  const now = new Date();
  const createMatch = async (sportId: number, numTeams: number) => {
    const teamIds = [...allTeams[sportId]];
    const shuffled = teamIds.sort(() => Math.random() - 0.5);
    const startDate = createSeedDate(Math.floor(Math.random() * 10) - 5, 10 + Math.floor(Math.random() * 8));
    const endDate = getEndDate(startDate);

    await prisma.client.match.create({
      data: {
        sportId,
        startDate,
        endDate,
        isSettled: now > endDate,
        teams: {
          create: shuffled.slice(0, numTeams).map((teamId) => ({
            teamId,
            score: now > startDate ? Math.floor(Math.random() * 10) : null,
          })),
        },
      },
    });
  };

  for (let i = 0; i < 15; i++) await createMatch(SPORTS[i % 3].id, 2);
  for (let i = 0; i < 15; i++) await createMatch(SPORTS[3 + (i % 3)].id, 6);

  console.log("Seeding bets & transactions...");
  const matches = await prisma.client.match.findMany({ include: { teams: true } });

  for (const userId of userIds) {
    const user = await prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) continue;

    const myMatches = matches.sort(() => Math.random() - 0.5).slice(0, 3);

    for (const match of myMatches) {
      const maxStake = Math.max(10, Math.floor(user.points / 3));
      const stake = Math.floor(Math.random() * maxStake) + 10;
      
      const possibleTeams = match.teams.map(t => t.teamId);
      const predTeamId = Math.random() > 0.2 
        ? possibleTeams[Math.floor(Math.random() * possibleTeams.length)] 
        : null;

      await prisma.client.$transaction(async (tx) => {
        const bet = await tx.bet.create({
          data: {
            userId,
            matchId: match.id,
            predTeamId,
            stake,
            status: match.isSettled ? BetStatus.WIN : BetStatus.UNSETTLED,
          }
        });

        await tx.transaction.create({
          data: {
            userId,
            amount: -stake,
            source: TransactionSource.BET,
            description: `Bet placed on match #${match.id}`,
            referenceId: bet.id
          }
        });

        await tx.user.update({
          where: { id: userId },
          data: { points: { decrement: stake } }
        });
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error("Seeding failed:", e); process.exit(1); })
  .finally(async () => { await prisma.client.$disconnect(); });