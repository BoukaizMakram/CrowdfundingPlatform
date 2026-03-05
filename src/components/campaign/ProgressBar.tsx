import { cn } from '@/lib/utils'

interface ProgressBarProps {
  raised: number
  goal: number
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ raised, goal, className, showLabel = false }: ProgressBarProps) {
  const percentage = Math.min(Math.round((raised / goal) * 100), 100)

  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 bg-[#e8e5e0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#274a34] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-500 mt-1">{percentage}% funded</p>
      )}
    </div>
  )
}
