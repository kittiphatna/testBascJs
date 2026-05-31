# Condo Rental Platform — Project Brief for Claude Code

## ภาพรวมโปรเจค
แพลตฟอร์มนายหน้าเช่าคอนโด ที่ขับเคลื่อนด้วย AI Agent หลายตัว
- เราเป็นนายหน้า หาห้องจาก Facebook / Line OpenChat มาลงในระบบเอง
- ข้อมูลในแอปเป็นข้อมูลของเรา ไม่เปิดเผยข้อมูลเจ้าของห้อง
- ข้อมูลห้องอยู่ตลอดไม่ลบ แม้ถูกเช่าไปแล้ว → ติดตามได้ว่าห้องจะว่างเมื่อไหร่

---

## Tech Stack ที่เลือก
- **Frontend / Web:** Next.js 14+ + Tailwind CSS
- **Mobile App:** Expo (React Native) — Phase หลัง
- **Database + Storage + Auth:** Supabase (PostgreSQL)
- **Deploy:** Vercel (web) + Railway (Python agents)
- **AI Brain:** Claude API (claude-sonnet-4-6)
- **Staging / Task board:** Notion API
- **Notification:** Line Notify / Line Messaging API

---

## Database Schema (7 ตาราง — SQL ไฟล์แนบ: condo_schema.sql)

| ตาราง | หน้าที่ |
|---|---|
| `condos` | ข้อมูลอาคาร/โครงการ พร้อม lat/lng |
| `rooms` | ห้องแต่ละห้อง สถานะ ราคา ขนาด |
| `contracts` | สัญญาเช่า เก็บตลอดไม่ลบ มี renewal_history |
| `tenants` | ข้อมูลผู้เช่า |
| `images` | รูปภาพห้องและอาคาร ใน Supabase Storage |
| `agent_logs` | บันทึกทุก action ของทุก agent |
| `chat_sessions` | ประวัติการคุยของ Chat Agent |

**Views สำคัญ:**
- `expiring_contracts` — ห้องที่จะหมดสัญญาพร้อม days_remaining
- `available_rooms_map` — ห้องว่างพร้อม lat/lng สำหรับหน้าแผนที่

---

## AI Agent Architecture (6 ตัว)

### Master Orchestrator
- รับ task → route ไปยัง agent ที่ถูกต้อง
- จัดลำดับ priority, log ทุก action, escalate เมื่อ agent ติดปัญหา
- Stack: BullMQ + Redis

### A1 — Scout Agent (Python)
- รับ URL โพสต์ Facebook/Line → extract ข้อมูลห้องด้วย Claude API + Vision
- Download รูปภาพ → บันทึกลง Supabase Storage
- บันทึก raw data ลง Notion staging database
- v1: รับ URL ทีละอัน (manual) → v2: semi-auto
- Stack: Python + Playwright + Claude API + Notion API

### A2 — Listing Agent (Python)
- รับข้อมูลดิบจาก Notion staging → แปลงเป็น structured data
- Geocode ที่อยู่ → ได้ lat/lng
- Write ลง Supabase database
- รอ human approve (agent_verified = true) ก่อน publish
- Stack: Python + Claude API + Supabase + Google Geocoding API

### A3 — Chat Agent (Python)
- ตอบลูกค้า 24/7 ผ่าน Line OA และ Web chat
- ค้นหาห้องจาก database ตามความต้องการลูกค้า
- นัดดูห้อง → escalate ต่อนายหน้าจริง
- Stack: Python + Claude API + Line Messaging API + function calling

### A4 — Contract Agent (Python)
- Cron job รายวัน ตรวจ `expiring_contracts` view
- แจ้งเตือนก่อนหมดสัญญา 90/60/30/7 วัน ผ่าน Line Notify
- อัปเดต status ห้องเป็น available อัตโนมัติหลังสัญญาหมด
- สร้าง PDF สัญญาเช่าอัตโนมัติ
- Stack: Python + APScheduler + Line Notify + WeasyPrint

### A5 — Dev & Ops Agent
- Monitor error logs, แจ้งเตือนเมื่อ app มีปัญหา
- Suggest improvements จาก analytics
- Stack: Python + GitHub API + Sentry

### A6 — Pricing Agent
- วิเคราะห์ราคาตลาดในแต่ละทำเล
- แนะนำราคาเช่าที่เหมาะสม
- Stack: Python + web scraper + Claude API

---

## Features หลัก

### หน้า Public (ผู้เช่าเห็น)
1. **หน้าแรก — แผนที่ประเทศไทย** แสดงหมุดคอนโด
   - หมุดสีเขียว = ว่าง, หมุดสีเทา = ไม่ว่าง
   - กดหมุด → popup ข้อมูลเบื้องต้น
