import React from 'react'
import Link from 'next/link'
import { Camera, X, Link2 } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 border-t border-gray-800 pt-16 pb-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center space-y-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold tracking-tight text-gray-100">MW Content Studio</h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              India&apos;s creator-to-brand fulfillment network. Real orders, real brands.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" label="Instagram" icon={<Camera className="w-4 h-4" />} />
              <SocialLink href="#" label="X (Twitter)" icon={<X className="w-4 h-4" />} />
              <SocialLink href="#" label="LinkedIn" icon={<Link2 className="w-4 h-4" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-center">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Platform</h3>
              <ul className="space-y-2">
                <li><FooterLink href="/">Home</FooterLink></li>
                <li><FooterLink href="/creators">For Creators</FooterLink></li>
                <li><FooterLink href="/brands">For Brands</FooterLink></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Support</h3>
              <ul className="space-y-2">
                <li><FooterLink href="/help">Help Center</FooterLink></li>
                <li><FooterLink href="/terms">Terms</FooterLink></li>
                <li><FooterLink href="/privacy">Privacy</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex justify-center items-center gap-4 text-center">
          <p className="text-[11px] text-gray-600 font-medium">
            © {currentYear} MW Content Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-sm text-gray-400 hover:text-gray-100 transition-colors duration-200 block"
    >
      {children}
    </Link>
  )
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-100 hover:border-gray-700 hover:bg-gray-800 transition-all duration-200"
    >
      {icon}
    </Link>
  )
}
