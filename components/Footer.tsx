import Image from 'next/image'
import Link from 'next/link'

const footerLinks = [
  {
    title: 'Services',
    links: [
      { label: 'Web Development', href: '#services' },
      { label: 'SEO Optimization', href: '#services' },
      { label: 'Business Automation', href: '#services' },
      { label: 'Customer Portals', href: '#services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Process', href: '#work' },
      { label: 'Tech Stack', href: '#tech' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Twitter', href: 'https://twitter.com' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'LinkedIn', href: 'https://linkedin.com' },
      { label: 'Discord', href: 'https://discord.gg' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-dark-600 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logonobg.png"
                alt="FLUX"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              High-performance web development and automation for modern brands.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FLUX Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
