'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackVisit } from '@/lib/supabase-queries'

function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

export default function UTMTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const utmSource = searchParams.get('utm_source') || undefined
    const utmMedium = searchParams.get('utm_medium') || undefined
    const utmCampaign = searchParams.get('utm_campaign') || undefined
    const hasUTM = utmSource || utmMedium || utmCampaign

    // Deduplicate non-UTM visits within the same session
    const trackingKey = `visited_${pathname}`
    if (!hasUTM && sessionStorage.getItem(trackingKey)) return

    trackVisit({
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      referrer: document.referrer || undefined,
      page: pathname,
      user_agent: navigator.userAgent,
      device: getDeviceType(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

    if (!hasUTM) {
      sessionStorage.setItem(trackingKey, '1')
    }
  }, [pathname, searchParams])

  return null
}
