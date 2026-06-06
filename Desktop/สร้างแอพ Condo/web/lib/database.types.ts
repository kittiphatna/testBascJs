export type RoomStatus = 'available' | 'rented' | 'reserved' | 'maintenance' | 'unlisted'
export type RoomType = 'studio' | '1bed' | '2bed' | '3bed' | 'penthouse'
export type Furnishing = 'fully' | 'partly' | 'unfurnished'

export interface Condo {
  id: string
  name: string
  slug: string
  address: string | null
  district: string | null
  province: string
  lat: number | null
  lng: number | null
  developer: string | null
  build_year: number | null
  total_floors: number | null
  total_units: number | null
  facilities: string[]
  nearby_places: string[]
  cover_image_url: string | null
  source_url: string | null
  source_platform: string | null
  agent_verified: boolean
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  condo_id: string
  room_number: string | null
  floor: number | null
  size_sqm: number | null
  room_type: RoomType | null
  bedrooms: number
  bathrooms: number
  furnishing: Furnishing
  view_direction: string | null
  price_thb: number | null
  status: RoomStatus
  available_from: string | null
  tags: string[]
  description: string | null
  agent_verified: boolean
  room_code: string | null
  owner_name: string | null
  owner_phone: string | null
  owner_facebook: string | null
  owner_line_id: string | null
  listed_at: string
  updated_at: string
}

export interface AvailableRoomMap {
  id: string
  room_type: RoomType | null
  size_sqm: number | null
  price_thb: number | null
  bedrooms: number
  furnishing: Furnishing
  available_from: string | null
  tags: string[]
  condo_id: string
  condo_name: string
  district: string | null
  province: string
  lat: number | null
  lng: number | null
  facilities: string[]
  cover_image_url: string | null
}

export interface Contract {
  id: string
  room_id: string
  tenant_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit_amount: number | null
  status: 'active' | 'expired' | 'terminated' | 'renewed'
  pdf_url: string | null
  created_at: string
}

export interface Tenant {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  line_id: string | null
  nationality: string
  occupation: string | null
  notes: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      condos: { Row: Condo; Insert: Omit<Condo, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Condo> }
      rooms: { Row: Room; Insert: Omit<Room, 'id' | 'listed_at' | 'updated_at'>; Update: Partial<Room> }
      contracts: { Row: Contract; Insert: Omit<Contract, 'id' | 'created_at'>; Update: Partial<Contract> }
      tenants: { Row: Tenant; Insert: Omit<Tenant, 'id' | 'created_at'>; Update: Partial<Tenant> }
    }
    Views: {
      available_rooms_map: { Row: AvailableRoomMap }
    }
  }
}
