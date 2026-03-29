import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreatorShell from './CreatorShell'

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, niches, platform_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role === 'admin') redirect('/admin')
  if (profile.role !== 'creator') redirect('/login')

  return (
    <CreatorShell userId={user.id} name={profile.full_name}>
      {children}
    </CreatorShell>
  )
}
