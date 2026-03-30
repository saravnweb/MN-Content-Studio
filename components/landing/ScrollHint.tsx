'use client'

import { ChevronDown } from 'lucide-react'

export default function ScrollHint() {
  return (
    <div 
      className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-80 hover:opacity-100 transition-opacity cursor-default pointer-events-none select-none z-20"
      aria-hidden="true"
    >
      <ChevronDown className="w-5 h-5 text-gray-300 dark:text-gray-200" strokeWidth={2.5} />
    </div>
  )
}
