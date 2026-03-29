import { createClient } from '@/lib/supabase/server'
import PushSetup from '../dashboard/PushSetup'
import NotificationPreferences from './NotificationPreferences'
import AccountSecurity from './AccountSecurity'
import AppPreferences from './AppPreferences'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', user!.id)
    .single()

  const notifPrefs = (profile?.notification_preferences as Record<string, boolean> | null) ?? {
    new_deals: true,
    status_updates: true,
    payout_updates: true,
  }

  return (
    <div>
      <div className="mb-6 pt-2">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Push Notifications */}
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Push Notifications</h2>
          <PushSetup />
        </section>

        {/* Notification Preferences */}
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Notification Preferences</h2>
          <NotificationPreferences userId={user!.id} initial={notifPrefs} />
        </section>

        {/* Account & Security */}
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Account & Security</h2>
          <AccountSecurity email={user!.email ?? ''} />
        </section>

        {/* App Preferences */}
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>App Preferences</h2>
          <AppPreferences />
        </section>
      </div>
    </div>
  )
}
