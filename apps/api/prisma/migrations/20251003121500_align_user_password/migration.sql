-- Ensure role remains TEXT and not nullable
ALTER TABLE "User"
ALTER COLUMN "role" TYPE TEXT USING "role"::text,
ALTER COLUMN "role" SET NOT NULL;

-- Ensure password column exists and is required
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "password" TEXT;

UPDATE "User"
SET "password" = COALESCE("password", '')
WHERE "password" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "password" SET NOT NULL;

