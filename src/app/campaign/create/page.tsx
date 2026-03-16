'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, Category, MediaItem, PayoutMethod } from '@/types'
import { createCampaign, getUserPayoutMethod, updateUserPayoutMethod } from '@/lib/supabase-queries'
import { supabase } from '@/lib/supabase'
import { signUp, signIn } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import RichTextEditor from '@/components/ui/RichTextEditor'

const STEPS = [
  { id: 1, title: 'Category' },
  { id: 2, title: 'Goal' },
  { id: 3, title: 'Details' },
  { id: 4, title: 'Payout' },
  { id: 5, title: 'Account' },
]

const STEP_HEADINGS: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Let's begin your fundraising journey",
    subtitle: "We're here to guide you every step of the way.",
  },
  2: {
    title: 'Set your fundraising goal',
    subtitle: 'You can always change this later. Pick an amount that reflects your needs.',
  },
  3: {
    title: 'Tell your story',
    subtitle: 'A compelling story helps donors connect with your cause.',
  },
  4: {
    title: 'How do you want to receive payouts?',
    subtitle: 'Choose how you\'d like to receive your campaign funds.',
  },
  5: {
    title: 'Create your account',
    subtitle: 'Sign up to manage your campaign and receive donations.',
  },
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const PAYOUT_OPTIONS: { value: PayoutMethod; label: string; description: string; icon: string }[] = [
  {
    value: 'stripe',
    label: 'Stripe',
    description: 'Direct bank deposits. Best for US, EU, and supported countries.',
    icon: 'stripe',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'Receive funds to your PayPal account. Available worldwide.',
    icon: 'paypal',
  },
  {
    value: 'wise',
    label: 'Wise',
    description: 'Low-fee international transfers. Great for MENA, Africa, and Asia.',
    icon: 'wise',
  },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { user: authUser } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup')
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | ''>('')
  const [payoutEmail, setPayoutEmail] = useState('')
  const [hasExistingPayout, setHasExistingPayout] = useState(false)

  const [formData, setFormData] = useState({
    category: '' as Category | '',
    goalAmount: '',
    title: '',
    description: '',
    // Account fields
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [mediaFiles, setMediaFiles] = useState<{
    file: File
    previewUrl: string
    type: 'image' | 'video'
    isCover: boolean
  }[]>([])
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<{
    currentFile: number
    totalFiles: number
    fileProgress: number
    fileName: string
  } | null>(null)

  // Sync auth state from context
  useEffect(() => {
    if (authUser) {
      setIsLoggedIn(true)
      setUserId(authUser.id)
      setFormData((prev) => ({
        ...prev,
        email: authUser.email || '',
        fullName: authUser.user_metadata?.full_name || '',
      }))

      // Check if user already has a payout method
      getUserPayoutMethod(authUser.id).then((payout) => {
        if (payout?.payout_method) {
          setPayoutMethod(payout.payout_method)
          setPayoutEmail(payout.payout_email || '')
          setHasExistingPayout(true)
        }
      })
    }
  }, [authUser])

  // Total steps: skip payout step if user already has one, skip account if logged in
  const skipPayout = isLoggedIn && hasExistingPayout
  const totalSteps = isLoggedIn ? (skipPayout ? 3 : 4) : 5

  const MAX_VIDEO_SIZE_MB = 30

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setErrors(prev => ({ ...prev, coverImage: '' }))

    const newItems = files.filter(file => {
      if (file.type.startsWith('video/')) {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          setErrors(prev => ({ ...prev, coverImage: `Video must be under ${MAX_VIDEO_SIZE_MB}MB` }))
          return false
        }
        if (mediaFiles.some(f => f.type === 'video')) {
          setErrors(prev => ({ ...prev, coverImage: 'Only one video allowed' }))
          return false
        }
      }
      return true
    }).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
      isCover: false,
    }))

    setMediaFiles(prev => {
      const combined = [...prev, ...newItems].slice(0, 10)
      if (!combined.some(f => f.isCover)) {
        const firstImg = combined.findIndex(f => f.type === 'image')
        if (firstImg !== -1) combined[firstImg] = { ...combined[firstImg], isCover: true }
      }
      return combined
    })
    e.target.value = ''
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      const next = prev.filter((_, i) => i !== index)
      if (!next.some(f => f.isCover)) {
        const firstImg = next.findIndex(f => f.type === 'image')
        if (firstImg !== -1) next[firstImg] = { ...next[firstImg], isCover: true }
      }
      return next
    })
  }

  const setCoverImage = (index: number) => {
    setMediaFiles(prev =>
      prev.map((item, i) => ({ ...item, isCover: i === index && item.type === 'image' }))
    )
  }

  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const items = (e as ClipboardEvent).clipboardData?.items || (e as React.ClipboardEvent).clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }

    if (imageFiles.length === 0) return
    e.preventDefault()
    setErrors(prev => ({ ...prev, coverImage: '' }))

    const newItems = imageFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: 'image' as const,
      isCover: false,
    }))

    setMediaFiles(prev => {
      const combined = [...prev, ...newItems].slice(0, 10)
      if (!combined.some(f => f.isCover)) {
        const firstImg = combined.findIndex(f => f.type === 'image')
        if (firstImg !== -1) combined[firstImg] = { ...combined[firstImg], isCover: true }
      }
      return combined
    })
  }, [])

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.category) {
        newErrors.category = 'Please select a category'
      }
    } else if (currentStep === 2) {
      if (!formData.goalAmount || parseInt(formData.goalAmount) <= 0) {
        newErrors.goalAmount = 'Please enter a valid goal amount'
      } else if (parseInt(formData.goalAmount) < 100) {
        newErrors.goalAmount = 'Minimum goal is $100'
      }
    } else if (currentStep === 3) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required'
      }
      const plainText = formData.description.replace(/<[^>]*>/g, '').trim()
      if (!plainText || formData.description === '<p></p>') {
        newErrors.description = 'Description is required'
      } else if (plainText.length < 100) {
        newErrors.description = 'Description must be at least 100 characters'
      }
      if (!mediaFiles.some(f => f.type === 'image')) {
        newErrors.coverImage = 'At least one image is required'
      }
      if (youtubeUrl && !extractYouTubeId(youtubeUrl)) {
        newErrors.youtubeUrl = 'Please enter a valid YouTube URL'
      }
    } else if (currentStep === 4) {
      if (!payoutMethod) {
        newErrors.payoutMethod = 'Please select a payout method'
      }
      if (payoutMethod && payoutMethod !== 'stripe' && !payoutEmail.trim()) {
        newErrors.payoutEmail = 'Please enter your email for payouts'
      } else if (payoutEmail && !/\S+@\S+\.\S+/.test(payoutEmail)) {
        newErrors.payoutEmail = 'Please enter a valid email'
      }
    } else if (currentStep === 5) {
      if (authMode === 'signup') {
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Your name is required'
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email'
        }
        if (!formData.password) {
          newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters'
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
        }
      } else {
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required'
        }
        if (!formData.password) {
          newErrors.password = 'Password is required'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Determine which content steps to show
  const activeSteps = [1, 2, 3]
  if (!skipPayout) activeSteps.push(4)
  if (!isLoggedIn) activeSteps.push(5)
  const currentStepIndex = activeSteps.indexOf(step)
  const isLastStep = currentStepIndex === activeSteps.length - 1

  const nextStep = () => {
    if (!validateStep(step)) return
    const nextIndex = currentStepIndex + 1
    if (nextIndex < activeSteps.length) {
      setStep(activeSteps[nextIndex])
    }
  }

  const prevStep = () => {
    setErrors({})
    setSubmitError('')
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(activeSteps[prevIndex])
    }
  }

  const handleSubmit = async () => {
    // Validate current (last) step
    if (!validateStep(step)) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      let creatorId = userId
      let creatorName = formData.fullName

      // Sign up or login if not authenticated
      if (!isLoggedIn) {
        if (authMode === 'signup') {
          const result = await signUp(formData.email, formData.password, formData.fullName)
          if ('error' in result) {
            setSubmitError(result.error)
            // Auto-switch to login mode if account already exists
            if (result.error.includes('already exists')) {
              setAuthMode('login')
            }
            setIsSubmitting(false)
            return
          }
          creatorId = result.user!.id
          creatorName = formData.fullName
        } else {
          const result = await signIn(formData.email, formData.password)
          if ('error' in result) {
            setSubmitError(result.error)
            setIsSubmitting(false)
            return
          }
          creatorId = result.user!.id
          creatorName = result.user!.user_metadata?.full_name || formData.email
        }
      }

      // Upload all media files to Supabase Storage with progress
      const uploadedItems: MediaItem[] = []
      let coverImageUrl = '/images/placeholder.jpg'
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      for (let i = 0; i < mediaFiles.length; i++) {
        const mediaFile = mediaFiles[i]
        const fileExt = mediaFile.file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

        setUploadProgress({
          currentFile: i + 1,
          totalFiles: mediaFiles.length,
          fileProgress: 0,
          fileName: mediaFile.file.name,
        })

        // Use XHR for progress tracking
        const uploadResult = await new Promise<{ path: string } | { error: string }>((resolve) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', `${supabaseUrl}/storage/v1/object/campaign-images/${fileName}`)
          xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`)
          xhr.setRequestHeader('x-upsert', 'true')

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(prev => prev ? { ...prev, fileProgress: Math.round((e.loaded / e.total) * 100) } : null)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({ path: fileName })
            } else {
              resolve({ error: `Upload failed (${xhr.status})` })
            }
          }
          xhr.onerror = () => resolve({ error: 'Network error during upload' })
          xhr.send(mediaFile.file)
        })

        if ('error' in uploadResult) {
          setSubmitError(`Upload failed for ${mediaFile.file.name}: ${uploadResult.error}`)
          setIsSubmitting(false)
          setUploadProgress(null)
          return
        }

        const { data: urlData } = supabase.storage
          .from('campaign-images')
          .getPublicUrl(uploadResult.path)

        uploadedItems.push({ url: urlData.publicUrl, type: mediaFile.type })
        if (mediaFile.isCover) {
          coverImageUrl = urlData.publicUrl
        }
      }

      setUploadProgress(null)

      // Add YouTube video if provided
      const ytId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null
      if (ytId) {
        uploadedItems.push({ url: `https://www.youtube.com/watch?v=${ytId}`, type: 'video' })
      }

      // Fallback: use first image as cover if none explicitly set
      if (coverImageUrl === '/images/placeholder.jpg') {
        const firstImage = uploadedItems.find(i => i.type === 'image')
        if (firstImage) coverImageUrl = firstImage.url
      }

      const result = await createCampaign({
        creator_id: creatorId || undefined,
        creator_name: creatorName,
        title: formData.title,
        description: formData.description,
        goal_amount: parseInt(formData.goalAmount),
        category: formData.category as string,
        cover_image_url: coverImageUrl,
        media_urls: uploadedItems,
      })

      if ('error' in result) {
        setSubmitError(`Failed to create campaign: ${result.error}`)
      } else {
        // Save payout method if new or changed
        if (payoutMethod && creatorId && !hasExistingPayout) {
          await updateUserPayoutMethod(creatorId, payoutMethod, payoutEmail || undefined)
        }
        setIsSuccess(true)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-5rem)] pt-4 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Campaign Submitted!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your campaign has been submitted for review. Our team will review it and notify you once it&apos;s approved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Link href="/dashboard">
              <Button>View Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const heading = STEP_HEADINGS[step] || STEP_HEADINGS[3]

  return (
    <div className="min-h-[calc(100vh-5rem)] pt-4 flex flex-col lg:flex-row">
      {/* Left Panel - Heading & Progress */}
      <div className="lg:w-[45%] bg-white px-8 py-12 lg:px-16 lg:py-20 flex flex-col justify-between">
        <div>
          <Link href="/" className="inline-block mb-12">
            <div className="w-10 h-10 bg-[#274a34] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          </Link>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {heading.title}
          </h1>
          <p className="text-gray-500 text-lg">{heading.subtitle}</p>
        </div>

        {/* Step indicator */}
        <div className="mt-12 lg:mt-0">
          <div className="flex items-center gap-2">
            {activeSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= currentStepIndex
                    ? 'bg-[#274a34] flex-[2]'
                    : 'bg-gray-200 flex-1'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Step {currentStepIndex + 1} of {activeSteps.length}
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:w-[55%] bg-[#FAFAFA] px-8 py-12 lg:px-16 lg:py-20 flex flex-col">
        <div className="flex-1 w-full">
          {/* Step 1: Category */}
          {step === 1 && (
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                What best describes your campaign?
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                Choose the category that fits your cause.
              </p>

              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, category: cat.value })
                      setErrors({})
                    }}
                    className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                      formData.category === cat.value
                        ? 'bg-[#274a34] text-white border-[#274a34]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#274a34] hover:text-[#274a34]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="mt-4 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          )}

          {/* Step 2: Goal Amount */}
          {step === 2 && (
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                How much would you like to raise?
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                Set a realistic goal. You can always adjust it later.
              </p>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">
                  $
                </span>
                <input
                  type="number"
                  min="100"
                  placeholder="50,000"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  className={`w-full pl-10 pr-4 py-4 text-2xl font-semibold border rounded-xl bg-white text-gray-900 placeholder-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent ${
                    errors.goalAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.goalAmount && (
                <p className="mt-2 text-sm text-red-500">{errors.goalAmount}</p>
              )}

              {/* Quick amount buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                {['5000', '10000', '25000', '50000', '100000'].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, goalAmount: amount })
                      setErrors({})
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      formData.goalAmount === amount
                        ? 'bg-[#274a34] text-white border-[#274a34]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-[#274a34]'
                    }`}
                  >
                    ${parseInt(amount).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Campaign Details */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Campaign details
                </h2>
                <p className="text-sm text-gray-500">
                  A great title and description help your campaign stand out.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left column - Text fields */}
                <div className="space-y-6">
                  <Input
                    label="Campaign Title"
                    placeholder="Give your campaign a clear, compelling title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tell your story</label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(html) => setFormData({ ...formData, description: html })}
                      placeholder="Explain why you're raising funds, how the money will be used, and why people should support your cause..."
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  {/* Name field for logged-in users */}
                  {isLoggedIn && (
                    <Input
                      label="Your Name"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  )}
                </div>

                {/* Right column - Media upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos &amp; Video
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Up to 10 photos and 1 video (MP4/WebM, max 30MB). First image is cover.
                  </p>

                  {/* Upload drop zone */}
                  <div
                    ref={dropZoneRef}
                    tabIndex={0}
                    onPaste={handlePaste}
                    className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-3 focus:outline-none focus:ring-2 focus:ring-[#274a34] ${
                      errors.coverImage
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-[#274a34] bg-white'
                    }`}
                    onClick={() => dropZoneRef.current?.querySelector('input')?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dropZoneRef.current?.querySelector('input')?.click() }}
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 font-medium">Click to add photos or video</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, MP4, WebM — or paste from clipboard (Ctrl+V)</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/mp4,video/webm"
                      multiple
                      onChange={handleMediaAdd}
                    />
                  </div>

                  {/* Thumbnail grid */}
                  {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {mediaFiles.map((item, index) => (
                        <div key={index} className="relative group">
                          <div className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            item.isCover ? 'border-[#274a34]' : 'border-transparent'
                          }`}>
                            {item.type === 'image' ? (
                              <img
                                src={item.previewUrl}
                                alt={`Media ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                <video src={item.previewUrl} className="w-full h-full object-cover opacity-50" />
                                <svg className="w-8 h-8 text-white absolute" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {item.isCover && (
                            <span className="absolute top-1 left-1 bg-[#274a34] text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                              Cover
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {item.type === 'image' && !item.isCover && (
                            <button
                              type="button"
                              onClick={() => setCoverImage(index)}
                              className="absolute bottom-1 left-1 right-1 bg-black/60 hover:bg-black/80 text-white text-[10px] py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Set cover
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.coverImage && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.coverImage}</p>
                  )}

                  {/* YouTube video embed */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Video (optional)
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Paste a YouTube link to embed a video in your campaign.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => {
                          setYoutubeUrl(e.target.value)
                          setErrors(prev => ({ ...prev, youtubeUrl: '' }))
                        }}
                        className={`flex-1 px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent ${
                          errors.youtubeUrl ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {youtubeUrl && (
                        <button
                          type="button"
                          onClick={() => setYoutubeUrl('')}
                          className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg bg-white transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {errors.youtubeUrl && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.youtubeUrl}</p>
                    )}
                    {/* YouTube preview */}
                    {youtubeUrl && extractYouTubeId(youtubeUrl) && (
                      <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payout Method */}
          {step === 4 && (
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Choose your payout method
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                This is how you&apos;ll receive the funds raised by your campaign.
              </p>

              <div className="space-y-3">
                {PAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setPayoutMethod(option.value)
                      setErrors({})
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      payoutMethod === option.value
                        ? 'border-[#274a34] bg-[#edffd3]/30'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        payoutMethod === option.value ? 'border-[#274a34]' : 'border-gray-300'
                      }`}>
                        {payoutMethod === option.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#274a34]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {errors.payoutMethod && (
                <p className="mt-3 text-sm text-red-500">{errors.payoutMethod}</p>
              )}

              {/* Email input for PayPal/Wise */}
              {payoutMethod && payoutMethod !== 'stripe' && (
                <div className="mt-6">
                  <Input
                    label={`${payoutMethod === 'paypal' ? 'PayPal' : 'Wise'} email`}
                    type="email"
                    placeholder={`Enter your ${payoutMethod === 'paypal' ? 'PayPal' : 'Wise'} email`}
                    value={payoutEmail}
                    onChange={(e) => { setPayoutEmail(e.target.value); setErrors({}) }}
                    error={errors.payoutEmail}
                  />
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> Amanatick retains a 5% platform fee from each donation. The remaining 95% will be sent to you via your chosen payout method.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Account (only for non-logged-in users) */}
          {step === 5 && !isLoggedIn && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {authMode === 'signup' ? 'Create your account' : 'Sign in to your account'}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {authMode === 'signup'
                    ? 'Create an account to manage your campaign and receive donations.'
                    : 'Sign in with your existing account.'}
                </p>
              </div>

              {/* Toggle between signup and login */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrors({}); setSubmitError('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    authMode === 'signup'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrors({}); setSubmitError('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign in
                </button>
              </div>

              {authMode === 'signup' && (
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={errors.fullName}
                />
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                placeholder={authMode === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />

              {authMode === 'signup' && (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                />
              )}
            </div>
          )}
        </div>

        {/* Upload progress */}
        {uploadProgress && (
          <div className="max-w-xl mt-6 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Uploading file {uploadProgress.currentFile} of {uploadProgress.totalFiles}
              </p>
              <span className="text-sm text-gray-500">{uploadProgress.fileProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#274a34] rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress.fileProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 truncate">{uploadProgress.fileName}</p>
          </div>
        )}

        {/* Error display */}
        {submitError && (
          <div className="max-w-xl mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="max-w-xl mt-10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <Link href="/" className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
              Cancel
            </Link>
          )}

          {!isLastStep ? (
            <Button onClick={nextStep} size="lg" className="px-10">
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              size="lg"
              className="px-10"
              disabled={isSubmitting}
            >
              {uploadProgress ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Submit Campaign'}
            </Button>
          )}
        </div>

        {/* Terms notice on last step */}
        {isLastStep && (
          <p className="max-w-xl mt-4 text-xs text-gray-400">
            By submitting, you agree to our Terms of Service and confirm that all information provided is accurate.
          </p>
        )}
      </div>
    </div>
  )
}
