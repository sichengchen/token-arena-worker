ALTER TABLE "user"
ADD COLUMN "username" TEXT;

UPDATE "user"
SET "username" = lower(
    CASE
      WHEN nullif(regexp_replace(split_part("email", '@', 1), '[^a-zA-Z0-9_.]+', '', 'g'), '') IS NOT NULL THEN left(
        nullif(regexp_replace(split_part("email", '@', 1), '[^a-zA-Z0-9_.]+', '', 'g'), ''),
        21
      ) || '_' || substring(md5("id"), 1, 8)
      ELSE 'user_' || substring(md5("id"), 1, 24)
    END
  )
WHERE
  "username" IS NULL;

ALTER TABLE "user"
ALTER COLUMN "username"
SET NOT NULL;

CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
