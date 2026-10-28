-- CreateEnum
CREATE TYPE "SignatureParty" AS ENUM ('CLIENT', 'FREELANCER');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'SIGNED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('NORMAL', 'VAT_SPECIAL');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('REQUESTED', 'ISSUED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentProvider" ADD VALUE 'ALIPAY';
ALTER TYPE "PaymentProvider" ADD VALUE 'WECHAT_PAY';
ALTER TYPE "PaymentProvider" ADD VALUE 'BANK_TRANSFER';

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "clientSignedAt" TIMESTAMP(3),
ADD COLUMN     "content" TEXT,
ADD COLUMN     "freelancerSignedAt" TIMESTAMP(3),
ALTER COLUMN "currency" SET DEFAULT 'CNY';

-- AlterTable
ALTER TABLE "freelancer_profiles" ALTER COLUMN "currency" SET DEFAULT 'CNY';

-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "currency" SET DEFAULT 'CNY';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "outTradeNo" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ALTER COLUMN "currency" SET DEFAULT 'CNY';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "realName" TEXT;

-- CreateTable
CREATE TABLE "contract_signatures" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "party" "SignatureParty" NOT NULL,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "signerName" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "providerRef" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "taxNumber" TEXT,
    "type" "InvoiceType" NOT NULL DEFAULT 'NORMAL',
    "email" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "registeredAddress" TEXT,
    "registeredPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "type" "InvoiceType" NOT NULL DEFAULT 'NORMAL',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'REQUESTED',
    "title" TEXT NOT NULL,
    "taxNumber" TEXT,
    "email" TEXT,
    "providerRef" TEXT,
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contract_signatures_contractId_party_idx" ON "contract_signatures"("contractId", "party");

-- CreateIndex
CREATE UNIQUE INDEX "contract_signatures_contractId_userId_key" ON "contract_signatures"("contractId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_profiles_userId_key" ON "invoice_profiles"("userId");

-- CreateIndex
CREATE INDEX "invoices_contractId_status_idx" ON "invoices"("contractId", "status");

-- CreateIndex
CREATE INDEX "invoices_applicantId_idx" ON "invoices"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_outTradeNo_key" ON "payments"("outTradeNo");

-- AddForeignKey
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_profiles" ADD CONSTRAINT "invoice_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
