-- AlterTable
ALTER TABLE "User" ADD COLUMN     "medicalCentreId" TEXT;

-- CreateIndex
CREATE INDEX "User_medicalCentreId_idx" ON "User"("medicalCentreId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_medicalCentreId_fkey" FOREIGN KEY ("medicalCentreId") REFERENCES "MedicalCentre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
