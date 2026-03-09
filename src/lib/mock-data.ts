import { Campaign, Donation, User } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@amanatick.com',
    full_name: 'Admin User',
    phone: '+1234567890',
    is_admin: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'ahmad@example.com',
    full_name: 'Ahmad Rahman',
    phone: '+1234567891',
    is_admin: false,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'sarah@example.com',
    full_name: 'Sarah Johnson',
    phone: '+1234567892',
    is_admin: false,
    created_at: '2024-02-01T00:00:00Z',
  },
]

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    creator_id: '2',
    creator_name: 'Ahmad Rahman',
    title: 'Help Yusuf Get Life-Saving Heart Surgery',
    description: `Yusuf is a 7-year-old boy who needs urgent heart surgery. His family cannot afford the medical costs, and time is running out.

The surgery costs $15,000 and needs to happen within the next two months. Your donation, no matter how small, can help save Yusuf's life.

All funds will go directly to the hospital for Yusuf's treatment. We will provide regular updates on his progress.

May Allah reward you for your generosity.`,
    goal_amount: 15000,
    raised_amount: 8750,
    category: 'medical',
    cover_image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    status: 'approved',
    media_urls: [],
    featured: true,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '2',
    creator_id: '3',
    creator_name: 'Sarah Johnson',
    title: 'Build a School in Rural Indonesia',
    description: `Children in a remote village in Indonesia walk 3 hours each day to reach the nearest school. We want to build a primary school in their village.

The school will serve 200 children and provide them with quality education close to home. It will include 6 classrooms, a library, and proper sanitation facilities.

Your contribution will help shape the future of these children and their community.`,
    goal_amount: 50000,
    raised_amount: 23400,
    category: 'education',
    cover_image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
    media_urls: [],
    status: 'approved',
    featured: true,
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    creator_id: '2',
    creator_name: 'Ahmad Rahman',
    title: 'Restore Historic Mosque in Bosnia',
    description: `A historic mosque built in the 15th century is in urgent need of restoration. The roof is leaking, walls are cracking, and the minaret needs reinforcement.

This mosque serves over 500 worshippers daily and is an important part of Islamic heritage. Help us preserve this sacred space for future generations.

Funds will be used for structural repairs, roof replacement, and interior restoration while maintaining the original architectural style.`,
    goal_amount: 30000,
    raised_amount: 17800,
    category: 'mosque',
    cover_image_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800',
    media_urls: [],
    status: 'approved',
    featured: true,
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '4',
    creator_id: '3',
    creator_name: 'Sarah Johnson',
    title: 'Ramadan Food Packages for 500 Families',
    description: `This Ramadan, help us provide food packages to 500 families in need around the world. Each package contains essential items for the holy month including dates, rice, oil, and other staples.

Cost per family package: $50

Together, we can ensure no family goes hungry during this blessed month. Every contribution counts!`,
    goal_amount: 25000,
    raised_amount: 12500,
    category: 'sadaqa',
    cover_image_url: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800',
    media_urls: [],
    status: 'approved',
    featured: false,
    created_at: '2024-02-10T00:00:00Z',
  },
  {
    id: '5',
    creator_id: '2',
    creator_name: 'Ahmad Rahman',
    title: 'Emergency Relief for Flood Victims',
    description: `Following recent devastating floods, thousands of families have lost their homes and belongings. They urgently need shelter, food, and medical supplies.

Your donation will help provide:
- Emergency tents and blankets
- Food and clean water
- Medical supplies and first aid
- Clothing and hygiene products

Every dollar helps. Please give generously.`,
    goal_amount: 100000,
    raised_amount: 67200,
    category: 'emergency',
    cover_image_url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
    media_urls: [],
    status: 'approved',
    featured: true,
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '6',
    creator_id: '3',
    creator_name: 'Sarah Johnson',
    title: 'Support Women Artisans Cooperative',
    description: `Help us establish a women's cooperative that will provide sustainable income for 30 women through traditional crafts.

The funding will cover:
- Workshop space rental
- Raw materials
- Training programs
- Marketing and sales support

Empower these women to support their families while preserving traditional artisan crafts.`,
    goal_amount: 18000,
    raised_amount: 4500,
    category: 'business',
    cover_image_url: 'https://images.unsplash.com/photo-1559070169-a3077159ee16?w=800',
    media_urls: [],
    status: 'approved',
    featured: false,
    created_at: '2024-02-05T00:00:00Z',
  },
  {
    id: '7',
    creator_id: '2',
    creator_name: 'Ahmad Rahman',
    title: 'Cancer Treatment for Sister Khadija',
    description: `Khadija, a 45-year-old mother of three, has been diagnosed with breast cancer. She needs chemotherapy and surgery that her family cannot afford.

Total treatment cost: $20,000

Khadija has dedicated her life to teaching children in her community. Now she needs our help to fight this battle. Your sadaqa jariya could save her life.`,
    goal_amount: 20000,
    raised_amount: 15600,
    category: 'medical',
    cover_image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    media_urls: [],
    status: 'approved',
    featured: false,
    created_at: '2024-01-25T00:00:00Z',
  },
  {
    id: '8',
    creator_id: '3',
    creator_name: 'Sarah Johnson',
    title: 'Scholarships for Orphan Students',
    description: `Provide educational scholarships for 50 orphan students to continue their high school and university education.

Each scholarship covers:
- Tuition fees
- Books and supplies
- Transportation
- Monthly stipend

Education is the key to breaking the cycle of poverty. Help these young people build a better future.`,
    goal_amount: 40000,
    raised_amount: 8900,
    category: 'education',
    cover_image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    media_urls: [],
    status: 'approved',
    featured: false,
    created_at: '2024-02-08T00:00:00Z',
  },
]

