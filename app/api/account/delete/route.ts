import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = createServerClient()
  
  // 1. Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Use admin client to delete the user from auth.users
  // This will trigger cascade deletes for profiles, applications, etc.
  const adminClient = createAdminClient()
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('Error deleting account:', deleteError)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  // 3. Sign out the user (this might be redundant since the user is deleted, but good practice)
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
