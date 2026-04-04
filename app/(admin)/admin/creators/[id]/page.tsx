import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CreatorProfileUI from './CreatorProfileUI'
import { AlertCircle, ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CreatorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  // 1. Fetch Creator Profile
  const { data: creator, error: creatorError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  // Handle case where creator doesn't exist or DB error
  if (creatorError || !creator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="heading-page mb-2">Creator Not Found</h2>
        <p className="text-description max-w-md mb-8">
          The creator profile with ID <code className="bg-gray-800 px-1.5 py-0.5 rounded text-indigo-400">{params.id}</code> could not be found or has been removed.
        </p>
        <Link 
          href="/admin/creators" 
          className="bg-gray-800 hover:bg-gray-700 text-gray-100 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Creators
        </Link>
      </div>
    )
  }

  // 2. Fetch Applications (Participations)
  const { data: applications } = await supabase
    .from('applications')
    .select('*, campaign:campaigns(*)')
    .eq('creator_id', params.id)
    .order('created_at', { ascending: false })

  // 3. Fetch Payout Summary (Server-side calculation)
  const paidApps = (applications || []).filter(app => app.payout_status === 'paid')
  const pendingApps = (applications || []).filter(app => app.status === 'accepted' && app.payout_status !== 'paid')
  
  const payoutSummary = {
    totalEarned: paidApps.reduce((sum, app) => sum + (Number(app.payout_amount) || 0), 0),
    paidCount: paidApps.length,
    pendingCount: pendingApps.length
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <Link 
          href="/admin/creators" 
          className="text-gray-500 hover:text-gray-100 transition-colors flex items-center gap-2 text-sm font-bold group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Creators
        </Link>
      </div>

      <CreatorProfileUI 
        creator={creator} 
        applications={applications || []} 
        payoutSummary={payoutSummary}
      />
    </div>
  )
}
