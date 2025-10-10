-- Create required extensions for UUID generation (use what's available)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "discountPercent" numeric NOT NULL,
  "startAt" timestamptz NOT NULL,
  "endAt" timestamptz NOT NULL,
  "products" jsonb NOT NULL DEFAULT '[]',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- Useful indexes for promotions
CREATE INDEX IF NOT EXISTS idx_promotions_start_at ON promotions ("startAt");
CREATE INDEX IF NOT EXISTS idx_promotions_end_at ON promotions ("endAt");

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "promotionIds" jsonb NOT NULL DEFAULT '[]',
  "audience" text NOT NULL DEFAULT 'todos',
  "channel" text NOT NULL CHECK ("channel" IN ('email','whatsapp')),
  "publicId" text UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- Useful indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_public_id ON campaigns ("publicId");

-- Trigger to auto-update updatedAt on ROW UPDATE (optional, if you have plpgsql)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW."updatedAt" = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_promotions_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_promotions_set_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_campaigns_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_campaigns_set_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END$$;


