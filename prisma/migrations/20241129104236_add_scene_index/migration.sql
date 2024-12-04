/*
  Warnings:

  - Added the required column `indexInProject` to the `scenes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scenes` ADD COLUMN `indexInProject` INTEGER NOT NULL;
