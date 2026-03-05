'use client'

import { useState, useCallback } from 'react'
import { MediaItem } from '@/types'

interface MediaCarouselProps {
  items: MediaItem[]
  featured?: boolean
  alt: string
}

export default function MediaCarousel({ items, featured, alt }: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const prev = useCallback(() =>
    setActiveIndex(i => (i - 1 + items.length) % items.length), [items.length])

  const next = useCallback(() =>
    setActiveIndex(i => (i + 1) % items.length), [items.length])

  if (items.length === 0) return null

  const activeItem = items[activeIndex]

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-black group">
      {activeItem.type === 'image' ? (
        <img
          src={activeItem.url}
          alt={`${alt} — photo ${activeIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          src={activeItem.url}
          controls
          className="absolute inset-0 w-full h-full object-contain"
          preload="metadata"
        />
      )}

      {featured && activeIndex === 0 && (
        <span className="absolute top-4 left-4 bg-amber-500 text-white text-sm font-medium px-3 py-1 rounded-full z-10">
          Featured
        </span>
      )}

      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === activeIndex
                    ? 'w-5 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
            {activeIndex + 1} / {items.length}
          </span>
        </>
      )}
    </div>
  )
}
