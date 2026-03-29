'use client'

type ChartPoint = { date: string; count: number }
type PayoutCounts = { unpaid: number; processing: number; paid: number }

export default function AdminCharts({
  chartData,
  payoutCounts,
}: {
  chartData: ChartPoint[]
  payoutCounts: PayoutCounts
}) {
  const max = Math.max(...chartData.map((d) => d.count), 1)
  const total = chartData.reduce((s, d) => s + d.count, 0)

  return (
    <div>
      {/* Bar chart */}
      <div className="flex items-end gap-1 h-24">
        {chartData.map((d) => {
          const heightPct = max > 0 ? (d.count / max) * 100 : 0
          const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                {d.count} app{d.count !== 1 ? 's' : ''}
              </div>
              <div className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(heightPct, d.count > 0 ? 4 : 0)}%`,
                  backgroundColor: d.count > 0 ? '#6366F1' : '#1F2937',
                  minHeight: d.count > 0 ? '4px' : '0',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels — show every 3rd */}
      <div className="flex gap-1 mt-1">
        {chartData.map((d, i) => (
          <div key={d.date} className="flex-1 text-center">
            {i % 3 === 0 && (
              <span className="text-[9px] text-gray-400">
                {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-gray-400 text-xs mt-2">{total} total applications in 14 days</p>
    </div>
  )
}
