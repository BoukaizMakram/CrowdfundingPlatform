'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import gsap from 'gsap'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const { user, loading, signOut } = useAuth()

  const isHomePage = pathname === '/'

  const displayName = user?.user_metadata?.full_name || user?.email || ''
  const initial = displayName ? displayName[0].toUpperCase() : '?'

  // Set GSAP initial state BEFORE paint to prevent layout shift
  // useLayoutEffect runs synchronously after DOM update but before browser paint
  const isLayoutReady = useRef(false)
  useLayoutEffect(() => {
    if (!navRef.current || !headerRef.current) return
    const nav = navRef.current

    if (isHomePage) {
      nav.style.backdropFilter = 'none'
      nav.style.webkitBackdropFilter = 'none'
      gsap.set(nav, {
        backgroundColor: 'rgba(255,255,255,0)',
        boxShadow: '0 0px 0px rgba(0,0,0,0)',
        borderColor: 'rgba(243,244,246,0)',
      })
      nav.querySelectorAll('.nav-link-bold').forEach(el => {
        gsap.set(el, { opacity: 1 })
      })
      nav.querySelectorAll('.nav-link-normal').forEach(el => {
        gsap.set(el, { opacity: 0 })
      })
    } else {
      nav.style.backdropFilter = 'blur(12px)'
      nav.style.webkitBackdropFilter = 'blur(12px)'
      gsap.set(nav, {
        backgroundColor: 'rgba(255,255,255,0.92)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        borderColor: 'rgba(243,244,246,0.5)',
      })
      nav.querySelectorAll('.nav-link-bold').forEach(el => {
        gsap.set(el, { opacity: 0 })
      })
      nav.querySelectorAll('.nav-link-normal').forEach(el => {
        gsap.set(el, { opacity: 1 })
      })
    }

    // If page loaded scrolled, apply scrolled state immediately
    if (window.scrollY > 50) {
      nav.style.backdropFilter = 'blur(12px)'
      nav.style.webkitBackdropFilter = 'blur(12px)'
      gsap.set(nav, {
        backgroundColor: 'rgba(255,255,255,0.92)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        borderColor: 'rgba(243,244,246,0.5)',
      })
      gsap.set(headerRef.current, { paddingTop: '0.75rem' })
      nav.querySelectorAll('.nav-link-bold').forEach(el => {
        gsap.set(el, { opacity: 0 })
      })
      nav.querySelectorAll('.nav-link-normal').forEach(el => {
        gsap.set(el, { opacity: 1 })
      })
    }

    isLayoutReady.current = true
  }, [isHomePage])

  // GSAP scroll animation: transparent at top → solid pill on scroll
  useEffect(() => {
    if (!navRef.current || !headerRef.current) return

    const nav = navRef.current
    const header = headerRef.current
    let scrolled = window.scrollY > 50

    const onScroll = () => {
      const y = window.scrollY
      const shouldBeScrolled = y > 50

      if (shouldBeScrolled === scrolled) return
      scrolled = shouldBeScrolled

      if (shouldBeScrolled) {
        nav.style.backdropFilter = 'blur(12px)'
        nav.style.webkitBackdropFilter = 'blur(12px)'
        gsap.to(nav, {
          backgroundColor: 'rgba(255,255,255,0.92)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          borderColor: 'rgba(243,244,246,0.5)',
          duration: 0.5,
          ease: 'power3.out',
        })
        gsap.to(header, {
          paddingTop: '0.75rem',
          duration: 0.5,
          ease: 'power3.out',
        })
        nav.querySelectorAll('.nav-link-bold').forEach(el => {
          gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        })
        nav.querySelectorAll('.nav-link-normal').forEach(el => {
          gsap.to(el, { opacity: 1, duration: 0.3, delay: 0.15, ease: 'power2.in' })
        })
      } else {
        if (isHomePage) {
          nav.style.backdropFilter = 'none'
          nav.style.webkitBackdropFilter = 'none'
        }
        gsap.to(nav, {
          backgroundColor: isHomePage ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.92)',
          boxShadow: isHomePage ? '0 0px 0px rgba(0,0,0,0)' : '0 2px 20px rgba(0,0,0,0.08)',
          borderColor: isHomePage ? 'rgba(243,244,246,0)' : 'rgba(243,244,246,0.5)',
          duration: 0.5,
          ease: 'power3.out',
        })
        gsap.to(header, {
          paddingTop: '1rem',
          duration: 0.5,
          ease: 'power3.out',
        })
        if (isHomePage) {
          nav.querySelectorAll('.nav-link-bold').forEach(el => {
            gsap.to(el, { opacity: 1, duration: 0.3, delay: 0.15, ease: 'power2.in' })
          })
          nav.querySelectorAll('.nav-link-normal').forEach(el => {
            gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.out' })
          })
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHomePage])

  // Animate search overlay open/close
  useEffect(() => {
    if (!searchContainerRef.current) return
    const el = searchContainerRef.current

    if (isSearchOpen) {
      el.style.pointerEvents = 'auto'
      gsap.fromTo(el,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', onComplete: () => {
          searchInputRef.current?.focus()
        }}
      )
    } else {
      gsap.to(el, {
        opacity: 0, scale: 0.95, duration: 0.25, ease: 'power2.in',
        onComplete: () => { el.style.pointerEvents = 'none' }
      })
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
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4">
      {/* Floating pill navbar */}
      <nav
        ref={navRef}
        className="max-w-6xl mx-auto rounded-2xl border relative"
        suppressHydrationWarning
        style={{
          backgroundColor: isHomePage ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.92)',
          boxShadow: isHomePage ? 'none' : '0 2px 20px rgba(0,0,0,0.08)',
          borderColor: isHomePage ? 'transparent' : 'rgba(243,244,246,0.5)',
          backdropFilter: isHomePage ? 'none' : 'blur(12px)',
          WebkitBackdropFilter: isHomePage ? 'none' : 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-between md:justify-start h-14 px-4 sm:px-6 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/nav-logo.png" alt="Amanatick" className="h-8" />
          </Link>

          {/* Mobile menu button - placed early with order-last + ml-auto for instant right positioning */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden ml-auto p-2 -mr-1 text-[#274a34] hover:bg-[#edffd3]/60 rounded-xl transition-colors"
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

          {/* Nav links + centered search: use flex-1 sections to mirror spacing */}
          <div className="hidden md:flex items-center flex-1 justify-end gap-1">
            {[
              { href: '/campaigns', label: 'Donate' },
              { href: '/campaign/create', label: 'FundRaise' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="relative px-4 py-2 text-sm text-[#274a34] hover:bg-[#edffd3]/60 rounded-xl transition-colors">
                <span className="nav-link-bold font-bold">{label}</span>
                <span className="nav-link-normal font-medium absolute inset-0 flex items-center justify-center">{label}</span>
              </Link>
            ))}
          </div>

          {/* Centered search button */}
          <div className="hidden md:flex mx-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#274a34] hover:bg-[#edffd3]/60 rounded-full transition-colors cursor-pointer"
              aria-label="Search"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Right nav links (after search) + auth */}
          <div className="hidden md:flex items-center flex-1 gap-1">
            <Link href="#" className="relative px-4 py-2 text-sm text-[#274a34] hover:bg-[#edffd3]/60 rounded-xl transition-colors">
              <span className="nav-link-bold font-bold">About</span>
              <span className="nav-link-normal font-medium absolute inset-0 flex items-center justify-center">About</span>
            </Link>
            <div className="flex-1" />
            {loading ? (
              <div className="w-20 h-8" />
            ) : user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#edffd3]/60 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#274a34] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{initial}</span>
                  </div>
                  <span className="relative text-sm text-[#274a34] max-w-[120px] truncate">
                    <span className="nav-link-bold font-bold">{displayName}</span>
                    <span className="nav-link-normal font-medium absolute inset-0">{displayName}</span>
                  </span>
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
                <Link href="/auth/login" className="relative px-4 py-2 text-sm text-[#274a34] hover:bg-[#edffd3]/60 rounded-xl transition-colors">
                  <span className="nav-link-bold font-bold">Sign in</span>
                  <span className="nav-link-normal font-medium absolute inset-0 flex items-center justify-center">Sign in</span>
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

        </div>

        {/* Search overlay - centered in navbar, animated with GSAP */}
        <div
          ref={searchContainerRef}
          className="absolute inset-0 hidden md:flex items-center justify-center rounded-2xl bg-white/95 backdrop-blur-md"
          style={{ opacity: 0, pointerEvents: 'none', scale: '0.95' }}
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
              className="flex-1 bg-transparent text-base text-[#274a34] placeholder-[#274a34]/40 px-3 py-2"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
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
