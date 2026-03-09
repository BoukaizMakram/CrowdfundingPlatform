'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await signIn(formData.email, formData.password)

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Check if admin
    if (formData.email === 'admin@amanatick.com') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#274a34] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Amanatick account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div className="mt-2 text-right">
              <Link href="/auth/forgot-password" className="text-sm text-emerald-500 hover:text-emerald-600">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-emerald-500 hover:text-emerald-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
