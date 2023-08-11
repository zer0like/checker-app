-- CreateTable
CREATE TABLE "SmscStat" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "suspiciousCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,

    CONSTRAINT "SmscStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmscStat_date_key" ON "SmscStat"("date");
