'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCampaigns } from '@/lib/supabase-queries'
import { Campaign, Category, CATEGORIES } from '@/types'
import CampaignCard from '@/components/campaign/CampaignCard'

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafaf8] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-64" />
            <div className="h-12 bg-gray-200 rounded-xl max-w-lg" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <CampaignsContent />
    </Suspense>
  )
}

function CampaignsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    (searchParams.get('category') as Category) || 'all'
  )

  useEffect(() => {
    async function fetchCampaigns() {
      const data = await getCampaigns({ status: 'approved' })
      setCampaigns(data)
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    const qs = params.toString()
    router.replace(`/campaigns${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [searchQuery, selectedCategory, router])

  const filteredCampaigns = useMemo(() => {
    let result = campaigns
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.category === selectedCategory)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.creator_name.toLowerCase().includes(q)
      )
    }
    return result
  }, [campaigns, selectedCategory, searchQuery])

  const allCategories = [{ value: 'all' as const, label: 'All' }, ...CATEGORIES]

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a1a]">
            Discover campaigns
          </h1>
          <p className="text-gray-500 mt-2">Find and support causes that matter to you</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or creator..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#274a34] focus:ring-1 focus:ring-[#274a34] transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {allCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat.value
                  ? 'bg-[#274a34] text-white shadow-sm'
                  : 'bg-white text-gray-600 shadow-[0_1px_8px_rgba(0,0,0,0.06)] hover:bg-[#edffd3] hover:text-[#274a34]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
            {searchQuery.trim() && <> for &ldquo;{searchQuery.trim()}&rdquo;</>}
          </p>
        )}

        {/* Campaign grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No campaigns found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery.trim()
                ? 'Try adjusting your search or filters'
                : 'No campaigns in this category yet'}
            </p>
            <Link
              href="/campaign/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#274a34] text-white font-bold rounded-xl hover:bg-[#1d3827] transition-colors"
            >
              Start a campaign
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
