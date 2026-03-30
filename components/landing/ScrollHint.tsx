'use client'

import { ChevronDown } from 'lucide-react'

export default function ScrollHint() {
  return (
    <div 
      className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40 hover:opacity-100 transition-opacity cursor-default pointer-events-none select-none z-20"
      aria-hidden="true"
    >
      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
    </div>
  )
}
