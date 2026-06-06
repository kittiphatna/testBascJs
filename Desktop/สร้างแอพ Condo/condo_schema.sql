-- ============================================================
-- CONDO RENTAL APP — Database Schema (Supabase / PostgreSQL)
-- ============================================================
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";  -- สำหรับ geolocation query


-- ============================================================
-- 1. CONDOS — ข้อมูลอาคาร/โครงการ
-- ============================================================
create table condos (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text unique not null,           -- URL-friendly name เช่น "the-line-asok"
  address         text,
  district        text,
  province        text not null default 'กรุงเทพมหานคร',
  lat             float,
  lng             float,
  location        geography(Point, 4326),         -- PostGIS point สำหรับ geo query
  developer       text,
  build_year      int,
  total_floors    int,
  total_units     int,
  facilities      text[] default '{}',            -- ['ฟิตเนส','สระว่ายน้ำ','ที่จอดรถ']
  cover_image_url text,
  -- AI Agent metadata
  source_url      text,                           -- URL ต้นทางที่ Scout Agent ดึงมา
  source_platform text,                           -- 'facebook' | 'line' | 'manual'
  agent_verified  boolean default false,          -- นายหน้า review แล้ว
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger condos_updated_at before update on condos
  for each row execute function update_updated_at();


-- ============================================================
-- 2. ROOMS — ข้อมูลห้องแต่ละห้อง
-- ============================================================
create table rooms (
  id              uuid primary key default uuid_generate_v4(),
  condo_id        uuid not null references condos(id) on delete cascade,
  room_number     text,                           -- เลขห้อง เช่น "2304"
  floor           int,
  size_sqm        float,
  room_type       text,                           -- 'studio' | '1bed' | '2bed' | '3bed' | 'penthouse'
  bedrooms        int default 0,
  bathrooms       int default 1,
  furnishing      text default 'fully',           -- 'fully' | 'partly' | 'unfurnished'
  view_direction  text,                           -- 'city' | 'pool' | 'garden' | 'street'
  price_thb       int,                            -- ราคาต่อเดือน (บาท)
  -- สถานะห้อง
  status          text not null default 'available',
                  -- 'available' | 'rented' | 'reserved' | 'maintenance' | 'unlisted'
  available_from  date,                           -- ว่างตั้งแต่วันไหน
  tags            text[] default '{}',            -- ['ห้องมุม','วิวดี','ชั้นสูง']
  description     text,                           -- รายละเอียดเพิ่มเติม
  -- AI Agent metadata
  agent_metadata  jsonb default '{}',             -- ข้อมูลดิบที่ Scout Agent ดึงมา
  source_ref      text,                           -- reference ID ใน Notion staging
  source_url      text,
  source_platform text,
  agent_verified  boolean default false,
  listed_at       timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger rooms_updated_at before update on rooms
  for each row execute function update_updated_at();

-- Index สำคัญสำหรับ query
create index idx_rooms_condo_id  on rooms(condo_id);
create index idx_rooms_status    on rooms(status);
create index idx_rooms_price     on rooms(price_thb);


-- ============================================================
-- 3. TENANTS — ข้อมูลผู้เช่า
-- ============================================================
create table tenants (
  id                uuid primary key default uuid_generate_v4(),
  full_name         text not null,
  phone             text,
  email             text,
  line_id           text,
  id_card_number    text,                         -- เลขบัตรประชาชน (เก็บแบบ encrypted ได้)
  nationality       text default 'ไทย',
  occupation        text,
  emergency_contact jsonb default '{}',
                    -- {"name": "...", "phone": "...", "relation": "..."}
  notes             text,                         -- note ของนายหน้า
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create trigger tenants_updated_at before update on tenants
  for each row execute function update_updated_at();


-- ============================================================
-- 4. CONTRACTS — สัญญาเช่า (เก็บตลอดไม่ลบ)
-- ============================================================
create table contracts (
  id               uuid primary key default uuid_generate_v4(),
  room_id          uuid not null references rooms(id),
  tenant_id        uuid not null references tenants(id),
  -- วันที่สัญญา
  start_date       date not null,
  end_date         date not null,
  -- การเงิน
  monthly_rent     int not null,                  -- ค่าเช่าต่อเดือน
  deposit_amount   int,                           -- เงินประกัน
  -- สถานะ
  status           text not null default 'active',
                   -- 'active' | 'expired' | 'terminated' | 'renewed'
  termination_date date,                          -- กรณียกเลิกก่อนกำหนด
  termination_note text,
  -- เอกสาร
  pdf_url          text,                          -- URL ไฟล์สัญญา PDF
  -- ประวัติการต่อสัญญา
  renewal_history  jsonb default '[]',
                   -- [{"renewed_at": "...", "old_end": "...", "new_end": "..."}]
  parent_contract_id uuid references contracts(id), -- ถ้าเป็นสัญญาต่อ
  -- Contract Agent: tracking แจ้งเตือน
  notified_90d     timestamptz,                   -- เวลาที่ส่งแจ้งเตือน 90 วัน
  notified_60d     timestamptz,
  notified_30d     timestamptz,
  notified_7d      timestamptz,
  -- AI Agent metadata
  created_by       text default 'manual',         -- 'manual' | 'agent'
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create trigger contracts_updated_at before update on contracts
  for each row execute function update_updated_at();

create index idx_contracts_room_id    on contracts(room_id);
create index idx_contracts_tenant_id  on contracts(tenant_id);
create index idx_contracts_end_date   on contracts(end_date);  -- Contract Agent ใช้บ่อย
create index idx_contracts_status     on contracts(status);


-- ============================================================
-- 5. IMAGES — รูปภาพห้องและอาคาร
-- ============================================================
create table images (
  id              uuid primary key default uuid_generate_v4(),
  room_id         uuid references rooms(id) on delete cascade,
  condo_id        uuid references condos(id) on delete cascade,  -- รูปของอาคาร (ไม่ผูกกับห้อง)
  storage_path    text not null,                  -- path ใน Supabase Storage
  public_url      text,                           -- CDN URL สำหรับแสดงผล
  image_type      text default 'room',
                  -- 'room' | 'building' | 'facilities' | 'floor_plan' | 'document'
  sort_order      int default 0,                  -- ลำดับการแสดง
  is_cover        boolean default false,          -- รูป cover ของห้อง
  width           int,
  height          int,
  file_size_kb    int,
  -- AI Agent metadata
  source_url      text,                           -- URL ต้นทาง (จาก Facebook ฯลฯ)
  uploaded_by     text default 'manual',          -- 'manual' | 'scout_agent'
  uploaded_at     timestamptz default now()
);

create index idx_images_room_id  on images(room_id);
create index idx_images_condo_id on images(condo_id);


-- ============================================================
-- 6. AGENT_LOGS — บันทึกทุก action ของทุก Agent
-- ============================================================
create table agent_logs (
  id             uuid primary key default uuid_generate_v4(),
  agent_name     text not null,
                 -- 'scout' | 'listing' | 'chat' | 'contract' | 'pricing' | 'orchestrator'
  action         text not null,                   -- เช่น 'extract_room_data', 'send_notification'
  status         text not null,                   -- 'success' | 'failed' | 'skipped' | 'pending'
  -- References (nullable — agent ไม่ได้ทำงานเกี่ยวกับ entity เสมอ)
  room_id        uuid references rooms(id),
  condo_id       uuid references condos(id),
  contract_id    uuid references contracts(id),
  -- ข้อมูล
  input_data     jsonb default '{}',
  output_data    jsonb default '{}',
  error_message  text,
  duration_ms    int,
  -- Human review
  needs_review   boolean default false,           -- ถ้า agent ไม่มั่นใจ → flag ให้คน review
  reviewed_by    text,
  reviewed_at    timestamptz,
  created_at     timestamptz default now()
);

create index idx_agent_logs_agent_name   on agent_logs(agent_name);
create index idx_agent_logs_needs_review on agent_logs(needs_review) where needs_review = true;
create index idx_agent_logs_created_at   on agent_logs(created_at desc);


-- ============================================================
-- 7. CHAT_SESSIONS — ประวัติการคุยของ Chat Agent
-- ============================================================
create table chat_sessions (
  id             uuid primary key default uuid_generate_v4(),
  platform       text not null,                   -- 'line' | 'web' | 'facebook'
  user_ref       text not null,                   -- Line userId / session token
  tenant_id      uuid references tenants(id),     -- ถ้า identify ตัวตนได้
  messages       jsonb default '[]',
                 -- [{"role": "user"|"assistant", "content": "...", "ts": "..."}]
  context        jsonb default '{}',              -- ข้อมูลที่ agent จำไว้ในการคุย
  status         text default 'active',           -- 'active' | 'closed' | 'escalated'
  escalated_to   text,                            -- ชื่อนายหน้าที่รับต่อ
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create trigger chat_sessions_updated_at before update on chat_sessions
  for each row execute function update_updated_at();


-- ============================================================
-- VIEW: ห้องที่ใกล้หมดสัญญา (Contract Agent ใช้)
-- ============================================================
create or replace view expiring_contracts as
select
  c.id                                          as contract_id,
  c.end_date,
  c.status,
  c.notified_30d,
  c.notified_60d,
  c.notified_90d,
  (c.end_date - current_date)                   as days_remaining,
  r.id                                          as room_id,
  r.room_number,
  r.price_thb,
  co.name                                       as condo_name,
  co.district,
  t.full_name                                   as tenant_name,
  t.phone                                       as tenant_phone,
  t.line_id                                     as tenant_line_id
from contracts c
join rooms   r  on r.id  = c.room_id
join condos  co on co.id = r.condo_id
join tenants t  on t.id  = c.tenant_id
where c.status = 'active'
  and c.end_date >= current_date
order by c.end_date asc;


-- ============================================================
-- VIEW: ห้องว่างทั้งหมด (หน้าแผนที่และ search ใช้)
-- ============================================================
create or replace view available_rooms_map as
select
  r.id,
  r.room_type,
  r.size_sqm,
  r.price_thb,
  r.bedrooms,
  r.furnishing,
  r.available_from,
  r.tags,
  co.id          as condo_id,
  co.name        as condo_name,
  co.district,
  co.province,
  co.lat,
  co.lng,
  co.facilities,
  co.cover_image_url
from rooms r
join condos co on co.id = r.condo_id
where r.status = 'available'
  and r.agent_verified = true;


-- ============================================================
-- ROW LEVEL SECURITY (Supabase)
-- ============================================================
alter table condos         enable row level security;
alter table rooms          enable row level security;
alter table contracts      enable row level security;
alter table tenants        enable row level security;
alter table images         enable row level security;
alter table agent_logs     enable row level security;
alter table chat_sessions  enable row level security;

-- Public: อ่าน available_rooms_map ได้ (ผู้เช่าดูได้)
create policy "public can view available rooms"
  on rooms for select
  using (status = 'available' and agent_verified = true);

create policy "public can view condos"
  on condos for select
  using (true);

create policy "public can view images"
  on images for select
  using (true);

-- Admin (authenticated): ทำได้ทุกอย่าง
create policy "admin full access rooms"
  on rooms for all
  using (auth.role() = 'authenticated');

create policy "admin full access condos"
  on condos for all
  using (auth.role() = 'authenticated');

create policy "admin full access contracts"
  on contracts for all
  using (auth.role() = 'authenticated');

create policy "admin full access tenants"
  on tenants for all
  using (auth.role() = 'authenticated');

create policy "admin full access agent_logs"
  on agent_logs for all
  using (auth.role() = 'authenticated');
