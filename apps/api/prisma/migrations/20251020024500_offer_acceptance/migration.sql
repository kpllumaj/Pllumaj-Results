-- Rename existing OfferStatus enum values to match new lowercase mappings
ALTER TYPE "OfferStatus" RENAME VALUE 'PENDING' TO 'pending';
ALTER TYPE "OfferStatus" RENAME VALUE 'ACCEPTED' TO 'accepted';
ALTER TYPE "OfferStatus" RENAME VALUE 'DECLINED' TO 'declined';
ALTER TYPE "OfferStatus" RENAME VALUE 'EXPIRED' TO 'expired';
