/*
  Warnings:

  - You are about to drop the column `capacityKg` on the `Bus` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalTime` on the `BusConnection` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `BusConnection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bus" DROP COLUMN "capacityKg";

-- AlterTable
ALTER TABLE "BusConnection" DROP COLUMN "arrivalTime",
DROP COLUMN "departureTime";
