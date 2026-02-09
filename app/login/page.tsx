import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your FLUX client portal.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="inline-block mb-8">
        <Image
          src="/images/logonobg.png"
          alt="FLUX"
          width={64}
          height={64}
          className="h-16 w-auto mx-auto"
        />
      </Link>

      <Suspense>
        <LoginForm />
      </Suspense>

      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mt-8 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to home
      </Link>
    </div>
  )
}
