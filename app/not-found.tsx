import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-gray-800 mb-4">404</p>
        <h2 className="text-gray-100 font-bold text-xl mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-6">This page doesn&apos;t exist or has moved.</p>
        <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
          Go home
        </Link>
      </div>
    </div>
  )
}
