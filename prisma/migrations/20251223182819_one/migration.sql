-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('UPCOMING', 'TOMORROW', 'TODAY', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Prediction" AS ENUM ('ONE', 'TWO', 'DRAW');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "team1_id" INTEGER NOT NULL,
    "team2_id" INTEGER NOT NULL,
    "score1" INTEGER,
    "score2" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "sport_type" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'UPCOMING',

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetHistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "user_pred" "Prediction",
    "pred_result" "Prediction",
    "initial_bet" DOUBLE PRECISION,
    "reward_score" DOUBLE PRECISION,
    "valid" BOOLEAN,

    CONSTRAINT "BetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score_recieved" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3),
    "game_type" INTEGER NOT NULL,
    "add_text" TEXT,

    CONSTRAINT "GameLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRef" (
    "game_number" INTEGER NOT NULL,
    "game_name" TEXT NOT NULL,

    CONSTRAINT "GameRef_pkey" PRIMARY KEY ("game_number")
);

-- CreateTable
CREATE TABLE "SportRef" (
    "sport_number" INTEGER NOT NULL,
    "sport_name" TEXT NOT NULL,

    CONSTRAINT "SportRef_pkey" PRIMARY KEY ("sport_number")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sport_type_fkey" FOREIGN KEY ("sport_type") REFERENCES "SportRef"("sport_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetHistory" ADD CONSTRAINT "BetHistory_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetHistory" ADD CONSTRAINT "BetHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLog" ADD CONSTRAINT "GameLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLog" ADD CONSTRAINT "GameLog_game_type_fkey" FOREIGN KEY ("game_type") REFERENCES "GameRef"("game_number") ON DELETE RESTRICT ON UPDATE CASCADE;
