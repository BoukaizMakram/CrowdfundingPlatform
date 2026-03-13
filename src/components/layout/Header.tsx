'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

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
            <img src="/nav-logo.png" alt="Amanatick" className="h-8" />
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
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#edffd3] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#274a34] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{initial}</span>
                  </div>
                  <span className="text-sm font-medium text-[#274a34] max-w-[120px] truncate">{displayName}</span>
                  <svg className={`w-4 h-4 text-[#274a34] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 max-h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {/* Main */}
                    <div className="py-1">
                      <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Dashboard
                      </Link>
                      <Link href={`/profile/${user?.id}`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        My Profile
                      </Link>
                    </div>
                    {/* Finance */}
                    <div className="border-t border-gray-100 py-1">
                      <Link href="/dashboard/add-funds" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add Funds
                      </Link>
                      <Link href="/dashboard/withdraw" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Withdraw Funds
                      </Link>
                      <Link href="/dashboard/financial" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Financial Dashboard
                      </Link>
                    </div>
                    {/* More */}
                    <div className="border-t border-gray-100 py-1">
                      <Link href="/dashboard/analytics" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Account Analytics
                      </Link>
                      <Link href="/dashboard/campaigns" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Campaigns
                      </Link>
                      <Link href="/support" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Support
                      </Link>
                      <Link href="/dashboard/invite" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Invite Friends
                      </Link>
                    </div>
                    {/* Settings */}
                    <div className="border-t border-gray-100 py-1">
                      <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#edffd3] transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                      </Link>
                    </div>
                    {/* Logout */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => { setIsProfileOpen(false); signOut() }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                <div className="pt-2 pb-1 flex items-center gap-3 px-3">
                  <div className="w-8 h-8 bg-[#274a34] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{initial}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 mt-2 pt-1">
                  <Link href="/dashboard" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <Link href={`/profile/${user?.id}`} className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                  <Link href="/dashboard/add-funds" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Add Funds</Link>
                  <Link href="/dashboard/withdraw" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Withdraw Funds</Link>
                  <Link href="/dashboard/financial" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Financial Dashboard</Link>
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link href="/dashboard/analytics" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Account Analytics</Link>
                  <Link href="/dashboard/campaigns" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Campaigns</Link>
                  <Link href="/support" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Support</Link>
                  <Link href="/dashboard/invite" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Invite Friends</Link>
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link href="/settings" className="block text-[#274a34] font-medium py-2.5 px-3 rounded-xl hover:bg-[#edffd3] transition-colors" onClick={() => setIsMenuOpen(false)}>Settings</Link>
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { signOut(); setIsMenuOpen(false) }}
                    className="block w-full text-left text-red-600 font-medium py-2.5 px-3 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
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
