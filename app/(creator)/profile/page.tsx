import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, platform, platform_url, youtube_url, instagram_url, followers_count, niches, phone, whatsapp, age, gender, city')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <div className="mb-6 pt-2">
        <h1 className="text-xl font-bold text-gray-100">My Profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">{user!.email}</p>
      </div>
      <ProfileForm
        profile={profile ?? { full_name: null, platform: null, platform_url: null, youtube_url: null, instagram_url: null, followers_count: null, niches: null, phone: null, whatsapp: null, age: null, gender: null, city: null }}
        userId={user!.id}
      />
    </div>
  )
}
