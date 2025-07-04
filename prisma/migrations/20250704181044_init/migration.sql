-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('RESERVED', 'CHECKED_IN', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT NOT NULL,
    "idDocument" TEXT NOT NULL,
    "idDocumentType" TEXT NOT NULL DEFAULT 'Passport',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "airConditioning" BOOLEAN NOT NULL DEFAULT false,
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "guestId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "nights" INTEGER NOT NULL,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_email_key" ON "Guest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_idDocument_key" ON "Guest"("idDocument");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
