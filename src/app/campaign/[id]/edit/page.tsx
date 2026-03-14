'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MediaItem } from '@/types'
import { getCampaignById, createCampaignEdit, getPendingEditForCampaign } from '@/lib/supabase-queries'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import RichTextEditor from '@/components/ui/RichTextEditor'

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [campaignId, setCampaignId] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [hasPendingEdit, setHasPendingEdit] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([])
  const [removedMediaUrls, setRemovedMediaUrls] = useState<Set<string>>(new Set())
  const [newMediaFiles, setNewMediaFiles] = useState<{
    file: File
    previewUrl: string
    type: 'image' | 'video'
  }[]>([])
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<{
    currentFile: number
    totalFiles: number
    fileProgress: number
    fileName: string
  } | null>(null)

  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(p => setCampaignId(p.id))
  }, [params])

  useEffect(() => {
    if (!campaignId || authLoading) return
    if (!user) { router.push('/auth/login'); return }

    async function load() {
      const [campaign, pendingEdit] = await Promise.all([
        getCampaignById(campaignId),
        getPendingEditForCampaign(campaignId),
      ])

      if (!campaign) { router.push('/dashboard/campaigns'); return }
      if (campaign.creator_id !== user!.id) { router.push('/dashboard/campaigns'); return }

      if (pendingEdit) {
        setHasPendingEdit(true)
      }

      setTitle(campaign.title)
      setDescription(campaign.description)
      setCoverImageUrl(campaign.cover_image_url)

      // Separate YouTube from regular media
      const regular: MediaItem[] = []
      for (const item of campaign.media_urls || []) {
        if (item.type === 'video' && extractYouTubeId(item.url)) {
          setYoutubeUrl(item.url)
        } else {
          regular.push(item)
        }
      }
      setExistingMedia(regular)
      setLoading(false)
    }
    load()
  }, [campaignId, user, authLoading, router])

  const handleNewMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setErrors(prev => ({ ...prev, media: '' }))

    const newItems = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
    }))

    setNewMediaFiles(prev => [...prev, ...newItems].slice(0, 10))
    e.target.value = ''
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

    const newItems = imageFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: 'image' as const,
    }))

    setNewMediaFiles(prev => [...prev, ...newItems].slice(0, 10))
  }, [])

  const removeExistingMedia = (url: string) => {
    setRemovedMediaUrls(prev => new Set(prev).add(url))
  }

  const removeNewMedia = (index: number) => {
    setNewMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    const plainText = description.replace(/<[^>]*>/g, '').trim()
    if (!plainText || description === '<p></p>') {
      newErrors.description = 'Description is required'
    } else if (plainText.length < 100) {
      newErrors.description = 'Description must be at least 100 characters'
    }
    if (youtubeUrl && !extractYouTubeId(youtubeUrl)) {
      newErrors.youtubeUrl = 'Please enter a valid YouTube URL'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Upload new media files
      const uploadedItems: MediaItem[] = []
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      for (let i = 0; i < newMediaFiles.length; i++) {
        const mediaFile = newMediaFiles[i]
        const fileExt = mediaFile.file.name.split('.').pop() || 'png'
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

        setUploadProgress({
          currentFile: i + 1,
          totalFiles: newMediaFiles.length,
          fileProgress: 0,
          fileName: mediaFile.file.name,
        })

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
            if (xhr.status >= 200 && xhr.status < 300) resolve({ path: fileName })
            else resolve({ error: `Upload failed (${xhr.status})` })
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
      }

      setUploadProgress(null)

      // Build final media list: keep existing (minus removed) + new uploads + YouTube
      const finalMedia: MediaItem[] = [
        ...existingMedia.filter(m => !removedMediaUrls.has(m.url)),
        ...uploadedItems,
      ]

      const ytId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null
      if (ytId) {
        finalMedia.push({ url: `https://www.youtube.com/watch?v=${ytId}`, type: 'video' })
      }

      // Determine cover image
      let finalCover = coverImageUrl
      const keptExisting = existingMedia.filter(m => !removedMediaUrls.has(m.url) && m.type === 'image')
      if (removedMediaUrls.has(coverImageUrl)) {
        const firstImage = keptExisting[0] || uploadedItems.find(i => i.type === 'image')
        finalCover = firstImage?.url || coverImageUrl
      }

      const result = await createCampaignEdit({
        campaign_id: campaignId,
        title: title.trim(),
        description,
        cover_image_url: finalCover,
        media_urls: finalMedia,
      })

      if ('error' in result) {
        setSubmitError(result.error)
      } else {
        setIsSuccess(true)
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] pt-28 px-4 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-5rem)] pt-28 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Changes Submitted!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your edits have been submitted for review. The campaign will remain unchanged until an admin approves your changes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/campaign/${campaignId}`}>
              <Button variant="outline">View Campaign</Button>
            </Link>
            <Link href="/dashboard/campaigns">
              <Button>My Campaigns</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const keptExisting = existingMedia.filter(m => !removedMediaUrls.has(m.url))

  return (
    <div className="min-h-[calc(100vh-5rem)] pt-28 pb-16 px-4 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/campaigns" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">&larr; Back to campaigns</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
        <p className="text-gray-500 text-sm mt-1">Changes will be reviewed by an admin before going live.</p>
      </div>

      {hasPendingEdit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This campaign already has a pending edit awaiting review. Submitting new changes will replace the previous pending edit.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {/* Title */}
        <Input
          label="Campaign Title"
          placeholder="Campaign title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Story</label>
          <RichTextEditor
            content={description}
            onChange={setDescription}
            placeholder="Tell your campaign story..."
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos &amp; Video</label>
          <p className="text-xs text-gray-400 mb-3">
            Manage your campaign media. You can remove existing images and add new ones.
          </p>

          {/* Existing media */}
          {keptExisting.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {keptExisting.map((item) => (
                <div key={item.url} className="relative group">
                  <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    item.url === coverImageUrl ? 'border-[#274a34]' : 'border-transparent'
                  }`}>
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    )}
                  </div>
                  {item.url === coverImageUrl && (
                    <span className="absolute top-1 left-1 bg-[#274a34] text-white text-[10px] font-medium px-1.5 py-0.5 rounded">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingMedia(item.url)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {item.type === 'image' && item.url !== coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(item.url)}
                      className="absolute bottom-1 left-1 right-1 bg-black/60 hover:bg-black/80 text-white text-[10px] py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Set cover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New media */}
          {newMediaFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {newMediaFiles.map((item, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-300">
                    {item.type === 'image' ? (
                      <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    )}
                  </div>
                  <span className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">New</span>
                  <button
                    type="button"
                    onClick={() => removeNewMedia(index)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            ref={dropZoneRef}
            tabIndex={0}
            onPaste={handlePaste}
            className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#274a34] border-gray-300 hover:border-[#274a34] bg-white"
            onClick={() => dropZoneRef.current?.querySelector('input')?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dropZoneRef.current?.querySelector('input')?.click() }}
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">Add more photos or video</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, MP4, WebM — or paste from clipboard (Ctrl+V)</p>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/mp4,video/webm"
              multiple
              onChange={handleNewMedia}
            />
          </div>

          {/* YouTube */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video (optional)</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => { setYoutubeUrl(e.target.value); setErrors(prev => ({ ...prev, youtubeUrl: '' })) }}
                className={`flex-1 px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent ${
                  errors.youtubeUrl ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {youtubeUrl && (
                <button type="button" onClick={() => setYoutubeUrl('')} className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg bg-white">
                  Clear
                </button>
              )}
            </div>
            {errors.youtubeUrl && <p className="mt-1.5 text-sm text-red-500">{errors.youtubeUrl}</p>}
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

        {/* Upload progress */}
        {uploadProgress && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Uploading file {uploadProgress.currentFile} of {uploadProgress.totalFiles}
              </p>
              <span className="text-sm text-gray-500">{uploadProgress.fileProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#274a34] rounded-full transition-all duration-200" style={{ width: `${uploadProgress.fileProgress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 truncate">{uploadProgress.fileName}</p>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link href="/dashboard/campaigns" className="text-gray-500 hover:text-gray-700 font-medium text-sm">
            Cancel
          </Link>
          <Button onClick={handleSubmit} size="lg" className="px-10" disabled={isSubmitting}>
            {uploadProgress ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Submit Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
