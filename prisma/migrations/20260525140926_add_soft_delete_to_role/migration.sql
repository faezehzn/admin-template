-- AlterTable
ALTER TABLE "Role" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Role" ADD COLUMN "deletedBy" TEXT;
