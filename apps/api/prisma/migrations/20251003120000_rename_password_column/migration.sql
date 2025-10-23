-- Drop the old passwordHash column and replace it with password

ALTER TABLE "User"
ADD COLUMN "password" TEXT;

UPDATE "User"
SET "password" = "passwordHash"
WHERE "passwordHash" IS NOT NULL;

ALTER TABLE "User"
ALTER COLUMN "password" SET NOT NULL;

ALTER TABLE "User"
DROP COLUMN "passwordHash";