export const mockDonations: Donation[] = [
  {
    id: '1',
    campaign_id: '1',
    donor_name: 'Mohammed K.',
    amount: 500,
    is_anonymous: false,
    message: 'May Allah grant Yusuf a speedy recovery!',
    payment_status: 'completed',
    cover_platform_fee: true,
    platform_fee: 25,
    stripe_fee: 15.53,
    donor_total_paid: 525,
    net_to_campaign: 500,
    created_at: '2024-02-20T10:30:00Z',
  },
  {
    id: '2',
    campaign_id: '1',
    donor_name: 'Anonymous',
    amount: 1000,
    is_anonymous: true,
    payment_status: 'completed',
    cover_platform_fee: false,
    platform_fee: 50,
    stripe_fee: 29.30,
    donor_total_paid: 1000,
    net_to_campaign: 950,
    created_at: '2024-02-19T14:15:00Z',
  },
  {
    id: '3',
    campaign_id: '1',
    donor_name: 'Emily S.',
    amount: 250,
    is_anonymous: false,
    message: 'Praying for the best outcome.',
    payment_status: 'completed',
    cover_platform_fee: true,
    platform_fee: 12.50,
    stripe_fee: 7.91,
    donor_total_paid: 262.50,
    net_to_campaign: 250,
    created_at: '2024-02-18T09:00:00Z',
  },
  {
    id: '4',
    campaign_id: '1',
    donor_name: 'Omar M.',
    amount: 100,
    is_anonymous: false,
    payment_status: 'completed',
    cover_platform_fee: false,
    platform_fee: 5,
    stripe_fee: 3.20,
    donor_total_paid: 100,
    net_to_campaign: 95,
    created_at: '2024-02-17T16:45:00Z',
  },
  {
    id: '5',
    campaign_id: '2',
    donor_name: 'Fatima L.',
    amount: 1500,
    is_anonymous: false,
    message: 'Education is the key to a brighter future.',
    payment_status: 'completed',
    cover_platform_fee: true,
    platform_fee: 75,
    stripe_fee: 45.95,
    donor_total_paid: 1575,
    net_to_campaign: 1500,
    created_at: '2024-02-20T11:00:00Z',
  },
  {
    id: '6',
    campaign_id: '2',
    donor_name: 'Anonymous',
    amount: 5000,
    is_anonymous: true,
    payment_status: 'completed',
    cover_platform_fee: false,
    platform_fee: 250,
    stripe_fee: 145.30,
    donor_total_paid: 5000,
    net_to_campaign: 4750,
    created_at: '2024-02-15T08:30:00Z',
  },
  {
    id: '7',
    campaign_id: '3',
    donor_name: 'Hassan R.',
    amount: 800,
    is_anonymous: false,
    payment_status: 'completed',
    cover_platform_fee: false,
    platform_fee: 40,
    stripe_fee: 23.50,
    donor_total_paid: 800,
    net_to_campaign: 760,
    created_at: '2024-02-19T13:20:00Z',
  },
  {
    id: '8',
    campaign_id: '5',
    donor_name: 'Aisha F.',
    amount: 2500,
    is_anonymous: false,
    message: 'Stay strong, help is on the way!',
    payment_status: 'completed',
    cover_platform_fee: true,
    platform_fee: 125,
    stripe_fee: 76.43,
    donor_total_paid: 2625,
    net_to_campaign: 2500,
    created_at: '2024-02-20T07:00:00Z',
  },
]

// Helper functions to simulate database queries
export function getCampaigns(filter?: { category?: string; featured?: boolean; status?: string }) {
  let campaigns = [...mockCampaigns]

  if (filter?.category) {
    campaigns = campaigns.filter(c => c.category === filter.category)
  }
  if (filter?.featured !== undefined) {
    campaigns = campaigns.filter(c => c.featured === filter.featured)
  }
  if (filter?.status) {
    campaigns = campaigns.filter(c => c.status === filter.status)
  }

  return campaigns
}

export function getCampaignById(id: string) {
  return mockCampaigns.find(c => c.id === id)
}

export function getDonationsByCampaign(campaignId: string) {
  return mockDonations.filter(d => d.campaign_id === campaignId)
}

export function getUserById(id: string) {
  return mockUsers.find(u => u.id === id)
}
