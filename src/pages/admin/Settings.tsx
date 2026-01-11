import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon,
  Bell,
  Mail,
  Shield,
  Database
} from 'lucide-react';

const Settings = () => {
  return (
    <>
      <AdminHeader 
        title="Settings" 
        subtitle="Manage your club settings and preferences"
      />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* General Settings */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <SettingsIcon className="h-5 w-5 text-primary" />
              General Settings
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clubName">Club Name</Label>
                <Input id="clubName" defaultValue="Pathfinder Club" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" type="email" defaultValue="info@pathfinderclub.org" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email alerts for new applications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive SMS alerts for urgent matters</p>
                </div>
                <Switch />
              </div>
            </div>
          </section>

          {/* Email Templates */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <Mail className="h-5 w-5 text-primary" />
              Email Templates
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <p className="font-medium text-foreground">Application Received</p>
                  <p className="text-sm text-muted-foreground">Sent when a new application is submitted</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <p className="font-medium text-foreground">Application Approved</p>
                  <p className="text-sm text-muted-foreground">Sent when an application is approved</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <p className="font-medium text-foreground">Application Rejected</p>
                  <p className="text-sm text-muted-foreground">Sent when an application is rejected</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your admin password</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <Database className="h-5 w-5 text-primary" />
              Data Management
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Export All Data</p>
                  <p className="text-sm text-muted-foreground">Download all applications as CSV</p>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Clear Test Data</p>
                  <p className="text-sm text-muted-foreground text-destructive">Remove all test applications</p>
                </div>
                <Button variant="destructive" size="sm">Clear</Button>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button size="lg">Save Changes</Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
