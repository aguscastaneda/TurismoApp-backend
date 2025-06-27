/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Int`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `status` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `order_status` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_status_fkey` FOREIGN KEY (`status`) REFERENCES `order_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
