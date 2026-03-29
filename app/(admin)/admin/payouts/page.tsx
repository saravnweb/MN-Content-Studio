import { createClient } from '@/lib/supabase/server'
import PayoutActionCard from './PayoutActionCard'

export default async function PayoutsPage() {
  const supabase = createClient()

  const { data: payouts } = await supabase
    .from('applications')
    .select('id, payout_status, payout_amount, payout_date, payout_ref, created_at, creator:profiles(id, full_name, platform, upi_id, bank_name, account_number), campaign:campaigns(id, title, brand_name, budget_min, budget_max)')
    .eq('status', 'accepted')
    .eq('submission_status', 'approved')
    .order('payout_date', { ascending: false, nullsFirst: true })

  const all = payouts ?? []
  const paid       = all.filter((p) => p.payout_status === 'paid')
  const awaiting   = all.filter((p) => p.payout_status === 'processing' || p.payout_status === 'unpaid')

  const totalPaid    = paid.reduce((sum, p: any) => sum + ((p.payout_amount ?? (p.campaign as any)?.budget_min ?? 0) as number), 0)
  const totalPending = awaiting.reduce((sum, p: any) => sum + ((p.payout_amount ?? (p.campaign as any)?.budget_min ?? 0) as number), 0)

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="max-w-2xl pb-28">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100">Payouts</h2>
        <p className="text-gray-500 text-sm mt-1">Track creator earnings for approved content</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Paid Out" value={fmt(totalPaid)} color="text-emerald-400" />
        <StatCard label="Pending / Processing" value={fmt(totalPending)} color="text-yellow-400" />
        <StatCard label="Creators to Pay" value={String(awaiting.length)} color="text-indigo-400" />
      </div>

      {/* Awaiting payment — action cards */}
      {awaiting.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
            Awaiting Payment <span className="text-red-400 ml-1">({awaiting.length})</span>
          </h3>
          <div className="space-y-3">
            {awaiting.map((p: any) => {
              const amount = p.payout_amount ?? p.campaign?.budget_min ?? 0
              return (
                <PayoutActionCard
                  key={p.id}
                  applicationId={p.id}
                  creatorName={p.creator?.full_name ?? '—'}
                  upiId={p.creator?.upi_id}
                  bankName={p.creator?.bank_name}
                  accountNumber={p.creator?.account_number}
                  amount={amount}
                  campaignTitle={p.campaign?.title ?? '—'}
                  requestedAt={p.payout_date ?? p.created_at}
                />
              )
            })}
          </div>
        </div>
      )}

      {!all.length && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">No approved content yet — payouts appear once submissions are approved.</p>
        </div>
      )}

      {/* Paid history */}
      {paid.length > 0 && (
        <div>
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
            Paid <span className="text-emerald-400 ml-1">({paid.length})</span>
          </h3>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium">Creator</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium hidden md:table-cell">Campaign</th>
                  <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium">Amount</th>
                  <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium">Ref / Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paid.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-gray-100 font-medium text-sm">{(p.creator as any)?.full_name ?? '—'}</p>
                      <p className="text-gray-500 text-xs capitalize">{(p.creator as any)?.platform ?? ''}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-gray-300 text-sm">{(p.campaign as any)?.title ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-emerald-400 font-semibold">{fmt(p.payout_amount ?? (p.campaign as any)?.budget_min ?? 0)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.payout_ref && <p className="text-gray-400 text-xs font-mono">{p.payout_ref}</p>}
                      {p.payout_date && (
                        <p className="text-gray-600 text-xs">
                          {new Date(p.payout_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating total bar — only when there are pending payouts */}
      {awaiting.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-950 border border-gray-700 rounded-2xl px-6 py-3.5 flex items-center gap-8 shadow-2xl z-10">
          <div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">Total Payout Pending</p>
            <p className="text-white text-xl font-bold">{fmt(totalPending)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">Requests</p>
            <p className="text-white text-xl font-bold flex items-center gap-1.5">
              {awaiting.length}
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