2. **หน้าค้นหา** Filter: ราคา / ทำเล / ขนาด / ประเภทห้อง / สิ่งอำนวยความสะดวก
3. **หน้ารายละเอียดห้อง** รูปภาพ, ข้อมูลครบ, ปุ่มติดต่อนายหน้า
4. **Wishlist** บันทึกห้องที่สนใจ

### Admin Panel (นายหน้าใช้)
1. Dashboard: จำนวนห้องว่าง, สัญญาจะหมด, รายได้
2. จัดการห้อง: CRUD + อัปโหลดรูป + เปลี่ยนสถานะ
3. ติดตามสัญญา: timeline ห้องแต่ละห้อง
4. Review queue: ห้องที่ Scout Agent ดึงมา รอ approve

---

## Roadmap การพัฒนา

### Phase 1 — Foundation (สัปดาห์ 1–2)
- [x] ออกแบบ Database Schema ✅
- [ ] ตั้ง Supabase project + รัน schema.sql
- [ ] ตั้ง Notion workspace (staging database สำหรับ Scout Agent)
- [ ] ตั้ง Supabase Storage folder structure

### Phase 2 — App Skeleton (สัปดาห์ 2–4)
- [ ] สร้าง Next.js project skeleton
- [ ] หน้าแรก + แผนที่ (Mapbox หรือ Google Maps)
- [ ] Admin Panel: form ลงข้อมูลห้อง + จัดการสถานะ
- [ ] Connect Supabase Auth

### Phase 3 — Agent แรก (สัปดาห์ 4–6)
- [ ] Scout Agent v1: รับ URL → extract → บันทึก Notion
- [ ] Contract Agent v1: cron แจ้งเตือนสัญญาหมดผ่าน Line

### Phase 4 — Chat + Orchestrator (สัปดาห์ 6–10)
- [ ] Chat Agent: Line OA webhook + Claude API
- [ ] Master Orchestrator: task queue + routing
- [ ] Listing Agent: Notion → Supabase pipeline

---

## โครงสร้าง Folder แนะนำ

```
condo-rental/
├── web/                        # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # หน้าแผนที่
│   │   ├── rooms/[id]/page.tsx
│   │   └── admin/
│   ├── components/
│   └── lib/supabase.ts
├── agents/                     # Python AI agents
│   ├── scout/
│   │   ├── main.py
│   │   ├── extractor.py        # Claude API + Vision
│   │   ├── downloader.py       # รูปภาพ
│   │   └── notion_writer.py
│   ├── contract/
│   │   ├── main.py
│   │   └── notifier.py
│   ├── chat/
│   │   ├── main.py
│   │   └── line_webhook.py
│   └── orchestrator/
│       ├── main.py
│       └── router.py
├── shared/                     # Shared utilities
│   ├── supabase_client.py
│   └── claude_client.py
└── condo_schema.sql            # Database schema ✅
```

---

## Environment Variables ที่ต้องมี

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# Notion
NOTION_API_KEY=
NOTION_STAGING_DB_ID=

# Line
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
LINE_NOTIFY_TOKEN=

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=
GOOGLE_GEOCODING_API_KEY=
```

---

## สิ่งที่ต้องทำก่อนเริ่ม Claude Code

1. สมัคร [Supabase](https://supabase.com) → สร้าง project ใหม่
2. สมัคร [Anthropic Console](https://console.anthropic.com) → เอา API key
3. สมัคร [Notion Developers](https://developers.notion.com) → สร้าง integration
4. สมัคร [Mapbox](https://mapbox.com) → เอา token (ฟรี 50k requests/เดือน)
5. ติดตั้ง Node.js 18+ และ Python 3.11+
6. ติดตั้ง Claude Code: `npm install -g @anthropic-ai/claude-code`

---

## Prompt แรกที่ใช้ใน Claude Code

```
ฉันกำลังสร้าง Condo Rental Platform ที่มี AI Agent หลายตัว
อ่าน project brief ทั้งหมดใน condo_project_brief.md และ condo_schema.sql ก่อน

เริ่มจาก Phase 2:
1. สร้าง Next.js 14 project ใน folder web/ พร้อม Tailwind CSS และ Supabase client
2. สร้างหน้าแรกที่มีแผนที่ประเทศไทยด้วย Mapbox แสดงหมุดห้องว่าง/ไม่ว่าง
3. สร้าง Admin Panel เบื้องต้น: หน้า list ห้อง + form เพิ่มห้องใหม่

ใช้ TypeScript ทุกไฟล์ และ connect Supabase จาก environment variables
```
