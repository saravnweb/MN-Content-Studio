import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  className?: string
  size?: number
  withLink?: boolean
  textClassName?: string
}

export default function BrandLogo({ 
  className = '', 
  size = 32, 
  withLink = true,
  textClassName = 'font-bold text-sm tracking-tight text-gray-100'
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative shrink-0 overflow-hidden rounded-lg flex items-center justify-center p-0" 
        style={{ width: size, height: size }}
      >
        <Image 
          src="/logo.png" 
          alt="MW Content Studio Logo" 
          width={size} 
          height={size} 
          className="object-contain"
          priority
        />
      </div>
      <span className={textClassName}>MW Content Studio</span>
    </div>
  )

  if (withLink) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
