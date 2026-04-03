'use client'

import { useState, useTransition } from 'react'
import { toggleHomepageFeature } from './actions'

interface Props {
  applicationId: string
  isFeatured: boolean
}

export default function FeatureToggleButton({ applicationId, isFeatured }: Props) {
  const [featured, setFeatured] = useState(isFeatured)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    const next = !featured
    setFeatured(next) // optimistic update
    startTransition(async () => {
      try {
        await toggleHomepageFeature(applicationId, next)
      } catch {
        setFeatured(!next) // revert on error
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      title={featured ? 'Remove from homepage showcase' : 'Feature on homepage'}
      aria-label={featured ? 'Remove from homepage showcase' : 'Feature on homepage'}
      className={`shrink-0 p-1.5 rounded-lg border transition-all ${
        featured
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
          : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-amber-400 hover:border-amber-500/30'
      } ${pending ? 'opacity-50 cursor-wait' : ''}`}
    >
      {/* Star icon */}
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill={featured ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={featured ? 0 : 1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    </button>
  )
}
