export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          creator_id: string
          creator_name: string
          title: string
          description: string
          goal_amount: number
          raised_amount: number
          category: 'medical' | 'education' | 'mosque' | 'sadaqa' | 'emergency' | 'business'
          cover_image_url: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          creator_name: string
          title: string
          description: string
          goal_amount: number
          raised_amount?: number
          category: 'medical' | 'education' | 'mosque' | 'sadaqa' | 'emergency' | 'business'
          cover_image_url: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          creator_name?: string
          title?: string
          description?: string
          goal_amount?: number
          raised_amount?: number
          category?: 'medical' | 'education' | 'mosque' | 'sadaqa' | 'emergency' | 'business'
          cover_image_url?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          featured?: boolean
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          campaign_id: string
          donor_name: string
          amount: number
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          donor_name: string
          amount: number
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          donor_name?: string
          amount?: number
          is_anonymous?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
