'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup } from './actions'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const handleOAuth = async (provider: 'google') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8 rounded-2xl bg-dark-800 border border-dark-600">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-400 text-center mb-8">
          {isSignUp ? 'Sign up for your client portal' : 'Sign in to your client portal'}
        </p>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-sm">
            {message}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white font-medium hover:border-dark-500 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-dark-800 text-gray-500">or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form action={isSignUp ? signup : login} className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold hover:from-neon-purple/90 hover:to-neon-blue/90 transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/20"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-neon-purple hover:text-neon-purple/80 transition-colors font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
