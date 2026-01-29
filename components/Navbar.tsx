'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#work', label: 'How We Work' },
    { href: '#tech', label: 'Tech Stack' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-dark-900/95 backdrop-blur-lg border-b border-dark-600/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group z-10">
            <Image
              src="/images/logonobg.png"
              alt="FLUX"
              width={48}
              height={48}
              className="h-10 sm:h-12 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center absolute inset-0">
            <div className="flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium leading-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Buttons - Right */}
          <div className="hidden md:flex items-center gap-3 z-10">
            <Link
              href="/portal"
              className="inline-flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-dark-600 hover:border-dark-500"
            >
              Client Portal
            </Link>
            <Link href="#contact" className="btn-primary text-sm !py-2 leading-none">
              Start a Project
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-600/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-dark-600 hover:border-dark-500 text-center"
                >
                  Client Portal
                </Link>
                <Link
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary text-sm text-center"
                >
                  Start a Project
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
