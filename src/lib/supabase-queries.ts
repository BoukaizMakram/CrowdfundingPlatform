import { supabase } from './supabase'
import { Campaign, Donation, MediaItem, PayoutMethod, PayoutRequest, PayoutRequestStatus, User } from '@/types'

export async function getCampaigns(filter?: {
  category?: string
  featured?: boolean
  status?: string
}): Promise<Campaign[]> {
  let query = supabase.from('campaigns').select('*')

  if (filter?.category) {
    query = query.eq('category', filter.category)
  }
  if (filter?.featured !== undefined) {
    query = query.eq('featured', filter.featured)
  }
  if (filter?.status) {
    query = query.eq('status', filter.status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
  return data as Campaign[]
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
  return data as Campaign
}

export async function getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching donations:', error)
    return []
  }
  return data as Donation[]
}

export async function getCampaignsByCreator(creatorId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user campaigns:', error)
    return []
  }
  return data as Campaign[]
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
  return data as Campaign[]
}

export async function getAllDonations(): Promise<(Donation & { campaign?: Campaign })[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*, campaign:campaigns(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching donations:', error)
    return []
  }
  return data as (Donation & { campaign?: Campaign })[]
}

export async function updateCampaignStatus(
  campaignId: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  const { error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', campaignId)

  if (error) {
    console.error('Error updating campaign status:', error)
    return false
  }
  return true
}

export async function createDonation(donation: {
  campaign_id: string
  donor_name: string
  amount: number
  is_anonymous: boolean
}): Promise<boolean> {
  const { error: donationError } = await supabase
    .from('donations')
    .insert(donation)

  if (donationError) {
    console.error('Error creating donation:', donationError)
    return false
  }

  // Update campaign raised_amount
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('raised_amount')
    .eq('id', donation.campaign_id)
    .single()

  if (campaign) {
    await supabase
      .from('campaigns')
      .update({ raised_amount: campaign.raised_amount + donation.amount })
      .eq('id', donation.campaign_id)
  }

  return true
}

export async function deleteCampaign(campaignId: string): Promise<boolean> {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('cover_image_url, media_urls')
    .eq('id', campaignId)
    .single()

  if (campaign) {
    const allUrls: string[] = []
    if (campaign.cover_image_url) allUrls.push(campaign.cover_image_url)
    const mediaItems: MediaItem[] = campaign.media_urls ?? []
    mediaItems.forEach(item => allUrls.push(item.url))

    const storagePaths = [...new Set(allUrls)]
      .filter(url => url.includes('campaign-images'))
      .map(url => url.split('/campaign-images/')[1])
      .filter(Boolean) as string[]

    if (storagePaths.length > 0) {
      await supabase.storage.from('campaign-images').remove(storagePaths)
    }
  }

  // Delete related donations
  await supabase.from('donations').delete().eq('campaign_id', campaignId)

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)

  if (error) {
    console.error('Error deleting campaign:', error)
    return false
  }
  return true
}

export async function createCampaign(campaign: {
  creator_id?: string
  creator_name: string
  title: string
  description: string
  goal_amount: number
  category: string
  cover_image_url: string
  media_urls?: MediaItem[]
}): Promise<{ id: string } | { error: string }> {
  const insertData: Record<string, unknown> = {
    creator_name: campaign.creator_name,
    title: campaign.title,
    description: campaign.description,
    goal_amount: campaign.goal_amount,
    category: campaign.category,
    cover_image_url: campaign.cover_image_url,
    media_urls: campaign.media_urls ?? [],
    status: 'pending',
    raised_amount: 0,
    featured: false,
  }
  if (campaign.creator_id) {
    insertData.creator_id = campaign.creator_id
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    return { error: error.message }
  }
  return { id: data.id }
}

export async function getUserPayoutMethod(userId: string): Promise<{ payout_method: PayoutMethod | null; payout_email: string | null } | null> {
  const { data, error } = await supabase
    .from('users')
    .select('payout_method, payout_email')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching payout method:', error)
    return null
  }
  return data as { payout_method: PayoutMethod | null; payout_email: string | null }
}

export async function getDonationsByDonor(donorId: string): Promise<(Donation & { campaign?: Campaign })[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*, campaign:campaigns(*)')
    .eq('donor_id', donorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching donor donations:', error)
    return []
  }
  return data as (Donation & { campaign?: Campaign })[]
}

export async function updateUserPayoutMethod(
  userId: string,
  payoutMethod: PayoutMethod,
  payoutEmail?: string,
  userEmail?: string,
  fullName?: string
): Promise<boolean> {
  // Try update first
  const { data, error: updateError } = await supabase
    .from('users')
    .update({
      payout_method: payoutMethod,
      payout_email: payoutEmail || null,
    })
    .eq('id', userId)
    .select('id')

  if (updateError) {
    console.error('Error updating payout method:', updateError)
    return false
  }

  // If no row was updated, insert one
  if (!data || data.length === 0) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: userEmail || '',
        full_name: fullName || 'User',
        payout_method: payoutMethod,
        payout_email: payoutEmail || null,
      })

    if (insertError) {
      console.error('Error inserting user payout method:', insertError)
      return false
    }
  }

  return true
}

// ── Payout Requests ──

export async function createPayoutRequest(
  userId: string,
  amount: number,
  payoutMethod: PayoutMethod,
  payoutEmail: string
): Promise<boolean> {
  const { error } = await supabase
    .from('payout_requests')
    .insert({ user_id: userId, amount, payout_method: payoutMethod, payout_email: payoutEmail })

  if (error) {
    console.error('Error creating payout request:', error)
    return false
  }
  return true
}

export async function getPayoutRequestsByUser(userId: string): Promise<PayoutRequest[]> {
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payout requests:', error)
    return []
  }
  return data as PayoutRequest[]
}

export async function getAllPayoutRequests(): Promise<PayoutRequest[]> {
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all payout requests:', error)
    return []
  }
  return data as PayoutRequest[]
}

export async function updatePayoutRequestStatus(
  id: string,
  status: PayoutRequestStatus,
  adminNote?: string
): Promise<boolean> {
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (adminNote !== undefined) update.admin_note = adminNote

  const { error } = await supabase
    .from('payout_requests')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('Error updating payout request:', error)
    return false
  }
  return true
}

// ── Users (Admin) ──

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  return data as User[]
}
