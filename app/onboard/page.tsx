'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileSetupForm from '@/components/ProfileSetupForm'

interface ProfileFormData {
  name: string
  role: string
  company: string
  current_work: string
  looking_for: string[]
  can_offer: string[]
  interests: string[]
}

export default function OnboardPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ProfileFormData) => {
    setError(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          setError('AI service is busy. Please try again in a few moments.')
        } else if (response.status === 503) {
          setError('AI service temporarily unavailable. Please try again.')
        } else if (result.error) {
          setError(result.error)
        } else {
          setError('Failed to create profile. Please try again.')
        }
        return
      }

      // Success - redirect to events page
      router.push('/events')
    } catch (err) {
      console.error('Error submitting profile:', err)
      setError('Network error. Please check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Serendipity
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about yourself so we can match you with the right people and events
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white shadow-sm rounded-lg p-8">
          <ProfileSetupForm onSubmit={handleSubmit} />
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your profile helps us personalize event recommendations and connect you with relevant people
          </p>
        </div>
      </div>
    </div>
  )
}
