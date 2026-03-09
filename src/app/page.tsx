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

// ── SplitWords: wraps each word in a span for word-by-word reveal ──
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
  const statsRef = useRef<HTMLElement>(null)
  const featuredRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const campaignsRef = useRef<HTMLElement>(null)
  const campaignsGridRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLElement>(null)
  const initialRender = useRef(true)

  // Fetch campaigns from Supabase
  useEffect(() => {
    async function fetchCampaigns() {
      const data = await getCampaigns({ status: 'approved' })
      setAllCampaigns(data)
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  const filteredCampaigns = selectedCategory === 'all'
    ? allCampaigns
    : allCampaigns.filter(c => c.category === selectedCategory)

  const featuredCampaigns = allCampaigns.filter(c => c.featured).slice(0, 4)

  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    const ctx = gsap.context(() => {
      // ═══════════════════════════════════════
      // HERO: Word-by-word reveal from below
      // ═══════════════════════════════════════
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

      gsap.from('.hero-logo', {
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.1,
      })

      // Brand text slides down from behind the logo
      gsap.fromTo('.hero-brand-text', {
        y: '-100%',
        opacity: 0,
      }, {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.6,
      })

      gsap.from('.hero-buttons', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.9,
      })

      gsap.from('.hero-bottom', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        delay: 1.1,
      })

      // ═══════════════════════════════════════
      // STATS: Counter-like reveal
      // ═══════════════════════════════════════
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll('.stat-item')
        gsap.from(statItems, {
          opacity: 0,
          y: 40,
          scale: 0.95,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      }

      // ═══════════════════════════════════════
      // FEATURED: Clip-path heading + stagger cards
      // ═══════════════════════════════════════
      if (featuredRef.current) {
        const heading = featuredRef.current.querySelector('.section-heading')
        if (heading) {
          gsap.fromTo(heading,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        const subtitle = featuredRef.current.querySelector('.section-subtitle')
        if (subtitle) {
          gsap.from(subtitle, {
            opacity: 0,
            y: 20,
            duration: 0.7,
            delay: 0.3,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: subtitle,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          })
        }

        const cards = featuredRef.current.querySelectorAll('.campaign-card-wrap')
        if (cards.length) {
          gsap.from(cards, {
            opacity: 0,
            y: 60,
            scale: 0.95,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cards[0],
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          })
        }
      }

      // ═══════════════════════════════════════
      // HOW IT WORKS: Scroll-scrubbed parallax
      // ═══════════════════════════════════════
      if (howItWorksRef.current) {
        const heading = howItWorksRef.current.querySelector('.section-heading')
        if (heading) {
          gsap.fromTo(heading,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        const steps = howItWorksRef.current.querySelectorAll('.step-card')
        steps.forEach((step, i) => {
          gsap.from(step, {
            opacity: 0,
            y: 60 + i * 20,
            scale: 0.92,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 90%',
              end: 'top 60%',
              scrub: 1,
            },
          })
        })
      }

      // ═══════════════════════════════════════
      // CAMPAIGNS: Heading clip-path
      // ═══════════════════════════════════════
      if (campaignsRef.current) {
        const heading = campaignsRef.current.querySelector('.section-heading')
        if (heading) {
          gsap.fromTo(heading,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          )
        }
      }

      // ═══════════════════════════════════════
      // CTA: Word-by-word reveal on scroll
      // ═══════════════════════════════════════
      if (ctaRef.current) {
        const ctaWords = ctaRef.current.querySelectorAll('.split-word')
        if (ctaWords.length) {
          gsap.from(ctaWords, {
            y: '100%',
            rotateX: -30,
            duration: 0.8,
            stagger: 0.03,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          })
        }

        gsap.from('.cta-button', {
          opacity: 0,
          y: 30,
          scale: 0.9,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })

        gsap.from('.cta-subtitle', {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        })
      }
    }, mainRef)

    return () => {
      clearTimeout(timer)
      ctx.revert()
    }
  }, [])

  // Animate campaign cards on mount and when filter changes
  useEffect(() => {
    if (!campaignsGridRef.current) return
    const cards = campaignsGridRef.current.querySelectorAll('.campaign-card-wrap')
    if (!cards.length) return

    gsap.killTweensOf(cards)

    if (initialRender.current) {
      initialRender.current = false
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: campaignsGridRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      )
    } else {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' }
      )
    }
  }, [selectedCategory])

  // Sync URL and scroll to campaigns when category param is present
  useEffect(() => {
    if (selectedCategory !== 'all') {
      router.replace(`/?category=${selectedCategory}`, { scroll: false })
      // Scroll to campaigns section
      campaignsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      const currentQ = searchParams.get('category')
      if (currentQ) {
        router.replace('/', { scroll: false })
      }
    }
  }, [selectedCategory, router, searchParams])

  // On mount, if category param exists, scroll to campaigns
  useEffect(() => {
    if (searchParams.get('category') && campaignsRef.current) {
      setTimeout(() => {
        campaignsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={mainRef} className="bg-[#fafaf8]">
      {/* ════════ Hero ════════ */}
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
          {/* Logo */}
          <div className="hero-logo flex items-center justify-center mb-8">
            <img
              src="/logo.png"
              alt="Amanatick"
              className="h-28 md:h-36 object-contain"
            />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-[#274a34] leading-tight tracking-tight mb-10">
            <SplitWords text="Plant a Seed of Goodness," />
            <br />
            <SplitWords text="Reap Eternal Rewards" />
          </h1>

          {/* Buttons */}
          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/campaign/create"
              className="flex items-center gap-2 w-full sm:w-auto px-10 py-4 bg-[#274a34] text-white font-bold text-lg rounded-full hover:bg-[#1d3827] transition-all hover:shadow-lg"
            >
              Start a campaign
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/campaigns"
              className="w-full sm:w-auto px-10 py-4 bg-white/60 backdrop-blur-sm border-2 border-[#274a34]/20 text-[#274a34] font-bold text-lg rounded-full hover:bg-white/80 transition-all"
            >
              Donate
            </Link>
          </div>
        </div>

        {/* Bottom section */}
        <div className="hero-bottom relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 mt-auto">
          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#274a34] leading-snug">
                #1 islamic crowdfunding
                <br />
                platform*
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

      {/* ════════ Stats Section (like Mon Petit Placement) ════════ */}
      <section ref={statsRef} className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-8 md:gap-4">
            {[
              { value: '50K+', label: 'Donors worldwide trust our platform' },
              { value: '$2M+', label: 'Raised for charitable causes' },
              { value: '4.8/5', label: 'Rating from our community' },
            ].map((stat) => (
              <div key={stat.value} className="stat-item text-center">
                <p className="text-4xl md:text-5xl font-black text-[#274a34] tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-[180px] mx-auto">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Featured ════════ */}
      <section ref={featuredRef} className="py-24 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-heading text-3xl md:text-4xl font-black text-[#1a1a1a]">Top fundraisers</h2>
              <p className="section-subtitle mt-3 text-gray-500">Campaigns making an impact right now</p>
            </div>
            <Link href="/campaigns" className="hidden sm:flex items-center gap-2 text-[#274a34] hover:gap-3 transition-all font-bold text-sm">
              See all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card-wrap">
                <CampaignCard campaign={campaign} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ How it works ════════ */}
      <section ref={howItWorksRef} className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading text-3xl md:text-4xl font-black text-[#1a1a1a] mb-4">How it works</h2>
            <p className="section-subtitle text-gray-500 max-w-lg mx-auto">
              Start raising funds in minutes. Your campaign can create lasting impact for generations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Start your campaign', desc: 'Share your cause and set a fundraising goal. It takes just a few minutes.' },
              { step: '02', title: 'Share with the ummah', desc: 'Spread the word on social media and with friends and family worldwide.' },
              { step: '03', title: 'Collect donations', desc: 'Receive sadaqah and zakat. Withdraw funds directly to your account.' },
            ].map((item) => (
              <div key={item.step} className="step-card bg-[#fafaf8] rounded-2xl p-8 text-center hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#edffd3] text-[#274a34] font-black text-lg mb-6">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ All Campaigns ════════ */}
      <section ref={campaignsRef} id="campaigns" className="py-24 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="section-heading text-3xl md:text-4xl font-black text-[#1a1a1a] mb-8">Discover campaigns</h2>
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
          </div>
          <div
            ref={campaignsGridRef}
            className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card-wrap">
                <CampaignCard campaign={campaign} />
              </div>
            ))}
          </div>
          {filteredCampaigns.length === 0 && (
            <p className="text-center text-gray-500 py-16">No campaigns found in this category.</p>
          )}
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section ref={ctaRef} className="relative bg-[#274a34] py-24 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#e4fdc0]/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e4fdc0]/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-3xl mx-auto px-4 text-center" style={{ perspective: '600px' }}>
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
