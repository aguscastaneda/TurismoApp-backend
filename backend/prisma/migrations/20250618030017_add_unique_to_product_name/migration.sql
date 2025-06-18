/*
  Warnings:

  - You are about to drop the column `paymentId` on the `order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `paymentId`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `destination` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `googleId` VARCHAR(255) NULL,
    MODIFY `password` VARCHAR(255) NULL,
    MODIFY `role` ENUM('CLIENT', 'SALES_MANAGER', 'ADMIN') NOT NULL DEFAULT 'CLIENT';

-- CreateIndex
CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);
