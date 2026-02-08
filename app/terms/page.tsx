import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Flux Studio, LLC. Read our terms for web design, SEO, and business automation services.',
  alternates: {
    canonical: '/terms',
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

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-3xl" />
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
            <span className="inline-block px-3 py-1 text-xs font-medium text-neon-blue bg-neon-blue/10 rounded-full border border-neon-blue/20">
              Legal
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-gray-400">Last updated: February 8, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        <SectionCard number="1" title="Agreement to Terms">
          <p>
            By accessing or using the website builtbyflux.com and engaging the services of Flux
            Studio, LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, do not use our website or
            services.
          </p>
        </SectionCard>

        <SectionCard number="2" title="Services">
          <p>
            Flux Studio, LLC provides web design, development, SEO optimization, content management
            setup, and business automation services. The specific scope, deliverables, timeline,
            and pricing for each project will be outlined in a separate project proposal or
            agreement.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue any aspect of our services at
            any time. We will provide reasonable notice of any changes that affect active projects.
          </p>
        </SectionCard>

        <SectionCard number="3" title="Project Agreements">
          <p>
            Each project is governed by a project proposal or statement of work that outlines:
          </p>
          <ul className="space-y-2">
            <ListItem>Scope of work and deliverables</ListItem>
            <ListItem>Timeline and milestones</ListItem>
            <ListItem>Pricing and payment schedule</ListItem>
            <ListItem>Number of revision rounds included</ListItem>
            <ListItem>Responsibilities of both parties</ListItem>
          </ul>
          <p>
            In the event of a conflict between these Terms and a project agreement, the project
            agreement will take precedence for matters related to that specific project.
          </p>
        </SectionCard>

        <SectionCard number="4" title="Payment Terms">
          <ul className="space-y-2">
            <ListItem>
              Payment schedules and amounts are specified in each project proposal. A deposit is
              typically required before work begins.
            </ListItem>
            <ListItem>
              Invoices are due upon receipt unless otherwise specified. Late payments may incur
              additional fees and may result in work being paused until the balance is resolved.
            </ListItem>
            <ListItem>
              All fees are quoted in U.S. dollars unless stated otherwise.
            </ListItem>
            <ListItem>
              You are responsible for any applicable taxes related to the services.
            </ListItem>
          </ul>
        </SectionCard>

        <SectionCard number="5" title="Intellectual Property & Ownership">
          <h3 className="text-base font-medium text-white pt-1">Your Content</h3>
          <p>
            You retain ownership of all content, logos, images, copy, and branding materials you
            provide to us. You grant us a limited license to use these materials solely for the
            purpose of delivering the agreed-upon services.
          </p>
          <h3 className="text-base font-medium text-white pt-2">Deliverables</h3>
          <div className="p-4 rounded-xl bg-neon-purple/5 border border-neon-purple/10">
            <p className="text-sm text-gray-300">
              Upon full payment, you receive <span className="text-white font-medium">full ownership</span> of all custom code, designs, and
              deliverables created for your project. This includes source code, design files, and
              any custom assets we create specifically for you.
            </p>
          </div>
          <h3 className="text-base font-medium text-white pt-2">Third-Party Tools</h3>
          <p>
            Our work may incorporate open-source software, third-party libraries, or licensed
            tools. These remain subject to their respective licenses. We will inform you of any
            significant third-party dependencies in your project.
          </p>
        </SectionCard>

        <SectionCard number="6" title="Client Responsibilities">
          <p>To ensure successful project delivery, you agree to:</p>
          <ul className="space-y-2">
            <ListItem>Provide requested content, images, and feedback in a timely manner</ListItem>
            <ListItem>Designate a point of contact for project communications</ListItem>
            <ListItem>Review and approve deliverables within agreed-upon timeframes</ListItem>
            <ListItem>Ensure that all materials you provide do not infringe on third-party rights</ListItem>
            <ListItem>Provide accurate business information for SEO and directory listings</ListItem>
          </ul>
          <p>
            Delays in providing materials or feedback may result in adjusted timelines.
          </p>
        </SectionCard>

        <SectionCard number="7" title="Revisions & Changes">
          <p>
            Each project includes a specified number of revision rounds as outlined in the project
            proposal. Additional revisions or changes to the original scope may be subject to
            additional fees. We will notify you before any additional charges are incurred.
          </p>
        </SectionCard>

        <SectionCard number="8" title="Hosting & Maintenance">
          <p>
            Unless otherwise agreed, hosting and domain management are the client&apos;s
            responsibility. We can recommend hosting providers and assist with setup. Ongoing
            maintenance and support services are available under separate agreements.
          </p>
        </SectionCard>

        <SectionCard number="9" title="Confidentiality">
          <p>
            Both parties agree to keep confidential any proprietary or sensitive information
            shared during the course of a project. This includes business strategies, login
            credentials, customer data, and unpublished designs. This obligation survives the
            termination of our business relationship.
          </p>
        </SectionCard>

        <SectionCard number="10" title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law:
          </p>
          <ul className="space-y-2">
            <ListItem>
              Flux Studio, LLC shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits, data, or business
              opportunities.
            </ListItem>
            <ListItem>
              Our total liability for any claim arising from our services shall not exceed the
              total amount you paid us for the specific project in question.
            </ListItem>
            <ListItem>
              We are not liable for damages resulting from circumstances beyond our reasonable
              control, including third-party service outages, hosting failures, or force majeure
              events.
            </ListItem>
          </ul>
        </SectionCard>

        <SectionCard number="11" title="Warranties & Disclaimers">
          <p>
            We take pride in our work and strive to deliver high-quality results. However:
          </p>
          <ul className="space-y-2">
            <ListItem>
              Our services are provided &quot;as is&quot; without warranties of any kind, express
              or implied, unless specified in a project agreement.
            </ListItem>
            <ListItem>
              We do not guarantee specific search engine rankings, traffic volumes, or business
              results from SEO services. Search engines control their own algorithms.
            </ListItem>
            <ListItem>
              We will make reasonable efforts to deliver projects on time, but timelines are
              estimates and may be affected by factors outside our control.
            </ListItem>
          </ul>
        </SectionCard>

        <SectionCard number="12" title="Termination">
          <p>
            Either party may terminate a project agreement with written notice. In the event of
            termination:
          </p>
          <ul className="space-y-2">
            <ListItem>You are responsible for payment of all work completed up to the termination date</ListItem>
            <ListItem>Deposits are non-refundable unless otherwise specified in the project agreement</ListItem>
            <ListItem>We will provide all completed deliverables and source files for work that has been paid for</ListItem>
            <ListItem>Any outstanding balances remain due and payable</ListItem>
          </ul>
        </SectionCard>

        <SectionCard number="13" title="Governing Law">
          <p>
            These Terms are governed by the laws of the State of Georgia, United States, without
            regard to its conflict of law provisions. Any disputes arising from these terms or our
            services shall be resolved in the courts of Cherokee County, Georgia.
          </p>
        </SectionCard>

        <SectionCard number="14" title="Changes to These Terms">
          <p>
            We may update these Terms of Service from time to time. Changes will be posted on this
            page with an updated &quot;Last updated&quot; date. Continued use of our website or
            services after changes are posted constitutes acceptance of the revised terms.
          </p>
        </SectionCard>

        <SectionCard number="15" title="Contact Us">
          <p>
            If you have questions about these Terms of Service, contact us at:
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
