-- AlterTable: Add photoUrl column to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
