'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { target: 246, suffix: '',  label: 'Creators' },
  { target: 16,  suffix: '',  label: 'Niches' },
  { target: 100, suffix: '%', label: 'Verified Brands' },
]

function useCountUp(target: number, duration = 1400, active: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    let start: number | null = null
    let raf: number

    function step(ts: number) {
      if (start === null) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])

  return count
}

function StatItem({ target, suffix, label, active }: { target: number; suffix: string; label: string; active: boolean }) {
  const count = useCountUp(target, 1400, active)
  return (
    <div>
      <dt className="text-meta font-medium order-last tracking-[0.05em] uppercase">{label}</dt>
      <dd className="text-sm sm:text-base font-bold text-gray-100 tabular-nums">
        {count}{suffix}
      </dd>
    </div>
  )
}

export default function AnimatedStats() {
  const ref = useRef<HTMLDListElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect() } },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <dl ref={ref} className="flex items-center gap-6 text-center">
      {STATS.map((s) => (
        <StatItem key={s.label} {...s} active={active} />
      ))}
    </dl>
  )
}
