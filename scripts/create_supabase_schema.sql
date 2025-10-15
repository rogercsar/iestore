-- Supabase schema for iestore/incrm
-- Run this script in Supabase SQL editor or any psql client

-- Extensions (UUID generation and helpers)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- Products
-- =====================================
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text UNIQUE NOT NULL,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  cost numeric(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  unit_price numeric(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  photo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products (updated_at);

-- Trigger function to auto-update snake_case updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Ensure products trigger exists (idempotent)
DROP TRIGGER IF EXISTS trg_products_set_updated_at ON products;
CREATE TRIGGER trg_products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =====================================
-- Customers
-- =====================================
CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  total_purchases numeric(12,2) NOT NULL DEFAULT 0,
  total_value numeric(12,2) NOT NULL DEFAULT 0,
  pending_amount numeric(12,2) NOT NULL DEFAULT 0,
  last_purchase timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);

-- Ensure customers trigger exists (idempotent)
DROP TRIGGER IF EXISTS trg_customers_set_updated_at ON customers;
CREATE TRIGGER trg_customers_set_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =====================================
-- Sales
-- =====================================
CREATE TABLE IF NOT EXISTS sales (
  id bigserial PRIMARY KEY,
  date_iso timestamptz NOT NULL,
  product text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_value numeric(12,2) NOT NULL CHECK (total_value >= 0),
  total_cost numeric(12,2) NOT NULL CHECK (total_cost >= 0),
  profit numeric(12,2) NOT NULL CHECK (profit >= 0),
  customer_name text,
  customer_phone text,
  payment_method text,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','pending','partial')),
  sale_type text NOT NULL DEFAULT 'sale',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional relational columns for future normalization (not used by current code)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS product_id text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id text;

-- Optional foreign keys (deferred; enable when app uses IDs)
-- ALTER TABLE sales ADD CONSTRAINT fk_sales_product
--   FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE SET NULL;
-- ALTER TABLE sales ADD CONSTRAINT fk_sales_customer
--   FOREIGN KEY (customer_id) REFERENCES customers(id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_date_iso ON sales (date_iso DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer_phone ON sales (customer_phone);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales (status);

-- =====================================
-- Users
-- =====================================
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  username text UNIQUE,
  password text,
  phone text,
  photo text,
  role text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Ensure users trigger exists (idempotent)
DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =====================================
-- Promotions
-- =====================================
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

CREATE INDEX IF NOT EXISTS idx_promotions_start_at ON promotions ("startAt");
CREATE INDEX IF NOT EXISTS idx_promotions_end_at ON promotions ("endAt");

-- Trigger function for camelCase updatedAt
CREATE OR REPLACE FUNCTION set_updatedAt()
RETURNS trigger AS $func$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Ensure promotions trigger exists (idempotent)
DROP TRIGGER IF EXISTS trg_promotions_set_updated_at ON promotions;
CREATE TRIGGER trg_promotions_set_updated_at
BEFORE UPDATE ON promotions
FOR EACH ROW EXECUTE PROCEDURE set_updatedAt();

-- =====================================
-- Campaigns
-- =====================================
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

CREATE INDEX IF NOT EXISTS idx_campaigns_public_id ON campaigns ("publicId");

-- Ensure campaigns trigger exists (idempotent)
DROP TRIGGER IF EXISTS trg_campaigns_set_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_set_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE PROCEDURE set_updatedAt();

-- =====================================
-- Seed admin user (optional; replace by secure flow in production)
-- NOTE: Prefer Supabase Auth or hashed passwords. This is only for local testing.
INSERT INTO users (id, name, email, username, password, role, status)
VALUES ('user_admin_adistore', 'Admin IEStore', 'admin@iestore.local', 'adiestore', 'Admin@iestore1', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;