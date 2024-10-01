/*
  Warnings:

  - You are about to drop the column `userId` on the `Collaborator` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[noteId,userEmail]` on the table `Collaborator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `Collaborator` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_userId_fkey";

-- DropIndex
DROP INDEX "Collaborator_noteId_userId_key";

-- AlterTable
ALTER TABLE "Collaborator" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("email");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_noteId_userEmail_key" ON "Collaborator"("noteId", "userEmail");

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
