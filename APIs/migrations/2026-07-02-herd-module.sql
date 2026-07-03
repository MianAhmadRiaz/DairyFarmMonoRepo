-- Herd Management module rectification — run once against EXISTING databases.
-- (Fresh databases get the correct schema automatically from sequelize.sync,
--  which only creates missing tables and never alters existing ones.)

-- 1. Drop wrong unique constraints on animals: a tag must be reusable after an
--    animal is removed, and status FKs are not globally unique.
ALTER TABLE animals DROP CONSTRAINT IF EXISTS "animals_tagId_key";
ALTER TABLE animals DROP CONSTRAINT IF EXISTS "animals_pregnancyStatusId_key";
ALTER TABLE animals DROP CONSTRAINT IF EXISTS "animals_lactationStatusId_key";

-- 2. New animalCategory value for male calves.
ALTER TYPE "enum_animals_animalCategory" ADD VALUE IF NOT EXISTS 'calves';

-- 3. Removal history: persist sale price and cull reason; allow tagless removals.
ALTER TABLE animal_removal_history ADD COLUMN IF NOT EXISTS "removalReason" VARCHAR(255);
ALTER TABLE animal_removal_history ADD COLUMN IF NOT EXISTS "salePrice" FLOAT;
ALTER TABLE animal_removal_history ALTER COLUMN "oldTagId" DROP NOT NULL;

-- 4. animal_treatments is a NEW table — sequelize.sync({ force: false })
--    creates it automatically on next boot. Nothing to do here.

-- 5. Data repair: pregnant flag was never set by old code; rebuild it from the
--    denormalized pregnancy_status string.
UPDATE animals SET ispregnant = true
WHERE pregnancy_status = 'pregnant' AND "isDeleted" = false AND (ispregnant = false OR ispregnant IS NULL);

-- 6. Data repair: free tags still marked used by animals that were removed
--    before removal started releasing tags.
UPDATE tag t SET is_used = false
WHERE t.is_used = true
  AND NOT EXISTS (
    SELECT 1 FROM animals a WHERE a."tagId" = t.uuid AND a."isDeleted" = false
  );
