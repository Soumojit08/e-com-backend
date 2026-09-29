ALTER TABLE "Address"
ADD COLUMN "name" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "state" TEXT;

ALTER TABLE "Order"
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
ADD COLUMN "razorpayOrderId" TEXT;

CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");