import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, niches, platform_url, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role === 'admin') redirect('/admin')

  // If profile already complete, skip to deals
  if (profile.platform_url && profile.niches && profile.niches.length > 0) {
    redirect('/deals')
  }

  return (
    <OnboardingWizard
      userId={user.id}
      name={profile.full_name ?? user.email?.split('@')[0] ?? ''}
    />
  )
}
