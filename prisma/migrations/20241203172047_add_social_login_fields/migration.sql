-- AlterTable
ALTER TABLE `users` ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `providerId` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;
