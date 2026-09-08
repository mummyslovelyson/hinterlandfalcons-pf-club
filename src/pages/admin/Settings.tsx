import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getRegistrations, syncRegistrationsFromBackend } from '@/lib/registrations';
import { api } from '@/lib/api';
import { Loader2, RefreshCw, KeyRound, Download, Save, RotateCcw } from 'lucide-react';

interface ClubSettings {
  clubName: string;
  motto: string;
  conference: string;
  directorName: string;
  email: string;
  phone: string;
  meetingDay: string;
  meetingVenue: string;
  minimumAge: number;
  registrationOpen: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  twoFactorAuth: boolean;
  templateReceived: string;
  templateApproved: string;
  templateRejected: string;
}

const DEFAULT_SETTINGS: ClubSettings = {
  clubName: 'Hinterland Falcons Pathfinder Club',
  motto: 'We Are Smart and Vigilant in Service',
  conference: 'Central Ghana Conference • Santasi AYM District',
  directorName: 'Director Kwabena Mensah',
  email: 'santasi.pathfinders@gmail.com',
  phone: '+233 24 555 7890',
  meetingDay: 'Every Sunday, 8:30 AM – 11:30 AM',
  meetingVenue: 'Santasi SDA Church School Complex, Kumasi',
  minimumAge: 10,
  registrationOpen: true,
  emailAlerts: true,
  smsAlerts: false,
  twoFactorAuth: false,
  templateReceived: 'Dear {name}, thank you for registering with Hinterland Falcons Pathfinder Club. Your application is currently under leadership review.',
  templateApproved: 'Congratulations {name}! Your application to the Hinterland Falcons Pathfinder Club has been approved. Welcome to the 2026 club season.',
  templateRejected: 'Dear {name}, thank you for your interest. Unfortunately, your application requires additional review or verification. Please contact club leadership.',
};

