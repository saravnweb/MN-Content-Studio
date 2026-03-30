'use client'

export default function ScrollHint() {
  return (
    <button
      onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}
      className="flex flex-col items-center gap-1.5 text-gray-400 absolute bottom-10 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 rounded-lg p-2"
      aria-label="Scroll to discover creators"
    >
      <span className="text-xs tracking-widest uppercase font-medium">Discover creators</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5 animate-bounce"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
  )
}
