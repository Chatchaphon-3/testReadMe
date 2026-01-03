/*
  Warnings:

  - You are about to drop the `BetHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BetHistory" DROP CONSTRAINT "BetHistory_match_id_fkey";

-- DropForeignKey
ALTER TABLE "BetHistory" DROP CONSTRAINT "BetHistory_user_id_fkey";

-- DropTable
DROP TABLE "BetHistory";

-- CreateTable
CREATE TABLE "Bet" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "user_pred" "Prediction",
    "pred_result" "Prediction",
    "initial_bet" DOUBLE PRECISION,
    "reward_score" DOUBLE PRECISION,
    "valid" BOOLEAN,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bet_user_id_match_id_key" ON "Bet"("user_id", "match_id");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
