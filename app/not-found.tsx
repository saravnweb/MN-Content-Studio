import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-indigo-500 mb-4 opacity-50" aria-hidden="true">404</p>
        <h1 className="text-gray-100 font-bold text-xl mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-6">This page doesn&apos;t exist or has moved.</p>
        <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
          Go home
        </Link>
      </div>
    </main>
  )
}
