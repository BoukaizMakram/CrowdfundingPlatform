'use client'

import { CATEGORIES, Category } from '@/types'

interface CategoryFilterProps {
  selected: Category | 'all'
  onChange: (category: Category | 'all') => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const allCategories = [{ value: 'all' as const, label: 'All' }, ...CATEGORIES]

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === cat.value
              ? 'bg-[#274a34] text-white shadow-sm'
              : 'bg-white text-gray-600 shadow-[0_1px_8px_rgba(0,0,0,0.06)] hover:bg-[#edffd3] hover:text-[#274a34]'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
