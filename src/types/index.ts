export type Category = 'medical' | 'education' | 'mosque' | 'sadaqa' | 'emergency' | 'business'

export type CampaignStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export type MediaItem = {
  url: string
  type: 'image' | 'video'
}

export type Campaign = {
  id: string
  creator_id: string
  creator_name: string
  title: string
  description: string
  goal_amount: number
  raised_amount: number
  category: Category
  cover_image_url: string
  media_urls: MediaItem[]
  status: CampaignStatus
  featured: boolean
  created_at: string
}

export type PaymentStatus = 'pending' | 'completed' | 'failed'

export type PayoutMethod = 'stripe' | 'paypal' | 'wise'

export type Donation = {
  id: string
  campaign_id: string
  donor_name: string
  amount: number
  is_anonymous: boolean
  message?: string
  payment_status: PaymentStatus
  stripe_session_id?: string
  cover_platform_fee: boolean
  platform_fee: number
  stripe_fee: number
  donor_total_paid: number
  net_to_campaign: number
  created_at: string
}

export type User = {
  id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  payout_method?: PayoutMethod
  payout_email?: string
  created_at: string
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'mosque', label: 'Mosque' },
  { value: 'sadaqa', label: 'Sadaqa / Waqf' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'business', label: 'Business Support' },
]
