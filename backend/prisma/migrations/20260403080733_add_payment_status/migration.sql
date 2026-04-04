-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "callLog" JSONB,
ADD COLUMN     "deliveryPartnerId" INTEGER,
ADD COLUMN     "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "userPhoneMasked" TEXT;

-- CreateTable
CREATE TABLE "DeliveryPartner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPartner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryPartner_isActive_idx" ON "DeliveryPartner"("isActive");

-- CreateIndex
CREATE INDEX "DeliveryPartner_phone_idx" ON "DeliveryPartner"("phone");

-- CreateIndex
CREATE INDEX "Order_deliveryStatus_idx" ON "Order"("deliveryStatus");

-- CreateIndex
CREATE INDEX "Order_deliveryPartnerId_idx" ON "Order"("deliveryPartnerId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryPartnerId_fkey" FOREIGN KEY ("deliveryPartnerId") REFERENCES "DeliveryPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
