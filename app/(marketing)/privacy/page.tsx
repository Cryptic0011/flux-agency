import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Flux Studio, LLC. Learn how we collect, use, and protect your information.',
  alternates: {
    canonical: '/privacy',
  },
}

function SectionCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="relative p-6 sm:p-8 rounded-2xl bg-dark-800/40 border border-dark-600/50 hover:border-dark-500/50 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center text-sm font-bold gradient-text">
          {number}
        </span>
        <h2 className="text-xl font-semibold text-white pt-0.5">{title}</h2>
      </div>
      <div className="pl-12 text-gray-300 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <svg className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span>{children}</span>
    </li>
  )
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.02]" />

      {/* Header */}
      <div className="relative border-b border-dark-600/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium text-neon-purple bg-neon-purple/10 rounded-full border border-neon-purple/20">
              Legal
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-gray-400">Last updated: February 8, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        <SectionCard number="1" title="Introduction">
          <p>
            Flux Studio, LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website
            builtbyflux.com. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website or engage our services. By using
            our website, you agree to the practices described in this policy.
          </p>
        </SectionCard>

        <SectionCard number="2" title="Information We Collect">
          <p>We may collect the following types of information:</p>
          <h3 className="text-base font-medium text-white pt-2">Personal Information You Provide</h3>
          <ul className="space-y-2">
            <ListItem>Name, email address, and phone number when you fill out a contact form or request a consultation</ListItem>
            <ListItem>Business name and website URL when discussing project requirements</ListItem>
            <ListItem>Payment and billing information when you engage our services</ListItem>
            <ListItem>Any other information you choose to provide in communications with us</ListItem>
          </ul>
          <h3 className="text-base font-medium text-white pt-2">Information Collected Automatically</h3>
          <ul className="space-y-2">
            <ListItem>Device and browser type, operating system, and screen resolution</ListItem>
            <ListItem>IP address and approximate geographic location</ListItem>
            <ListItem>Pages visited, time spent on pages, and referring URLs</ListItem>
            <ListItem>Cookies and similar tracking technologies (see Section 5)</ListItem>
          </ul>
        </SectionCard>

        <SectionCard number="3" title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="space-y-2">
            <ListItem>Respond to your inquiries and provide requested services</ListItem>
            <ListItem>Send project updates, invoices, and service-related communications</ListItem>
            <ListItem>Improve our website, services, and user experience</ListItem>
            <ListItem>Analyze website traffic and usage patterns</ListItem>
            <ListItem>Comply with legal obligations</ListItem>
          </ul>
          <div className="mt-4 p-4 rounded-xl bg-neon-purple/5 border border-neon-purple/10">
            <p className="text-sm text-gray-300">
              We do <span className="text-white font-medium">not</span> sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </div>
        </SectionCard>

        <SectionCard number="4" title="Third-Party Services">
          <p>We may use third-party services that collect information on our behalf, including:</p>
          <ul className="space-y-2">
            <ListItem><span className="text-white font-medium">Analytics providers</span> (e.g., Google Analytics) to understand how visitors use our site</ListItem>
            <ListItem><span className="text-white font-medium">Hosting providers</span> (e.g., Vercel) to serve our website</ListItem>
            <ListItem><span className="text-white font-medium">Email services</span> to deliver communications</ListItem>
            <ListItem><span className="text-white font-medium">Payment processors</span> to handle billing securely</ListItem>
          </ul>
          <p>
            These services have their own privacy policies governing their use of your information.
            We encourage you to review their policies.
          </p>
        </SectionCard>

        <SectionCard number="5" title="Cookies">
          <p>
            Our website may use cookies and similar technologies to enhance your browsing
            experience and collect usage data. Cookies are small text files stored on your device.
            You can control cookie preferences through your browser settings. Disabling cookies may
            affect some website functionality.
          </p>
        </SectionCard>

        <SectionCard number="6" title="Data Security">
          <p>
            We implement reasonable technical and organizational measures to protect your personal
            information from unauthorized access, alteration, disclosure, or destruction. However,
            no method of transmission over the Internet or electronic storage is 100% secure, and
            we cannot guarantee absolute security.
          </p>
        </SectionCard>

        <SectionCard number="7" title="Data Retention">
          <p>
            We retain personal information only for as long as necessary to fulfill the purposes
            described in this policy, comply with legal obligations, resolve disputes, and enforce
            our agreements. Contact and project information may be retained for the duration of our
            business relationship and a reasonable period thereafter.
          </p>
        </SectionCard>

        <SectionCard number="8" title="Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="space-y-2">
            <ListItem>Access the personal information we hold about you</ListItem>
            <ListItem>Request correction of inaccurate information</ListItem>
            <ListItem>Request deletion of your personal information</ListItem>
            <ListItem>Opt out of marketing communications</ListItem>
            <ListItem>Request a copy of your data in a portable format</ListItem>
          </ul>
          <p>
            To exercise any of these rights, contact us at the email address below.
          </p>
        </SectionCard>

        <SectionCard number="9" title="Children's Privacy">
          <p>
            Our website and services are not directed to individuals under the age of 18. We do
            not knowingly collect personal information from children. If we learn that we have
            collected information from a child, we will take steps to delete it promptly.
          </p>
        </SectionCard>

        <SectionCard number="10" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated &quot;Last updated&quot; date. Your continued use of our website
            after changes are posted constitutes acceptance of the revised policy.
          </p>
        </SectionCard>

        <SectionCard number="11" title="Contact Us">
          <p>
            If you have questions about this Privacy Policy or your personal information, contact us at:
          </p>
          <div className="mt-2 inline-flex flex-col p-5 rounded-xl bg-gradient-to-br from-dark-700/60 to-dark-800/40 border border-dark-500/50">
            <p className="text-white font-semibold mb-0.5">Flux Studio, LLC</p>
            <p className="text-sm text-gray-400 mb-3">Canton, Georgia</p>
            <a
              href="mailto:graysonbpatterson@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-neon-purple hover:text-neon-purple/80 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              graysonbpatterson@gmail.com
            </a>
          </div>
        </SectionCard>

      </div>
    </div>
  )
}
