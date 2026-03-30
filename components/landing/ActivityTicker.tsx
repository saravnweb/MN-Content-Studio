'use client'

import { useEffect, useState } from 'react'

const FEED = [
  { emoji: '🤝', text: 'Arjun S. is now collaborating with Boat Lifestyle' },
  { emoji: '✨', text: 'Meera R. launched a new Fitness partnership' },
  { emoji: '💎', text: '3 exclusive brand campaigns just went live' },
  { emoji: '✅', text: 'Priya K. delivered a bespoke campaign for a Food brand' },
  { emoji: '🚀', text: 'A premium Tech brand is seeking 5 elite YouTube creators' },
  { emoji: '🌟', text: 'Rahul M. completed a distinguished brand partnership' },
]

export default function ActivityTicker() {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % FEED.length)
        setShow(true)
      }, 350)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  const item = FEED[idx]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium transition-opacity duration-300"
      style={{ opacity: show ? 1 : 0 }}
    >
      <span className="text-sm" aria-hidden="true">{item.emoji}</span>
      <span>{item.text}</span>
    </div>
  )
}
