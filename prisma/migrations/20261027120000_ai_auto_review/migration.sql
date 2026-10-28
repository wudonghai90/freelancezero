-- LLM pre-screen of registration data (name, location, headline/bio, company).
CREATE TYPE "AutoReviewStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'PASSED', 'FLAGGED', 'FAILED');

ALTER TABLE "users"
  ADD COLUMN "autoReviewStatus" "AutoReviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN "autoReviewScore" INTEGER,
  ADD COLUMN "autoReviewReason" TEXT,
  ADD COLUMN "autoReviewedAt" TIMESTAMP(3);