const Settings = () => {
  const [settings, setSettings] = useState<ClubSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api<ClubSettings>('/settings')
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => {
        console.warn('[Settings] Failed to fetch settings from backend:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const [activeTemplateModal, setActiveTemplateModal] = useState<null | 'received' | 'approved' | 'rejected'>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateSetting = <K extends keyof ClubSettings>(key: K, value: ClubSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api<ClubSettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res && typeof res === 'object') {
        setSettings((prev) => ({ ...prev, ...res }));
      }
      toast.success('Club settings saved successfully', {
        description: 'All system parameters and preferences have been updated in the database.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings. Please verify you are logged in as admin.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all club settings to default values?')) {
      setIsSaving(true);
      try {
        const res = await api<ClubSettings>('/settings', {
          method: 'PUT',
          body: JSON.stringify(DEFAULT_SETTINGS),
        });
        setSettings(res && typeof res === 'object' ? { ...DEFAULT_SETTINGS, ...res } : DEFAULT_SETTINGS);
        toast.info('Settings restored to default');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reset settings';
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      let data = getRegistrations();
      if (!data || data.length === 0) {
        data = await syncRegistrationsFromBackend();
      }
      if (!data || data.length === 0) {
        toast.info('No registration records found to export');
        return;
      }

      const headers = [
        'Registration ID',
        'Full Name',
        'Age',
        'Date of Birth',
        'Phone',
        'Residential Address',
        'Church',
        'School',
        'Grade',
        'Category',
        'Status',
        'Submission Date',
        'Guardian Name',
        'Guardian Phone',
      ];

      const rows = data.map((r) => [
        `"${r.id}"`,
        `"${r.applicant?.fullName || ''}"`,
        r.applicant?.age || '',
        `"${r.applicant?.dateOfBirth || ''}"`,
        `"${r.applicant?.phone || ''}"`,
        `"${r.applicant?.address || ''}"`,
        `"${r.applicant?.church || ''}"`,
        `"${r.applicant?.school || ''}"`,
        `"${r.applicant?.grade || ''}"`,
        `"${r.membership?.membershipCategory || ''}"`,
        `"${r.status || 'pending'}"`,
        `"${r.submittedAt || ''}"`,
        `"${r.guardian?.fullName || ''}"`,
        `"${r.guardian?.phone || ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `hinterland_falcons_roster_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Roster exported successfully', {
        description: `Exported ${data.length} applicant records as CSV.`,
      });
    } catch {
      toast.error('Failed to generate CSV export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const [regs, fetchedSettings] = await Promise.all([
        syncRegistrationsFromBackend(),
        api<ClubSettings>('/settings').catch(() => null),
      ]);
      if (fetchedSettings && typeof fetchedSettings === 'object') {
        setSettings((prev) => ({ ...prev, ...fetchedSettings }));
      }
      toast.success('Live database records refreshed', {
        description: `Synchronized ${regs.length} applicant records and club settings from MySQL.`,
      });
    } catch {
      toast.error('Failed to synchronize database records');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api('/auth/admin/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Security password updated successfully', {
        description: 'Your new administrator credentials are now active.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password. Please check your current password.';
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Settings & Configuration"
        subtitle="System settings, official club details, communications, and database controls."
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-muted/30">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Top Banner with Quick Summary & Action Bar */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-border bg-slate-100 p-0.5">
                  <img src="/falcons-logo.png" alt="Logo" className="h-full w-full object-cover rounded-full" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {settings.clubName}
                  </h2>
                  <p className="text-xs text-muted-foreground">{settings.conference}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleResetDefaults} disabled={isSaving || isLoading}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset Defaults
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Expanded 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column: Organization Details & Operations */}
            <div className="space-y-6 md:space-y-8">
              {/* Section 01: Official Club Profile */}
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      01
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">Club Identity</h3>
                      <p className="text-xs text-muted-foreground">Official club designation and contact details</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="clubName">Club Name</Label>
                    <Input
                      id="clubName"
                      value={settings.clubName}
                      onChange={(e) => updateSetting('clubName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="motto">Club Motto</Label>
                    <Input
                      id="motto"
                      value={settings.motto}
                      onChange={(e) => updateSetting('motto', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="conference">Conference / District</Label>
                    <Input
                      id="conference"
                      value={settings.conference}
                      onChange={(e) => updateSetting('conference', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="directorName">Club Director</Label>
                      <Input
                        id="directorName"
                        value={settings.directorName}
                        onChange={(e) => updateSetting('directorName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Official Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => updateSetting('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Official Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting('email', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Section 02: Meeting & Logistics */}
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      02
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">Gatherings & Eligibility</h3>
                      <p className="text-xs text-muted-foreground">Session timings, physical venue, and age limits</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="meetingDay">Regular Gathering Times</Label>
                    <Input
                      id="meetingDay"
                      value={settings.meetingDay}
                      onChange={(e) => updateSetting('meetingDay', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="meetingVenue">Meeting Venue Address</Label>
                    <Input
                      id="meetingVenue"
                      value={settings.meetingVenue}
                      onChange={(e) => updateSetting('meetingVenue', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="minimumAge">Minimum Age for Pathfinder Enrollment</Label>
                    <Input
                      id="minimumAge"
                      type="number"
                      min={10}
                      max={16}
                      value={settings.minimumAge}
                      onChange={(e) => updateSetting('minimumAge', parseInt(e.target.value) || 10)}
                    />
                    <p className="text-xs text-muted-foreground">Standard SDA Pathfinder policy requires applicants to be at least 10 years old.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Portal Controls, Notifications, & Data */}
            <div className="space-y-6 md:space-y-8">
              {/* Section 03: Enrollment & Registration System Controls */}
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      03
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">Registration Portal Controls</h3>
                      <p className="text-xs text-muted-foreground">Accepting online submissions and intake status</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/60">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Public Registration Intake</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Allow new candidates and returning youth to apply online
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${settings.registrationOpen ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-100 text-red-800'}`}>
                        {settings.registrationOpen ? 'Intake Active' : 'Intake Paused'}
                      </span>
                      <Switch
                        checked={settings.registrationOpen}
                        onCheckedChange={(checked) => updateSetting('registrationOpen', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/60">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Email Alerts for Incoming Registrations</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Notify director inbox immediately upon application receipt
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailAlerts}
                      onCheckedChange={(checked) => updateSetting('emailAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/60">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Urgent SMS Alerts</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Send SMS dispatch for emergency notices and critical registrations
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsAlerts}
                      onCheckedChange={(checked) => updateSetting('smsAlerts', checked)}
                    />
                  </div>
                </div>
              </section>

              {/* Section 04: Communication Templates */}
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      04
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">Notice Templates</h3>
                      <p className="text-xs text-muted-foreground">Automated dispatches sent to applicants and parents</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground text-sm">Application Received Dispatch</p>
                      <p className="text-xs text-muted-foreground">Sent immediately upon successful submission</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTemplateModal('received')}>
                      View / Edit
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground text-sm">Application Approved Welcome</p>
                      <p className="text-xs text-muted-foreground">Sent when director approves candidate roster</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTemplateModal('approved')}>
                      View / Edit
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground text-sm">Verification Needed Notice</p>
                      <p className="text-xs text-muted-foreground">Sent if additional documents or uniform details needed</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTemplateModal('rejected')}>
                      View / Edit
                    </Button>
                  </div>
                </div>
              </section>

              {/* Section 05: Data Operations & Security */}
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      05
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">Security & Data Management</h3>
                      <p className="text-xs text-muted-foreground">Database backup, export, and credentials</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground text-sm">Administrator Password</p>
                      <p className="text-xs text-muted-foreground">Update the portal master security key in database</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)}>
                      <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground text-sm">Export Master Roster (CSV)</p>
                      <p className="text-xs text-muted-foreground">Download spreadsheet of all applicant records</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting}>
                      {isExporting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Download CSV
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">Sync Database Records</p>
                      <p className="text-xs text-muted-foreground">Refresh live registrations and rosters from MySQL</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncDatabase}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              "We Are Smart and Vigilant in Service" • Santasi AYM Executive Admin
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleResetDefaults} disabled={isSaving || isLoading}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Cancel Changes
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save All Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Template Edit Dialog */}
      {activeTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground capitalize">
                Edit {activeTemplateModal} Template
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Variables like {'{name}'} will be replaced with the applicant's name automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Template Content</Label>
              <Textarea
                rows={5}
                value={
                  activeTemplateModal === 'received'
                    ? settings.templateReceived
                    : activeTemplateModal === 'approved'
                    ? settings.templateApproved
                    : settings.templateRejected
                }
                onChange={(e) => {
                  if (activeTemplateModal === 'received') updateSetting('templateReceived', e.target.value);
                  if (activeTemplateModal === 'approved') updateSetting('templateApproved', e.target.value);
                  if (activeTemplateModal === 'rejected') updateSetting('templateRejected', e.target.value);
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTemplateModal(null)}>
                Done
              </Button>
              <Button
                size="sm"
                className="bg-primary text-white"
                onClick={() => {
                  handleSave();
                  setActiveTemplateModal(null);
                }}
              >
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Dialog */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Change Admin Security Password
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set a strong password for your director portal access.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="currentPass">Current Password</Label>
                <Input
                  id="currentPass"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPass">New Password</Label>
                <Input
                  id="newPass"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPass">Confirm New Password</Label>
                <Input
                  id="confirmPass"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={isUpdatingPassword}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-white font-semibold"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
