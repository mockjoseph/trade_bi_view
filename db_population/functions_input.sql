-- For now we will be using RPC functions
-- NNOTE!! Right now for ease of use, all RPC functions assume security definer
--  In Supabase, security definer bypasses RLS entirely, which is generally fine for 
--  an app running on localhost and if you do not leak Supabase Anon key or any piece of the app
--  if you want more security, there will be future updates for using non-rpc functions as security definer

-- In case functions were depracated, comment these out after initial run or if something goes wrong
drop function if exists get_all_jobs(uuid);
drop function if exists form_job_type();
drop function if exists form_job_customer();
drop function if exists get_last_month_metrics(uuid);
drop function if exists get_this_month_metrics(uuid);
drop function if exists get_revenue_by_type(uuid);
drop function if exists get_outstanding_payments(uuid);
drop function if exists get_total_jobs(uuid);
drop function if exists get_recent_jobs(uuid);
drop function if exists get_total_revenue(uuid);



-- get_all_jobs
create or replace function get_all_jobs()
returns table (
  id uuid,
  job_type text,
  first_name text,
  last_name text,
  scheduled_date date,
  completion_date date,
  revenue numeric,
  labor_cost numeric,
  material_cost numeric,
  billing_status text
) as $$
  select
    j.id,
    jt.name as job_type,
    c.first_name,
    c.last_name,
    j.scheduled_date,
    j.completion_date,
    f.revenue,
    f.labor_cost,
    f.material_cost,
    f.billing_status
  from job j
  left join job_types jt on j.type = jt.id
  left join financial f  on j.id = f.id
  left join customer c   on j.customer_id = c.id
  order by j.scheduled_date desc
$$ language sql stable security definer set search_path = public;



-- form_job_type
create or replace function form_job_type()
returns table (id int8, name text) as $$
  select id, name
  from job_types
$$ language sql stable security definer set search_path = public;


-- form_job_customer
create or replace function form_job_customer()
returns table (id uuid, first_name text, last_name text) as $$
  select id, first_name, last_name
  from customer
$$ language sql stable security definer set search_path = public;


-- get_last_month_metrics
create or replace function get_last_month_metrics()
returns table (
  job_count numeric,
  total_revenue numeric,
  total_labor_cost numeric,
  total_material_cost numeric
) as $$
  select count(*), sum(f.revenue), sum(f.labor_cost), sum(f.material_cost)
  from job j
  join financial f on j.id = f.id
  where j.scheduled_date >= date_trunc('month', now() - interval '1 month')
    and j.scheduled_date <  date_trunc('month', now())
$$ language sql stable security definer set search_path = public;


-- get_this_month_metrics
create or replace function get_this_month_metrics()
returns table (
  job_count numeric,
  total_revenue numeric,
  total_labor_cost numeric,
  totall_material_cost numeric
) as $$
  select count(*), sum(f.revenue), sum(f.labor_cost), sum(f.material_cost)
  from job j
  join financial f on j.id = f.id
  where j.scheduled_date >= date_trunc('month', now() - interval '1 month')
$$ language sql stable security definer set search_path = public;


-- get_revenue_by_type
create or replace function get_revenue_by_type()
returns table (job_type text, count bigint, total_revenue numeric) as $$
  select jt.name, count(*) as count, sum(f.revenue) as total_revenue
  from financial f
  join job j        on f.id = j.id
  join job_types jt on j.type = jt.id
  group by jt.id
$$ language sql stable security definer set search_path = public;


-- get_outstanding_payments
create or replace function get_outstanding_payments()
returns table (invoice_count bigint, total_revenue numeric) as $$
  select count(*), coalesce(sum(revenue), 0)
  from financial f
  where f.billing_status = 'pending'
$$ language sql stable security definer set search_path = public;


-- get_total_jobs
create or replace function get_total_jobs()
returns numeric as $$
  select count(*) from job
$$ language sql stable security definer set search_path = public;


-- get_recent_jobs
create or replace function get_recent_jobs()
returns table (
  job_type text,
  customer_first_name text,
  completion_date date,
  revenue numeric,
  status text
) as $$
  select jt.name, c.first_name, j.completion_date, f.revenue, f.billing_status
  from financial f
  join job j        on j.id = f.id
  join job_types jt on jt.id = j.type
  join customer c   on j.customer_id = c.id
$$ language sql stable security definer set search_path = public;


-- get_total_revenue
create or replace function get_total_revenue()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(f.revenue), 0)
  from financial f
  where f.billing_status = 'paid'
$$;


-- Execute permissions
-- Right now all functions are callable using anon key, DO NOT point this at a public URL
-- In future will switch to only authenticated users when switching to FastAPI backend calls only
revoke execute on all functions in schema public from anon, public;

grant execute on function
  get_all_jobs(),
  form_job_type(),
  form_job_customer(),
  get_last_month_metrics(),
  get_this_month_metrics(),
  get_revenue_by_type(),
  get_outstanding_payments(),
  get_total_jobs(),
  get_recent_jobs(),
  get_total_revenue()
to anon, authenticated;
