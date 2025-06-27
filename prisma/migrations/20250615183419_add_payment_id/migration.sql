/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to drop the `order_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `order_status_fkey`;

-- AlterTable
ALTER TABLE `order` MODIFY `total` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` TINYINT NOT NULL DEFAULT 0,
    MODIFY `paymentId` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL,
    MODIFY `image` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `name` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `order_status`;

-- CreateTable
CREATE TABLE `OrderStatus` (
    `id` TINYINT NOT NULL,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_status_fkey` FOREIGN KEY (`status`) REFERENCES `OrderStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
