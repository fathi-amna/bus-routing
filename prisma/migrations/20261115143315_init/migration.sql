-- CreateTable
CREATE TABLE "Hub" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" SERIAL NOT NULL,
    "busNumber" TEXT NOT NULL,
    "capacityKg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusConnection" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "fromHubId" INTEGER NOT NULL,
    "toHubId" INTEGER NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "departureTime" TEXT,
    "arrivalTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hub_name_key" ON "Hub"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_busNumber_key" ON "Bus"("busNumber");

-- CreateIndex
CREATE INDEX "BusConnection_fromHubId_idx" ON "BusConnection"("fromHubId");

-- CreateIndex
CREATE INDEX "BusConnection_toHubId_idx" ON "BusConnection"("toHubId");

-- AddForeignKey
ALTER TABLE "BusConnection" ADD CONSTRAINT "BusConnection_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusConnection" ADD CONSTRAINT "BusConnection_fromHubId_fkey" FOREIGN KEY ("fromHubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusConnection" ADD CONSTRAINT "BusConnection_toHubId_fkey" FOREIGN KEY ("toHubId") REFERENCES "Hub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
