interface Props {
  creatorCount: number | null
  campaignCount: number | null
}

export default function StatsBar({ creatorCount, campaignCount }: Props) {
  const stats = [
    {
      value: creatorCount ? `${creatorCount}+` : '50+',
      label: 'Creators Joined',
    },
    {
      value: campaignCount ? `${campaignCount}` : '—',
      label: 'Live Campaigns',
    },
    {
      value: '16',
      label: 'Niches Covered',
    },
  ]

  return (
    <div className="border-y border-gray-800 bg-gray-900/50 py-8 px-4">
      <div className="max-w-xl mx-auto grid grid-cols-3 divide-x divide-gray-800 text-center">
        {stats.map(({ value, label }) => (
          <div key={label} className="px-4">
            <p className="text-2xl font-bold text-gray-100">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
