/*
  Warnings:

  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "userId";
ALTER TABLE "public"."Message" ADD COLUMN     "recipientId" STRING NOT NULL;
ALTER TABLE "public"."Message" ADD COLUMN     "senderId" STRING NOT NULL;
