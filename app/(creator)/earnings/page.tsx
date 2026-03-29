import { createClient } from '@/lib/supabase/server'
import PayoutDetailsForm from './PayoutDetailsForm'

export default async function EarningsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: applications }, { data: profile }] = await Promise.all([
    supabase
      .from('applications')
      .select('id, payout_status, payout_amount, payout_date, payout_ref, campaign:campaigns(title, brand_name, budget_min)')
      .eq('creator_id', user!.id)
      .in('payout_status', ['paid', 'processing'])
      .order('payout_date', { ascending: false }),
    supabase
      .from('profiles')
      .select('account_holder_name, bank_name, account_number, ifsc_code, upi_id')
      .eq('id', user!.id)
      .single(),
  ])

  const paid = applications?.filter((a: any) => a.payout_status === 'paid') ?? []
  const processing = applications?.filter((a: any) => a.payout_status === 'processing') ?? []

  const totalEarned = paid.reduce((s: number, a: any) => s + (a.payout_amount ?? a.campaign?.budget_min ?? 0), 0)
  const totalProcessing = processing.reduce((s: number, a: any) => s + (a.payout_amount ?? a.campaign?.budget_min ?? 0), 0)

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div>
      <div className="mb-6 pt-2">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Earnings & Payouts</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border rounded-xl p-3 text-center"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>{fmt(totalEarned)}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Total Earned</p>
        </div>
        <div className="border rounded-xl p-3 text-center"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xl font-bold" style={{ color: '#2563EB' }}>{fmt(totalProcessing)}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Processing</p>
        </div>
        <div className="border rounded-xl p-3 text-center"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{paid.length}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Payouts</p>
        </div>
      </div>

      {/* Processing payments */}
      {processing.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Processing</h2>
          <div className="space-y-2">
            {processing.map((a: any) => (
              <div key={a.id} className="border rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{a.campaign?.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{a.campaign?.brand_name}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold" style={{ color: '#2563EB' }}>{fmt(a.payout_amount ?? a.campaign?.budget_min ?? 0)}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
                    Processing
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transaction history */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Transaction History</h2>
        {paid.length === 0 ? (
          <div className="border rounded-xl p-8 text-center"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-2xl mb-2">💸</p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>No payouts yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Completed payouts will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paid.map((a: any) => (
              <div key={a.id} className="border rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{a.campaign?.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {a.campaign?.brand_name}
                    {a.payout_date && (
                      <> · {new Date(a.payout_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                    )}
                  </p>
                  {a.payout_ref && (
                    <p className="text-xs mt-1 font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      UTR: {a.payout_ref}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{fmt(a.payout_amount ?? a.campaign?.budget_min ?? 0)}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                    Paid ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bank / UPI details */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Bank & UPI Details</h2>
        <PayoutDetailsForm
          userId={user!.id}
          initial={{
            account_holder_name: profile?.account_holder_name ?? '',
            bank_name: profile?.bank_name ?? '',
            account_number: profile?.account_number ?? '',
            ifsc_code: profile?.ifsc_code ?? '',
            upi_id: profile?.upi_id ?? '',
          }}
        />
      </section>
    </div>
  )
}
