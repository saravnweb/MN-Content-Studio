import CampaignForm from '../CampaignForm'
import Link from 'next/link'

export default function NewCampaignPage() {
  return (
    <div>
      <Link href="/admin/campaigns" className="text-gray-400 text-sm hover:text-gray-300 mb-6 inline-block transition-colors">
        ← Campaigns
      </Link>
      <CampaignForm />
    </div>
  )
}
