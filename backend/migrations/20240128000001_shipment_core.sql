-- Migration: Shipment Core System
-- Description: Defines shipments, addresses, items, and status event logs.

-- 1. Enums and Types
create type public.shipment_status as enum (
  'PENDING',           -- Created, waiting for pickup
  'PICKED_UP',         -- Courier has collected the package
  'IN_TRANSIT',        -- Moving between hubs
  'OUT_FOR_DELIVERY',  -- On last mile vehicle
  'DELIVERED',         -- Successfully delivered
  'CANCELLED',         -- Cancelled by user or admin
  'RETURNED'           -- Returned to sender
);

create type public.address_type as enum ('PICKUP', 'DELIVERY');

-- 2. Shipments Table
create table if not exists public.shipments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null default auth.uid(), -- Owner
  tracking_id text unique not null,
  status public.shipment_status not null default 'PENDING',
  
  -- Dimensions & Weight (Optional totals)
  total_weight_kg numeric(10, 2),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookup by tracking_id and user_id
create index idx_shipments_tracking_id on public.shipments(tracking_id);
create index idx_shipments_user_id on public.shipments(user_id);

-- 3. Shipment Addresses (Pickup & Delivery)
create table if not exists public.shipment_addresses (
  id uuid default gen_random_uuid() primary key,
  shipment_id uuid references public.shipments(id) on delete cascade not null,
  type public.address_type not null,
  
  -- Address Details
  contact_name text not null,
  contact_phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null,
  country text default 'India',
  
  created_at timestamptz default now()
);

create index idx_shipment_addresses_shipment_id on public.shipment_addresses(shipment_id);

-- 4. Shipment Items
create table if not exists public.shipment_items (
  id uuid default gen_random_uuid() primary key,
  shipment_id uuid references public.shipments(id) on delete cascade not null,
  
  description text not null,
  quantity integer default 1,
  weight_kg numeric(10, 2),
  length_cm numeric(10, 2),
  width_cm numeric(10, 2),
  height_cm numeric(10, 2)
);

create index idx_shipment_items_shipment_id on public.shipment_items(shipment_id);

-- 5. Shipment Status Events (Audit Log)
create table if not exists public.shipment_events (
  id uuid default gen_random_uuid() primary key,
  shipment_id uuid references public.shipments(id) on delete cascade not null,
  status public.shipment_status not null,
  
  description text, -- e.g., "Arrived at Mumbai Hub"
  location text,    -- e.g., "Mumbai, MH"
  
  created_at timestamptz default now()
);

create index idx_shipment_events_shipment_id on public.shipment_events(shipment_id);


-- 6. Helper Function: Is Admin?
-- Helper to simplify RLS policies
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.user_profiles
    join public.roles on user_profiles.role_id = roles.id
    where user_profiles.id = auth.uid()
    and roles.name = 'admin'
  );
end;
$$ language plpgsql security definer;


-- 7. RLS Policies

-- Enable RLS
alter table public.shipments enable row level security;
alter table public.shipment_addresses enable row level security;
alter table public.shipment_items enable row level security;
alter table public.shipment_events enable row level security;

-- SHIPMENTS Policies
-- Customers: Create and Read Own
create policy "Customers can view own shipments"
  on public.shipments for select
  using ( auth.uid() = user_id );

create policy "Customers can create shipments"
  on public.shipments for insert
  with check ( auth.uid() = user_id );

-- Admins: Full Access
create policy "Admins can view all shipments"
  on public.shipments for select
  using ( public.is_admin() );

create policy "Admins can update all shipments"
  on public.shipments for update
  using ( public.is_admin() );

create policy "Admins can insert shipments" -- e.g. manual creation
  on public.shipments for insert
  with check ( public.is_admin() );

-- Explicitly block customer updates (Safety measure)
create policy "Customers cannot update shipments"
  on public.shipments for update
  using ( false );


-- 7.1 Status Transition Validation
create or replace function public.validate_status_transition()
returns trigger as $$
begin
  -- Prevent modifying delivered shipments
  if old.status = 'DELIVERED' then
    raise exception 'Delivered shipments cannot change status';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger validate_shipment_status
  before update on public.shipments
  for each row execute procedure public.validate_status_transition();



-- ADDRESSES Policies
-- Linked via shipment_id. User must own the shipment.
create policy "Users can view addresses of their shipments"
  on public.shipment_addresses for select
  using ( exists (select 1 from public.shipments s where s.id = shipment_id and s.user_id = auth.uid()) );

create policy "Users can add addresses to their shipments"
  on public.shipment_addresses for insert
  with check ( exists (select 1 from public.shipments s where s.id = shipment_id and s.user_id = auth.uid()) );

create policy "Admins can manage addresses"
  on public.shipment_addresses for all
  using ( public.is_admin() );


-- ITEMS Policies
create policy "Users can view items of their shipments"
  on public.shipment_items for select
  using ( exists (select 1 from public.shipments s where s.id = shipment_id and s.user_id = auth.uid()) );

create policy "Users can add items to their shipments"
  on public.shipment_items for insert
  with check ( exists (select 1 from public.shipments s where s.id = shipment_id and s.user_id = auth.uid()) );

create policy "Admins can manage items"
  on public.shipment_items for all
  using ( public.is_admin() );


-- EVENTS Policies
-- Events are Read-Only for Customers
create policy "Users can view events of their shipments"
  on public.shipment_events for select
  using ( exists (select 1 from public.shipments s where s.id = shipment_id and s.user_id = auth.uid()) );

-- Admins can Insert events (to update status logs)
create policy "Admins can insert events"
  on public.shipment_events for insert
  with check ( public.is_admin() );

create policy "Admins can view events"
  on public.shipment_events for select
  using ( public.is_admin() );


-- 8. Auto-Generate Tracking ID Function
-- Generates a human-readable ID like 'DEL-12345678' (UUID based substring)
create or replace function public.generate_tracking_id()
returns trigger as $$
begin
  if new.tracking_id is null then
    -- UUID based deterministic ID (Collision resistant)
    new.tracking_id := 'DEL-' || upper(substr(gen_random_uuid()::text, 1, 10));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_tracking_id
  before insert on public.shipments
  for each row execute procedure public.generate_tracking_id();


-- 9. Auto-Log Status Change Trigger
-- When shipment status changes, automatically add an entry to shipment_events
create or replace function public.log_status_change()
returns trigger as $$
begin
  if (old.status is distinct from new.status) then
    insert into public.shipment_events (shipment_id, status, description)
    values (new.id, new.status, 'Status updated to ' || new.status);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_shipment_status_change
  after update on public.shipments
  for each row execute procedure public.log_status_change();

-- Initial status log on creation
create or replace function public.log_initial_status()
returns trigger as $$
begin
  insert into public.shipment_events (shipment_id, status, description)
  values (new.id, new.status, 'Shipment created');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_shipment_created
  after insert on public.shipments
  for each row execute procedure public.log_initial_status();
