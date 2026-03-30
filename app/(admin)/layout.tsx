import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')
  if (profile.role === 'creator') redirect('/deals')
  if (profile.role !== 'admin') redirect('/')

  return (
    <AdminShell name={profile.full_name ?? user.email ?? 'Admin'} userId={user.id}>
      {children}
    </AdminShell>
  )
}
