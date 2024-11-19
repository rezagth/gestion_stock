/*
  Warnings:

  - A unique constraint covering the columns `[materielRemplaceId]` on the table `Materiel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `materiel` ADD COLUMN `materielRemplaceId` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('INSTALLE', 'REMPLACE', 'EN_REPARATION') NOT NULL DEFAULT 'INSTALLE';

-- CreateIndex
CREATE UNIQUE INDEX `Materiel_materielRemplaceId_key` ON `Materiel`(`materielRemplaceId`);

-- AddForeignKey
ALTER TABLE `Materiel` ADD CONSTRAINT `Materiel_materielRemplaceId_fkey` FOREIGN KEY (`materielRemplaceId`) REFERENCES `Materiel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
