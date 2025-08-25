import { ChangeLoginPin } from '@/components/settings/change-login-pin'

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <div className="grid gap-6">
        <div className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Security Settings</h3>
              <div className="rounded-lg border p-6">
                <ChangeLoginPin />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}