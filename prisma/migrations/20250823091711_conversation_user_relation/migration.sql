/*
  Warnings:

  - You are about to drop the `_ConversationToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_B_fkey";

-- DropTable
DROP TABLE "public"."_ConversationToUser";

-- CreateTable
CREATE TABLE "public"."_ConversationUser" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ConversationUser_AB_unique" ON "public"."_ConversationUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ConversationUser_B_index" ON "public"."_ConversationUser"("B");

-- AddForeignKey
ALTER TABLE "public"."_ConversationUser" ADD CONSTRAINT "_ConversationUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ConversationUser" ADD CONSTRAINT "_ConversationUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
