-- CreateTable
CREATE TABLE "time_records" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "totalWorkDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clock_entries" (
    "id" TEXT NOT NULL,
    "timeRecordId" TEXT NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clock_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_records_date_userId_key" ON "time_records"("date", "userId");

-- AddForeignKey
ALTER TABLE "clock_entries" ADD CONSTRAINT "clock_entries_timeRecordId_fkey" FOREIGN KEY ("timeRecordId") REFERENCES "time_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
