-- Table input schema, run in Supabase sql editor for initializing

-- Fresh-install convenience. Comment out if you don't want it.
drop table if exists job_material cascade;
drop table if exists financial    cascade;
drop table if exists job          cascade;
drop table if exists job_types    cascade;
drop table if exists customer     cascade;


-- customer
create table customer (
  id          uuid primary key default gen_random_uuid(),
  first_name  text,
  last_name   text,
  email       text,
  phone       text,
  company     text,
  created_at  timestamptz not null default now()
);


-- job_types  (lookup table)
create table job_types (
  id          bigint generated always as identity primary key,
  name        text not null,
  base_price  numeric
);


-- job
create table job (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references customer (id) on delete restrict,
  type             bigint references job_types (id) on delete restrict,
  description      text,
  scheduled_date   date,
  completion_date  date,
  created_at       timestamptz not null default now()
);


-- financial
-- 1:1 with job via shared primary key (financial.id = job.id).
create table financial (
  id              uuid primary key references job (id) on delete cascade,
  billing_status  text,
  revenue         numeric,
  labor_cost      numeric,
  material_cost   numeric,
  created_at      timestamptz not null default now()
);

-- The status strings your functions look for. Uncomment to enforce them, or change them if you want different cases.
-- alter table financial add constraint financial_billing_status_check
--   check (billing_status in ('pending', 'paid'));


-- job_material
create table job_material (
  id             uuid primary key default gen_random_uuid(),
  job_id         uuid not null references job (id) on delete cascade,
  vendor_name    text not null,
  material_name  text not null,
  buy_date       date not null,
  unit_price     numeric not null,
  quantity       bigint not null,
  line_total     numeric
);


-- Indexes on foreign keys (Postgres does not create these for you)
create index job_customer_id_idx      on job (customer_id);
create index job_type_idx             on job (type);
create index job_scheduled_date_idx   on job (scheduled_date desc);
create index job_material_job_id_idx  on job_material (job_id);
create index financial_status_idx     on financial (billing_status);


-- Optional seed data so a fresh install isn't an empty form
-- insert into job_types (name, base_price) values
--   ('Alteration',   45.00),
--   ('Custom Order', 250.00),
--   ('Repair',       30.00);
