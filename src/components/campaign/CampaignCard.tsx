import Link from 'next/link'
import { Campaign } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CampaignCardProps {
  campaign: Campaign
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100)

  return (
    <Link href={`/campaign/${campaign.id}`} className="group block bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={campaign.cover_image_url}
          alt={campaign.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#274a34] transition-colors">
          {campaign.title}
        </h3>

        {/* Progress */}
        <div className="mt-4 h-1.5 bg-[#edffd3] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#274a34] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-[#1a1a1a]">{formatCurrency(campaign.raised_amount)}</span>
            {' '}raised
          </p>
          <span className="text-xs font-medium text-[#274a34] bg-[#edffd3] px-2.5 py-1 rounded-full">
            {progress}%
          </span>
        </div>
      </div>
    </Link>
  )
}
