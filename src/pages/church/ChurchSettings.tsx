import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import { Church as ChurchIcon, Settings, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { updateChurch } from '@/lib/churches';

const ChurchSettings = () => {
    const { church, logout, refreshChurch } = useChurchAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: church?.name || '',
        pastorName: church?.pastorName || '',
        contactPhone: church?.contactPhone || '',
        contactEmail: church?.contactEmail || '',
        location: church?.location || '',
        district: church?.district || '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!church) return;
        setIsSaving(true);
        try {
            await updateChurch({ ...church, ...form });
            await refreshChurch();
            toast.success('Church profile updated successfully');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update church profile';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!church) return;

        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await updateChurch({ ...church, password: passwordForm.newPassword });
            toast.success('Password changed. Please log in again.');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            logout();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update password';
            toast.error(message);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
            <div className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Church Unit Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your congregation unit profile, ministerial contacts, and account security</p>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
                <div className="w-full space-y-6 pb-16">
                    {/* Church Profile */}
                    <form onSubmit={handleSaveProfile} className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading font-semibold text-foreground text-base flex items-center gap-2">
                                <ChurchIcon className="h-4 w-4 text-primary" />
                                Congregation Profile & Directory Contacts
                            </h3>
                            <span className="text-xs text-muted-foreground hidden sm:inline">Santasi AYM District Directory</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <Label>Church Unit Name</Label>
                                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Assigned Minister / Pastor</Label>
                                <Input value={form.pastorName} onChange={e => setForm(p => ({ ...p, pastorName: e.target.value }))} className="h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label>District Conference</Label>
                                <Input value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} className="h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Official Phone Contact</Label>
                                <Input value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} className="h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Official Email Address</Label>
                                <Input value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} className="h-10" />
                            </div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <Label>Church Sanctuary Location</Label>
                                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="h-10" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="gap-2 px-6 shadow-xs" disabled={isSaving}>
                                <Save className="h-4 w-4" /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                            </Button>
                        </div>
                    </form>

                    {/* Security & Account Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Change Password */}
                        <form onSubmit={handleChangePassword} className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                            <div>
                                <h3 className="font-heading font-semibold text-foreground text-base mb-1 flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary" />
                                    Access Security & Password
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Update the clerk security credentials for this church unit
                                </p>
                                <div className="space-y-4 mb-6">
                                    <div className="space-y-2">
                                        <Label>Current Security Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                                            placeholder="Enter current password"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Security Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                            placeholder="Enter new password (min 6 characters)"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                            placeholder="Confirm new password"
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" variant="outline" className="gap-2">
                                    <Lock className="h-4 w-4" /> Update Security Password
                                </Button>
                            </div>
                        </form>

                        {/* Account Info */}
                        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                            <div>
                                <h3 className="font-heading font-semibold text-foreground text-base mb-1">
                                    Congregation Credentials & Status
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Official identification records for AYM district affiliation
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60">
                                        <p className="text-xs text-muted-foreground">Portal Username</p>
                                        <p className="font-mono font-bold text-foreground mt-0.5">{church?.username || 'santasi_clerk'}</p>
                                    </div>
                                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60">
                                        <p className="text-xs text-muted-foreground">Unique Church ID</p>
                                        <p className="font-mono font-bold text-foreground text-xs mt-0.5">{church?.id || 'CH-SANTASI'}</p>
                                    </div>
                                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60">
                                        <p className="text-xs text-muted-foreground">Affiliation Status</p>
                                        <p className="font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Active Unit
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60">
                                        <p className="text-xs text-muted-foreground">Registration Established</p>
                                        <p className="font-medium text-foreground mt-0.5">
                                            {church?.createdAt ? new Date(church.createdAt).toLocaleDateString() : 'Active'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                                <span className="font-semibold">Notice:</span> Modifications made to this unit profile are automatically synchronized across the Santasi AYM District Conference records.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChurchSettings;
