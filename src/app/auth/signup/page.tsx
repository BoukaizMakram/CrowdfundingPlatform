'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { signUp } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setSubmitError('')

    const result = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone || undefined
    )

    if ('error' in result) {
      setSubmitError(result.error)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
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
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-600 mt-2">Join Amanatick and start making a difference</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {submitError}
              {submitError.includes('already exists') && (
                <Link href="/auth/login" className="block mt-2 text-emerald-600 hover:text-emerald-700 font-medium underline">
                  Go to Sign in
                </Link>
              )}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+212 6XX XXX XXX"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
          />

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-emerald-500 hover:text-emerald-600">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-emerald-500 hover:text-emerald-600">
            Privacy Policy
          </Link>
        </p>

        {/* Sign in link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-emerald-500 hover:text-emerald-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
