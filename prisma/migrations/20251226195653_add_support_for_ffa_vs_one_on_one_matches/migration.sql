/*
  Warnings:

  - The primary key for the `Bet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `initial_bet` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `pred_result` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `reward_score` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `user_pred` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `valid` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `add_text` on the `GameLog` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `GameLog` table. All the data in the column will be lost.
  - You are about to drop the column `game_type` on the `GameLog` table. All the data in the column will be lost.
  - You are about to drop the column `score_received` on the `GameLog` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `GameLog` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `score1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `score2` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `sport_type` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team1_id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2_id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `total_score` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `GameRef` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SportRef` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `matchId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stakes` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameType` to the `GameLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issueDate` to the `GameLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreReceived` to the `GameLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `GameLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('UNSETTLED', 'WIN', 'LOSE', 'REFUNDED');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('BET');

-- CreateEnum
CREATE TYPE "SportFormat" AS ENUM ('ONE_ON_ONE', 'FFA');

-- CreateEnum
CREATE TYPE "ScoreOrdering" AS ENUM ('ASC', 'DESC');

-- DropForeignKey
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_match_id_fkey";

-- DropForeignKey
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_user_id_fkey";

-- DropForeignKey
ALTER TABLE "GameLog" DROP CONSTRAINT "GameLog_game_type_fkey";

-- DropForeignKey
ALTER TABLE "GameLog" DROP CONSTRAINT "GameLog_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_sport_type_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_team1_id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_team2_id_fkey";

-- DropIndex
DROP INDEX "Bet_user_id_match_id_key";

-- DropIndex
DROP INDEX "Team_name_key";

-- AlterTable
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_pkey",
DROP COLUMN "id",
DROP COLUMN "initial_bet",
DROP COLUMN "match_id",
DROP COLUMN "pred_result",
DROP COLUMN "reward_score",
DROP COLUMN "user_id",
DROP COLUMN "user_pred",
DROP COLUMN "valid",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matchId" INTEGER NOT NULL,
ADD COLUMN     "predTeamId" INTEGER,
ADD COLUMN     "stakes" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "BetStatus" NOT NULL DEFAULT 'UNSETTLED',
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Bet_pkey" PRIMARY KEY ("userId", "matchId");

-- AlterTable
ALTER TABLE "GameLog" DROP COLUMN "add_text",
DROP COLUMN "date",
DROP COLUMN "game_type",
DROP COLUMN "score_received",
DROP COLUMN "user_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gameType" "GameType" NOT NULL,
ADD COLUMN     "issueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scoreReceived" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "end_date",
DROP COLUMN "score1",
DROP COLUMN "score2",
DROP COLUMN "sport_type",
DROP COLUMN "start_date",
DROP COLUMN "team1_id",
DROP COLUMN "team2_id",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isSettled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sportId" INTEGER NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "members" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_active",
DROP COLUMN "total_score",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "GameRef";

-- DropTable
DROP TABLE "SportRef";

-- DropEnum
DROP TYPE "Prediction";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "MatchTeam" (
    "teamId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "score" INTEGER,

    CONSTRAINT "MatchTeam_pkey" PRIMARY KEY ("teamId","matchId")
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" SERIAL NOT NULL,
    "sportName" TEXT NOT NULL,
    "format" "SportFormat" NOT NULL,
    "ordering" "ScoreOrdering" NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchTeam_matchId_score_idx" ON "MatchTeam"("matchId", "score");

-- CreateIndex
CREATE INDEX "GameLog_userId_issueDate_idx" ON "GameLog"("userId", "issueDate");

-- CreateIndex
CREATE INDEX "Match_startDate_idx" ON "Match"("startDate");

-- CreateIndex
CREATE INDEX "User_totalScore_idx" ON "User"("totalScore");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchTeam" ADD CONSTRAINT "MatchTeam_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchTeam" ADD CONSTRAINT "MatchTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_predTeamId_fkey" FOREIGN KEY ("predTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLog" ADD CONSTRAINT "GameLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
