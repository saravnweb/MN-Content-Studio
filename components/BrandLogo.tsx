import Link from 'next/link'

interface BrandLogoProps {
  className?: string
  size?: number
  withLink?: boolean
  textClassName?: string
}

export default function BrandLogo({ 
  className = '', 
  size = 24, 
  withLink = true,
  textClassName = 'font-bold text-sm tracking-tight text-gray-100'
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center ${className}`}>
      <span className={textClassName}>MN Content Studio</span>
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
