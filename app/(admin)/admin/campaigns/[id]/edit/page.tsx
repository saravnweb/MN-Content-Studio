import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CampaignForm from '../../CampaignForm'
import Link from 'next/link'

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, description, budget_min, budget_max, deliverables, niches, platforms, deadline, slots_total, status, image_url, video_url, brand_name, brand_logo_url, visibility, visible_to, target_niches')
    .eq('id', params.id)
    .single()

  if (!campaign) notFound()

  return (
    <div>
      <Link href={`/admin/campaigns/${params.id}`}
        className="text-gray-400 text-sm hover:text-gray-300 mb-6 inline-block transition-colors">
        ← Campaign Details
      </Link>
      <CampaignForm
        initial={{
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          budget_min: campaign.budget_min,
          budget_max: campaign.budget_max,
          deliverables: campaign.deliverables,
          niches: campaign.niches ?? [],
          platforms: campaign.platforms,
          deadline: campaign.deadline,
          slots_total: campaign.slots_total,
          status: campaign.status,
          image_url: campaign.image_url,
          video_url: campaign.video_url,
          brand_name: campaign.brand_name,
          brand_logo_url: campaign.brand_logo_url,
          visibility: campaign.visibility ?? 'public',
          visible_to: campaign.visible_to ?? [],
          target_niches: campaign.target_niches ?? [],
        }}
      />
    </div>
  )
}
