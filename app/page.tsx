'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (user) {
    router.push('/events')
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Serendipity
        </h1>
        <p className="text-2xl text-gray-700 mb-4">AI-Powered Ambient Networking</p>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Transform networking from a manual, pull-based process into an intelligent, ambient experience. 
          Get personalized event recommendations, meet the right people, and maintain relationships effortlessly.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Smart Event Discovery</h3>
            <p className="text-gray-600">Get personalized event recommendations based on your goals and interests</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Intelligent Matching</h3>
            <p className="text-gray-600">Know who to meet and why before you arrive at any event</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold mb-2">Relationship Management</h3>
            <p className="text-gray-600">Automated follow-ups and contact tracking to maintain connections</p>
          </div>
        </div>
      </div>
    </main>
  )
}
