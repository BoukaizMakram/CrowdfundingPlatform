'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCampaigns } from '@/lib/supabase-queries'
import { Campaign, Category } from '@/types'
import CampaignCard from '@/components/campaign/CampaignCard'
import CategoryFilter from '@/components/campaign/CategoryFilter'

gsap.registerPlugin(ScrollTrigger)

function SplitWords({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span className="split-word inline-block">{word}</span>
          {i < text.split(' ').length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  )
}

function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrame = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }
    resize()
    window.addEventListener('resize', resize)

    const cols = 30
    const rows = 15
    let time = 0

    const draw = () => {
      time += 0.02
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const gapX = w / (cols + 1)
      const gapY = h / (rows + 1)

      ctx.clearRect(0, 0, w, h)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = gapX * (c + 1)
          const y = gapY * (r + 1)
          const wave = Math.sin(c * 0.3 + time) * Math.cos(r * 0.4 + time * 0.7) * 0.5 + 0.5
          const dx = mouseRef.current.x - x
          const dy = mouseRef.current.y - y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const mouseFactor = Math.max(0, 1 - dist / 150)
          const baseOpacity = 0.12 + wave * 0.15
          const opacity = Math.min(1, baseOpacity + mouseFactor * 0.6)
          const radius = 1.5 + mouseFactor * 2.5

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(237, 255, 211, ${opacity})`
          ctx.fill()
        }
      }
      animFrame.current = requestAnimationFrame(draw)
    }

    draw()

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    canvas.addEventListener('mousemove', handleMouse)

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(animFrame.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" />
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCategory = (searchParams.get('category') as Category) || 'all'
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(initialCategory)
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const campaignsRef = useRef<HTMLElement>(null)
  const campaignsGridRef = useRef<HTMLDivElement>(null)
  const canvasTransitionRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const featuredRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)
  const initialRender = useRef(true)

  useEffect(() => {
    async function fetchCampaigns() {
      const data = await getCampaigns({ status: 'approved' })
      setAllCampaigns(data)
      setLoading(false)
      // Refresh after DOM updates with new campaign cards/images
      setTimeout(() => ScrollTrigger.refresh(), 500)
    }
    fetchCampaigns()
  }, [])

  const filteredCampaigns = selectedCategory === 'all'
    ? allCampaigns
    : allCampaigns.filter(c => c.category === selectedCategory)

  const featuredCampaigns = (allCampaigns.filter(c => c.featured).length > 0
    ? allCampaigns.filter(c => c.featured)
    : allCampaigns
  ).slice(0, 5)

  // ═══════════════════════════════════════
  // GSAP ANIMATIONS
  // ═══════════════════════════════════════
  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 300)

    const ctx = gsap.context(() => {
      // ─── HERO ───
      const heroWords = heroRef.current?.querySelectorAll('.split-word')
      if (heroWords?.length) {
        gsap.set(heroWords, { y: '110%', rotateX: -40 })
        gsap.to(heroWords, {
          y: '0%',
          rotateX: 0,
          duration: 1,
          stagger: 0.04,
          ease: 'power4.out',
          delay: 0.3,
        })
      }

      gsap.from('.hero-logo', { opacity: 0, scale: 0.8, duration: 0.8, ease: 'power3.out', delay: 0.1 })
      gsap.from('.hero-buttons', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.9 })
      gsap.from('.hero-bottom', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 1.1 })

      // ─── CAMPAIGNS + IMPACT: handled in separate useEffect after data loads ───

      // ─── MARQUEE ───
      if (marqueeRef.current) {
        const track = marqueeRef.current.querySelector('.marquee-track')
        if (track) {
          gsap.to(track, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 })
        }
      }

      // ─── FEATURED, HOW IT WORKS, CTA: handled in post-data useEffect ───
    }, mainRef)

    return () => {
      clearTimeout(timer)
      ctx.revert()
    }
  }, [])

  // ─── CAMPAIGNS + IMPACT: set up after data loads so pin positions are correct ───
  useEffect(() => {
    if (loading || !campaignsRef.current) return

    const ctx = gsap.context(() => {
      // ── CAMPAIGNS: pinned with staggered reveals ──
      const campaignsTl = gsap.timeline({
        scrollTrigger: {
          trigger: campaignsRef.current,
          start: 'top top',
          end: '+=80%',
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      })

      const heading = campaignsRef.current!.querySelector('.section-heading')
      if (heading) {
        gsap.set(heading, { clipPath: 'inset(0 100% 0 0)' })
        campaignsTl.to(heading, { clipPath: 'inset(0 0% 0 0)', duration: 0.25, ease: 'power3.inOut' }, 0)
      }

      const subtitle = campaignsRef.current!.querySelector('.campaigns-subtitle')
      if (subtitle) {
        gsap.set(subtitle, { opacity: 0, y: 15 })
        campaignsTl.to(subtitle, { opacity: 1, y: 0, duration: 0.15, ease: 'power3.out' }, 0.1)
      }

      const viewAll = campaignsRef.current!.querySelector('.campaigns-view-all')
      if (viewAll) {
        gsap.set(viewAll, { opacity: 0, x: 20 })
        campaignsTl.to(viewAll, { opacity: 1, x: 0, duration: 0.15, ease: 'power3.out' }, 0.15)
      }

      const filterWrap = campaignsRef.current!.querySelector('.category-filter-wrap')
      if (filterWrap) {
        gsap.set(filterWrap, { opacity: 0, y: 15 })
        campaignsTl.to(filterWrap, { opacity: 1, y: 0, duration: 0.15, ease: 'power3.out' }, 0.2)
      }

      const cardWraps = campaignsRef.current!.querySelectorAll('.campaign-card-wrap')
      if (cardWraps.length) {
        gsap.set(cardWraps, { opacity: 0, y: 40 })
        campaignsTl.to(cardWraps, { opacity: 1, y: 0, stagger: 0.03, duration: 0.25, ease: 'power3.out' }, 0.3)
      }

      // ── IMPACT SECTION: pinned clip-path reveal ──
      if (canvasTransitionRef.current) {
        const panel = canvasTransitionRef.current.querySelector('.canvas-panel') as HTMLElement
        const textEl = canvasTransitionRef.current.querySelector('.canvas-text') as HTMLElement

        if (panel && textEl) {
          gsap.set(textEl, { opacity: 0, y: 40 })
          gsap.to(textEl, {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: {
              trigger: canvasTransitionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none none',
            },
          })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: canvasTransitionRef.current,
              start: 'top top',
              end: '+=100%',
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
            },
          })

          tl.to(panel, { clipPath: 'inset(0 0 0% 0)', duration: 0.3 })
          tl.to(panel, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'power2.inOut' })
        }
      }

      // ── SHOWCASE CARDS ──
      const showcaseGrid = mainRef.current?.querySelector('.showcase-grid')
      if (showcaseGrid) {
        gsap.fromTo(showcaseGrid.querySelectorAll('.showcase-card'),
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: showcaseGrid,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      }

      // ── FEATURED: Bento grid reveal ──
      if (featuredRef.current) {
        const featHeading = featuredRef.current.querySelector('.section-heading')
        if (featHeading) {
          gsap.fromTo(featHeading,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1.2,
              ease: 'power3.inOut',
              scrollTrigger: { trigger: featHeading, start: 'top 85%', toggleActions: 'play none none none' },
            }
          )
        }

        const bigCard = featuredRef.current.querySelector('.bento-big')
        if (bigCard) {
          gsap.from(bigCard, {
            opacity: 0, x: -80, scale: 0.95, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: bigCard, start: 'top 85%', toggleActions: 'play none none none' },
          })
        }

        const smallCards = featuredRef.current.querySelectorAll('.bento-small')
        if (smallCards.length) {
          gsap.from(smallCards, {
            opacity: 0, x: 60, y: 30, scale: 0.92, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: smallCards[0], start: 'top 88%', toggleActions: 'play none none none' },
          })
        }
      }

      // ── HOW IT WORKS: Stacked card reveal (pinned) ──
      if (howItWorksRef.current) {
        const hiwCards = howItWorksRef.current.querySelectorAll('.hiw-card')

        hiwCards.forEach((card, i) => {
          if (i === 0) return
          gsap.from(card, {
            yPercent: 100,
            opacity: 0,
            scale: 0.9,
            scrollTrigger: {
              trigger: howItWorksRef.current,
              start: () => `top+=${i * window.innerHeight * 0.5} top`,
              end: () => `top+=${(i + 0.5) * window.innerHeight * 0.5} top`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
        })

        ScrollTrigger.create({
          trigger: howItWorksRef.current,
          start: 'top top',
          end: () => `+=${hiwCards.length * window.innerHeight * 0.5}`,
          pin: true,
          invalidateOnRefresh: true,
        })
      }

      // ── CTA ──
      if (ctaRef.current) {
        const ctaWords = ctaRef.current.querySelectorAll('.split-word')
        if (ctaWords.length) {
          gsap.from(ctaWords, {
            y: '100%', rotateX: -30, duration: 0.8, stagger: 0.03, ease: 'power4.out',
            scrollTrigger: { trigger: ctaRef.current, start: 'top 80%', toggleActions: 'play none none none' },
          })
        }
        gsap.from('.cta-button', {
          opacity: 0, y: 40, scale: 0.85, duration: 1, delay: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 75%', toggleActions: 'play none none none' },
        })
        gsap.from('.cta-subtitle', {
          opacity: 0, y: 20, duration: 0.7, delay: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 78%', toggleActions: 'play none none none' },
        })
      }

      setTimeout(() => ScrollTrigger.refresh(), 200)
    }, mainRef)

    return () => ctx.revert()
  }, [loading])

  // Animate campaign cards on filter change (skip initial render — handled by pin timeline)
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    if (!campaignsGridRef.current) return
    const cards = campaignsGridRef.current.querySelectorAll('.campaign-card-wrap')
    if (!cards.length) return

    gsap.killTweensOf(cards)
    gsap.fromTo(cards,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: 'power3.out',
      }
    )
  }, [selectedCategory, filteredCampaigns])

  // URL sync
  useEffect(() => {
    if (selectedCategory !== 'all') {
      router.replace(`/?category=${selectedCategory}`, { scroll: false })
      campaignsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      const currentQ = searchParams.get('category')
      if (currentQ) router.replace('/', { scroll: false })
    }
  }, [selectedCategory, router, searchParams])

  useEffect(() => {
    if (searchParams.get('category') && campaignsRef.current) {
      setTimeout(() => {
        campaignsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const marqueeText = 'Sadaqah \u2022 Zakat \u2022 Waqf \u2022 Charity \u2022 Mosque \u2022 Education \u2022 Healthcare \u2022 Community \u2022 Orphans \u2022 Relief \u2022 '

  return (
    <div ref={mainRef} className="bg-[#fafaf8]">

      {/* ════════ HERO ════════ */}
      <section
        ref={heroRef}
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#edffd3',
        }}
      >
        <div
          className="relative z-10 text-center px-4 max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center"
          style={{ perspective: '600px' }}
        >
          <div className="hero-logo flex items-center justify-center mb-8">
            <img src="/logo.png" alt="Amanatick" className="h-28 md:h-36 object-contain" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-[#274a34] leading-tight tracking-tight mb-10">
            <SplitWords text="Plant a Seed of Goodness," />
            <br />
            <SplitWords text="Reap Eternal Rewards" />
          </h1>

          {/* Donate button first (primary), Start campaign second */}
          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/campaigns"
              className="flex items-center gap-2 w-full sm:w-auto px-10 py-4 bg-[#274a34] text-white font-bold text-lg rounded-full hover:bg-[#1d3827] transition-all hover:shadow-lg"
            >
              Donate now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <Link
              href="/campaign/create"
              className="w-full sm:w-auto px-10 py-4 bg-white/60 backdrop-blur-sm border-2 border-[#274a34]/20 text-[#274a34] font-bold text-lg rounded-full hover:bg-white/80 transition-all"
            >
              Start a campaign
            </Link>
          </div>
        </div>

        <div className="hero-bottom relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 mt-auto">
          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#274a34] leading-snug">
                #1 islamic crowdfunding<br />platform*
              </p>
            </div>
            <div>
              <p className="text-[#274a34]/70 text-lg leading-relaxed">
                Every act of giving is a light that shines beyond this world. Support mosques, schools, orphanages, and relief projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CAMPAIGNS (right after hero, fills the screen) ════════ */}
      <section ref={campaignsRef} id="campaigns" className="min-h-screen flex flex-col justify-center py-16 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Header area */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <div>
              <h2 className="section-heading text-3xl md:text-4xl font-black text-[#1a1a1a]">Discover campaigns</h2>
              <p className="campaigns-subtitle mt-2 text-gray-500 text-base">
                Browse {allCampaigns.length > 0 ? allCampaigns.length : ''} campaigns making a real difference
              </p>
            </div>
            <Link href="/campaigns" className="campaigns-view-all hidden md:flex items-center gap-2 text-[#274a34] hover:gap-3 transition-all font-bold text-sm shrink-0">
              View all campaigns
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Filter */}
          <div className="category-filter-wrap mb-8">
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
          </div>

          {/* Campaign grid */}
          <div
            ref={campaignsGridRef}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card-wrap">
                <CampaignCard campaign={campaign} />
              </div>
            ))}
          </div>
          {filteredCampaigns.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-16">No campaigns found in this category.</p>
          )}
        </div>
      </section>

      {/* ════════ IMPACT SECTION (pinned green clips away to reveal showcase) ════════ */}
      <div ref={canvasTransitionRef} className="relative h-screen overflow-hidden">
        {/* Green overlay — clips away on scroll */}
        <div className="canvas-panel absolute inset-0 z-10 bg-[#274a34] flex items-center justify-center" style={{ clipPath: 'inset(0 0 0% 0)' }}>
          <div className="canvas-text max-w-5xl mx-auto px-4 text-center">
            <p className="text-[#edffd3] text-sm md:text-base font-bold tracking-widest uppercase mb-5">Trusted by thousands</p>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none">Making impact</h2>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mt-3">together.</h2>
          </div>
        </div>

        {/* Campaign showcase revealed underneath */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#fafaf8]">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6">
            <p className="text-center text-sm font-bold text-[#274a34] tracking-widest uppercase mb-10">People are already making a difference</p>
            <div className="showcase-grid grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
              {allCampaigns.slice(0, 3).map((campaign, i) => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}`} className="showcase-card group block">
                  <div className={`${i === 1 ? 'sm:-mt-6' : ''}`}>
                    <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                      <img
                        src={campaign.cover_image_url}
                        alt={campaign.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="font-bold text-[#1a1a1a] text-sm md:text-base leading-snug line-clamp-2 group-hover:text-[#274a34] transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="mt-1.5 text-xs md:text-sm text-gray-500">
                        <span className="font-bold text-[#274a34]">${campaign.raised_amount.toLocaleString()}</span> raised
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ MARQUEE TICKER ════════ */}
      <div ref={marqueeRef} className="py-5 bg-[#274a34] overflow-hidden select-none">
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[#edffd3]/30 text-6xl md:text-8xl font-black tracking-tight px-4">
              {marqueeText}
            </span>
          ))}
        </div>
      </div>

      {/* ════════ FEATURED - BENTO GRID ════════ */}
      <section ref={featuredRef} className="py-20 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-heading text-3xl md:text-4xl font-black text-[#1a1a1a]">
                Discover fundraisers inspired<br className="hidden md:block" /> by what you care about
              </h2>
            </div>
            <Link href="/campaigns" className="hidden sm:flex items-center gap-2 text-[#274a34] hover:gap-3 transition-all font-bold text-sm">
              See all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {featuredCampaigns.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[220px]">
              <div className="bento-big lg:col-span-1 lg:row-span-2">
                <BentoCardLarge campaign={featuredCampaigns[0]} />
              </div>
              {featuredCampaigns.slice(1, 5).map((campaign) => (
                <div key={campaign.id} className="bento-small">
                  <BentoCardSmall campaign={campaign} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ HOW IT WORKS - Stacked cards (pinned) ════════ */}
      <section ref={howItWorksRef} className="relative h-screen bg-white">
        {[
          {
            step: '01',
            title: 'Start your campaign',
            desc: 'Share your cause and set a fundraising goal. It takes just a few minutes to create a compelling campaign.',
            color: '#edffd3',
            bg: 'bg-white',
            icon: (
              <svg className="w-12 h-12 md:w-16 md:h-16 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            ),
          },
          {
            step: '02',
            title: 'Share with the ummah',
            desc: 'Spread the word on social media and with friends and family worldwide. Every share multiplies your impact.',
            color: '#e4fdc0',
            bg: 'bg-[#fafaf8]',
            icon: (
              <svg className="w-12 h-12 md:w-16 md:h-16 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            ),
          },
          {
            step: '03',
            title: 'Collect & withdraw',
            desc: 'Receive sadaqah and zakat donations securely. Withdraw funds directly to your account whenever you need.',
            color: '#d6f5a8',
            bg: 'bg-[#f5f5f0]',
            icon: (
              <svg className="w-12 h-12 md:w-16 md:h-16 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map((item, i) => (
          <div
            key={item.step}
            className={`hiw-card absolute inset-0 ${item.bg} flex items-center justify-center px-6`}
            style={{ zIndex: i + 1 }}
          >
            <div className="max-w-lg text-center">
              <p className="text-[#274a34] text-xs md:text-sm font-bold tracking-widest uppercase mb-6">How it works</p>
              <div
                className="inline-flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-3xl mb-6"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>
              <div className="text-[#274a34] text-sm font-bold tracking-widest uppercase mb-3">Step {item.step}</div>
              <h3 className="text-3xl md:text-5xl font-black text-[#1a1a1a] mb-4 leading-tight">{item.title}</h3>
              <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md mx-auto">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ════════ REVERSED MARQUEE ════════ */}
      <div className="py-4 bg-[#edffd3] overflow-hidden select-none">
        <div className="marquee-track-reverse flex whitespace-nowrap" style={{
          animation: 'marqueeReverse 25s linear infinite',
        }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[#274a34]/10 text-5xl md:text-7xl font-black tracking-tight px-4">
              Make a Difference {'\u2022'} Plant a Seed {'\u2022'} Eternal Rewards {'\u2022'} Give Generously {'\u2022'}{' '}
            </span>
          ))}
        </div>
      </div>

      {/* ════════ CTA with DotGrid ════════ */}
      <section ref={ctaRef} className="relative bg-[#274a34] py-32 overflow-hidden">
        <DotGrid />
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#e4fdc0]/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e4fdc0]/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center" style={{ perspective: '600px' }}>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
            <SplitWords text="Ready to plant your seed?" />
          </h2>
          <p className="cta-subtitle text-white/70 text-lg mb-10 max-w-xl mx-auto">
            <SplitWords text="Join thousands of Muslims creating lasting impact through charitable giving." />
          </p>
          <div className="cta-button">
            <Link
              href="/campaign/create"
              className="inline-flex items-center gap-2 bg-[#edffd3] text-[#274a34] font-bold px-10 py-4 rounded-full hover:bg-[#e4fdc0] transition-all hover:shadow-lg text-lg"
            >
              Start your campaign today
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════
// BENTO CARD COMPONENTS
// ═══════════════════════════════════════

function BentoCardLarge({ campaign }: { campaign: Campaign }) {
  const progress = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100)

  return (
    <Link
      href={`/campaign/${campaign.id}`}
      className="group relative block w-full h-full rounded-2xl overflow-hidden"
    >
      <img
        src={campaign.cover_image_url}
        alt={campaign.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
          {progress}% funded
        </span>
        <h3 className="text-xl md:text-2xl font-black text-white leading-snug mb-3 line-clamp-2">
          {campaign.title}
        </h3>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#edffd3] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white/80 text-sm font-bold">${campaign.raised_amount.toLocaleString()} raised</p>
      </div>
    </Link>
  )
}

function BentoCardSmall({ campaign }: { campaign: Campaign }) {
  const progress = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100)

  return (
    <Link
      href={`/campaign/${campaign.id}`}
      className="group relative block w-full h-full rounded-2xl overflow-hidden"
    >
      <img
        src={campaign.cover_image_url}
        alt={campaign.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
          {progress}% funded
        </span>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-2">{campaign.title}</h3>
        <div className="h-1 bg-white/20 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-[#edffd3] rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white/80 text-[11px] font-bold">${campaign.raised_amount.toLocaleString()} raised</p>
      </div>
    </Link>
  )
}
