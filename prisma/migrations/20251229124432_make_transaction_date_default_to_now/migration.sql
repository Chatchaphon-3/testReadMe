/*
  Warnings:

  - The primary key for the `Bet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sportName` on the `Sport` table. All the data in the column will be lost.
  - You are about to drop the column `totalScore` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `GameLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,matchId]` on the table `Bet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Sport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Sport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('BET', 'OTHER');

-- DropForeignKey
ALTER TABLE "GameLog" DROP CONSTRAINT "GameLog_userId_fkey";

-- DropIndex
DROP INDEX "User_totalScore_idx";

-- AlterTable
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_pkey",
ADD COLUMN     "id" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Sport" DROP COLUMN "sportName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "sportId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "totalScore",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "GameLog";

-- DropEnum
DROP TYPE "GameType";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "TransactionSource" NOT NULL,
    "description" TEXT,
    "referenceId" INTEGER,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_userId_issueDate_idx" ON "Transaction"("userId", "issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_userId_matchId_key" ON "Bet"("userId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_name_key" ON "Sport"("name");

-- CreateIndex
CREATE INDEX "Team_sportId_idx" ON "Team"("sportId");

-- CreateIndex
CREATE INDEX "User_points_idx" ON "User"("points");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
