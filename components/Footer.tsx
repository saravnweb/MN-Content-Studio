import React from 'react'
import Link from 'next/link'
import { Camera, X, Link2 } from 'lucide-react'
import BrandLogo from './BrandLogo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 border-t border-gray-800 pt-16 pb-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center space-y-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <BrandLogo withLink={true} size={32} textClassName="text-xl font-bold tracking-tight text-gray-100" />
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              India&apos;s creator-to-brand fulfillment network. Real orders, real brands.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" label="Instagram" icon={<Camera className="w-4 h-4" />} />
              <SocialLink href="#" label="X (Twitter)" icon={<X className="w-4 h-4" />} />
              <SocialLink href="#" label="LinkedIn" icon={<Link2 className="w-4 h-4" />} />
              <SocialLink
                href="https://wa.me/918428601947"
                label="WhatsApp"
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                }
                className="hover:text-[#25D366] hover:border-[#25D366]/30"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-center">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Platform</h3>
              <ul className="space-y-2">
                <li><FooterLink href="/">Home</FooterLink></li>
                <li><FooterLink href="/explore">Browse Deals</FooterLink></li>
                <li><FooterLink href="/creators">For Creators</FooterLink></li>
                <li><FooterLink href="/brands">For Brands</FooterLink></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Support</h3>
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
          <p className="text-[11px] text-gray-400 font-medium">
            © {currentYear} MN Content Studio. All rights reserved.
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

function SocialLink({ href, label, icon, className }: { href: string; label: string; icon: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={`w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-100 hover:border-gray-700 hover:bg-gray-800 transition-all duration-200 ${className ?? ''}`}
    >
      {icon}
    </Link>
  )
}
