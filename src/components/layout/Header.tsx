'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const { user, loading, signOut } = useAuth()

  const displayName = user?.user_metadata?.full_name || user?.email || ''
  const initial = displayName ? displayName[0].toUpperCase() : '?'

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  const handleSearchSubmit = () => {
    const q = searchQuery.trim()
    if (q) {
      router.push(`/campaigns?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/campaigns')
    }
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4">
      {/* Floating pill navbar */}
      <nav className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-100/50 relative">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/nav-logo.png" alt="AlMakram" className="h-8" />
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/campaigns" className="px-4 py-2 text-sm font-medium text-[#274a34] hover:bg-[#edffd3] rounded-xl transition-colors">
              Donate
            </Link>
            <Link href="/campaign/create" className="px-4 py-2 text-sm font-medium text-[#274a34] hover:bg-[#edffd3] rounded-xl transition-colors">
              FundRaise
            </Link>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#274a34] hover:bg-[#edffd3] rounded-full transition-colors"
              aria-label="Search"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link href="#" className="px-4 py-2 text-sm font-medium text-[#274a34] hover:bg-[#edffd3] rounded-xl transition-colors">
              About
            </Link>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8" />
            ) : user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-[#274a34] hover:bg-[#edffd3] rounded-xl transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-[#274a34] hover:bg-[#edffd3] rounded-xl transition-colors"
                >
                  Sign out
                </button>
                <div className="w-8 h-8 bg-[#274a34] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{initial}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-[#274a34] hover:bg-[#edffd3] rounded-xl transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/campaign/create"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#274a34] text-white text-sm font-bold rounded-xl hover:bg-[#1d3827] transition-all shadow-sm"
                >
                  Start a campaign
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -mr-1 text-[#274a34] hover:bg-[#edffd3] rounded-xl transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Search overlay - centered in navbar */}
        <div
          ref={searchContainerRef}
          className={`absolute inset-0 hidden md:flex items-center justify-center rounded-2xl transition-all duration-300 ${
            isSearchOpen
              ? 'opacity-100 pointer-events-auto bg-white/95 backdrop-blur-md'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center w-full max-w-md mx-6">
            <svg className="w-5 h-5 text-[#274a34]/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search campaigns..."
              className="flex-1 bg-transparent text-base text-[#274a34] placeholder-[#274a34]/40 outline-none px-3 py-2"
            />
            <button
              onClick={() => { setIsSearchOpen(false); setSearchQuery('') }}
              className="p-1.5 text-[#274a34]/40 hover:text-[#274a34] rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-6xl bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-gray-100/50 overflow-hidden">
          <div className="px-6 py-5 space-y-1">
            {/* Mobile search bar */}
            <div className="flex items-center gap-2 bg-[#edffd3] rounded-xl px-3 py-2.5 mb-3">
              <svg className="w-4 h-4 text-[#274a34] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search campaigns..."
                className="bg-transparent text-sm text-[#274a34] placeholder-[#274a34]/50 outline-none w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value.trim()
                    if (q) {
                      router.push(`/campaigns?q=${encodeURIComponent(q)}`)
                    } else {
                      router.push('/campaigns')
                    }
                    setIsMenuOpen(false)
                  }
                }}
              />
            </div>

            <Link href="/campaigns" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>
              Donate
            </Link>
            <Link href="/campaign/create" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>
              FundRaise
            </Link>
            <Link href="#" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>

            {!loading && user ? (
              <>
                <Link href="/dashboard" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={() => { signOut(); setIsMenuOpen(false) }}
                  className="block w-full text-left text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors"
                >
                  Sign out
                </button>
                <div className="pt-3 flex items-center gap-3 px-3">
                  <div className="w-8 h-8 bg-[#274a34] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{initial}</span>
                  </div>
                  <span className="text-sm text-gray-600 truncate">{displayName}</span>
                </div>
              </>
            ) : !loading ? (
              <>
                <Link href="/auth/login" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Sign in
                </Link>
                <div className="pt-3">
                  <Link
                    href="/campaign/create"
                    className="flex items-center justify-center gap-2 w-full bg-[#274a34] text-white font-bold py-3 rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start a campaign
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  )
}
