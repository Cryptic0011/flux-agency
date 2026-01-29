import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Client Portal',
  description: 'Access your FLUX client portal to manage projects, view progress, and communicate with your team.',
}

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
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

        {/* Card */}
        <div className="p-8 rounded-2xl bg-dark-800 border border-dark-600">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Client Portal</h1>
          <p className="text-gray-400 mb-8">
            The client portal is coming soon. You&apos;ll be able to track project progress,
            view deliverables, and communicate with your FLUX team.
          </p>

          {/* Placeholder Form */}
          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="Email address"
              disabled
              className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-gray-500 placeholder-gray-500 cursor-not-allowed"
            />
            <input
              type="password"
              placeholder="Password"
              disabled
              className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-gray-500 placeholder-gray-500 cursor-not-allowed"
            />
            <button
              disabled
              className="w-full px-4 py-3 rounded-lg bg-dark-600 text-gray-500 font-medium cursor-not-allowed"
            >
              Sign In (Coming Soon)
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Existing client?{' '}
            <Link href="#contact" className="text-neon-purple hover:text-neon-purple/80 transition-colors">
              Contact us
            </Link>{' '}
            for access.
          </p>
        </div>

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
    </div>
  )
}
