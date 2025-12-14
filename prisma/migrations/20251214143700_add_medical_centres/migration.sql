-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "medicalCentreId" TEXT;

-- CreateTable
CREATE TABLE "MedicalCentre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "license" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalCentre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalCentre_status_idx" ON "MedicalCentre"("status");

-- CreateIndex
CREATE INDEX "ProviderProfile_medicalCentreId_idx" ON "ProviderProfile"("medicalCentreId");

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_medicalCentreId_fkey" FOREIGN KEY ("medicalCentreId") REFERENCES "MedicalCentre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
