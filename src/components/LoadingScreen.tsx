'use client'

import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true)
      setTimeout(() => setVisible(false), 600)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#edffd3] transition-opacity duration-600 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <img
        src="/logo.png"
        alt="Amanatick"
        className="w-32 h-32 md:w-40 md:h-40 object-contain"
      />
    </div>
  )
}
