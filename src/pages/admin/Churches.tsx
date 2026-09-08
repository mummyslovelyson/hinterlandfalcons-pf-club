import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Church } from '@/types/church';
import { getRegistrations } from '@/lib/registrations';
import {
  getChurches,
  saveChurch,
  updateChurch,
  deleteChurch,
  syncChurchesFromBackend,
  getChurchMembers as getStoredChurchMembers,
} from '@/lib/churches';
import { toast } from 'sonner';

const Churches = () => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [churchToEdit, setChurchToEdit] = useState<Church | null>(null);
  const [churchToDelete, setChurchToDelete] = useState<Church | null>(null);
  const [churchToViewMembers, setChurchToViewMembers] = useState<Church | null>(null);

  const [formData, setFormData] = useState<Partial<Church>>({
    name: '',
    pastorName: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    district: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = () => {
    setChurches(getChurches());
    syncChurchesFromBackend().then((backendList) => {
      if (backendList && backendList.length > 0) {
        setChurches(backendList);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      pastorName: '',
      contactPhone: '',
      contactEmail: '',
      location: '',
      district: '',
      username: '',
      password: '',
    });
  };

  const handleAddChurch = async () => {
    if (!formData.name?.trim()) {
      toast.error('Please enter church name');
      return;
    }

    const newChurch: Church = {
      id: `CH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: formData.name.trim(),
      pastorName: formData.pastorName?.trim() || 'Church Pastor',
      contactPhone: formData.contactPhone?.trim() || '',
      contactEmail: formData.contactEmail?.trim() || '',
      location: formData.location?.trim() || 'Santasi Area',
      district: formData.district?.trim() || 'Santasi District',
      username: formData.username?.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_clerk',
      password: formData.password?.trim() || 'Pathfinder@2026',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveChurch(newChurch);
      toast.success('Church added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      loadChurches();
    } catch (err) {
      console.error('Failed to add church:', err);
      const message = err instanceof Error ? err.message : 'Failed to add church. Please try again.';
      toast.error(message);
    }
  };

  const openEditDialog = (church: Church) => {
    setChurchToEdit(church);
    setFormData({
      name: church.name,
      pastorName: church.pastorName,
      contactPhone: church.contactPhone,
      contactEmail: church.contactEmail,
      location: church.location,
      district: church.district,
      username: church.username,
      password: church.password,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateChurch = async () => {
    if (!churchToEdit) return;

    try {
      const updated: Church = { ...churchToEdit, ...formData } as Church;
      await updateChurch(updated);
      toast.success('Church details updated successfully');
      setIsEditDialogOpen(false);
      setChurchToEdit(null);
      resetForm();
      loadChurches();
    } catch (err) {
      console.error('Failed to update church:', err);
      const message = err instanceof Error ? err.message : 'Failed to update church. Please try again.';
      toast.error(message);
    }
  };

  const handleDeleteChurch = async () => {
    if (!churchToDelete) return;

    try {
      await deleteChurch(churchToDelete.id);
      toast.success('Church removed successfully');
      setChurchToDelete(null);
      loadChurches();
    } catch (err) {
      console.error('Failed to delete church:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete church. Please try again.';
      toast.error(message);
    }
  };

  const copyCredentials = (church: Church) => {
    const text = `Church: ${church.name}\nPortal: /church/login\nUsername: ${church.username}\nPassword: ${church.password}`;
    navigator.clipboard.writeText(text);
    toast.success('Login credentials copied to clipboard!');
  };

  const exportChurchesCSV = () => {
    const headers = ['Church ID', 'Church Name', 'Pastor Name', 'Phone', 'Email', 'Location', 'District', 'Username', 'Added Date'];
    const rows = churches.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.pastorName}"`,
      `"${c.contactPhone}"`,
      c.contactEmail,
      `"${c.location}"`,
      `"${c.district}"`,
      c.username,
      new Date(c.createdAt).toLocaleDateString(),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Santasi_AYM_Churches_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Churches directory exported to CSV');
  };

  const filteredChurches = churches.filter(
    (church) =>
      church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.pastorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to count members from both database sources
  const getChurchMemberCount = (church: Church) => {
    const allMembers = getStoredChurchMembers();
    const registeredMembers = getRegistrations().filter(
      (r) => r.status === 'approved' && r.applicant.church.toLowerCase().includes(church.name.toLowerCase())
    );
    const churchAppMembers = allMembers.filter((m) => m.churchId === church.id);
    return Math.max(churchAppMembers.length, registeredMembers.length);
  };

  // Helper to get members of specific church for modal view
  const getChurchMembers = (church: Church) => {
    const registered = getRegistrations()
      .filter((r) => r.status === 'approved' && r.applicant.church.toLowerCase().includes(church.name.toLowerCase()))
      .map((r) => ({
        id: r.id,
        name: r.applicant.fullName,
        age: r.applicant.age,
        category: r.membership.membershipCategory,
        phone: r.applicant.phone,
        guardian: r.guardian.fullName,
      }));
    return registered;
  };

  return (
    <>
      <AdminHeader
        title="Churches & District Roster"
        subtitle={`${churches.length} constituent churches enrolled under Santasi AYM District.`}
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search churches by name, location, or pastor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-slate-300 h-10"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportChurchesCSV}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                ↓ Export CSV
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4"
              >
                + Add New Church
              </Button>
            </div>
          </div>

          {/* Churches Grid */}
          {filteredChurches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChurches.map((church, idx) => {
                const memberCount = getChurchMemberCount(church);

                return (
                  <div
                    key={church.id}
                    className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
                  >
                    <div className="p-6">
                      {/* Top Bar: Number Tag & Name */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold font-mono text-sm flex-shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-base text-slate-900 leading-snug">
                              {church.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {church.location} • {church.district}
                            </p>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-[11px] font-semibold text-slate-700 border-slate-200">
                          {memberCount} Members
                        </Badge>
                      </div>

                      {/* Church Details */}
                      <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 mb-4">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Pastor:</span>
                          <span className="font-semibold text-slate-900">{church.pastorName || 'Not Assigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Phone:</span>
                          <span className="font-semibold text-slate-800">{church.contactPhone || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Email:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[180px]">{church.contactEmail || '—'}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200/60">
                          <span className="font-medium text-slate-400">Portal User:</span>
                          <span className="font-mono font-bold text-primary">{church.username || '—'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChurchToViewMembers(church)}
                          className="w-full text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100"
                        >
                          View Roster ({memberCount})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCredentials(church)}
                          className="w-full text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100"
                        >
                          Copy Login Info
                        </Button>
                      </div>
                    </div>

                    {/* Card Footer: Edit / Delete */}
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
                      <span className="text-[11px] text-slate-400">
                        Added {new Date(church.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(church)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setChurchToDelete(church)}
                          className="text-xs font-semibold text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-slate-200 bg-white">
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                No Churches Found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                No churches matched your search terms. Add a new church or clear the search field.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs">
                + Add First Church
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Add Church Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-slate-900">Add New Church</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter the constituent church details and establish portal login credentials for church clerks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Church Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Santasi Central SDA"
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pastorName">Pastor Name</Label>
                <Input
                  id="pastorName"
                  name="pastorName"
                  value={formData.pastorName}
                  onChange={handleInputChange}
                  placeholder="e.g. Pastor Kwabena Boateng"
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="e.g. 024 123 4567"
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail">Official Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="e.g. clerk@santasisda.org"
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Physical Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Santasi Roundabout"
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="e.g. Santasi District"
                  className="bg-white border-slate-300"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Church Portal Credentials
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Portal Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="e.g. santasi_clerk"
                    className="bg-white border-slate-300 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Initial Password</Label>
                  <Input
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="e.g. Password@2026"
                    className="bg-white border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-300 text-xs">
              Cancel
            </Button>
            <Button onClick={handleAddChurch} className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs">
              Save Church
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Church Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-slate-900">Edit Church Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update directory information and credentials for this church.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Church Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-pastorName">Pastor Name</Label>
                <Input
                  id="edit-pastorName"
                  name="pastorName"
                  value={formData.pastorName}
                  onChange={handleInputChange}
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-contactPhone">Phone</Label>
                <Input
                  id="edit-contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-contactEmail">Email</Label>
                <Input
                  id="edit-contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="bg-white border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-district">District</Label>
                <Input
                  id="edit-district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 mt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Portal Credentials</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="bg-white border-slate-300 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-password">Password</Label>
                  <Input
                    id="edit-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-white border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-300 text-xs">
              Cancel
            </Button>
            <Button onClick={handleUpdateChurch} className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Church Members Modal */}
      {churchToViewMembers && (
        <Dialog open={!!churchToViewMembers} onOpenChange={() => setChurchToViewMembers(null)}>
          <DialogContent className="sm:max-w-[700px] bg-white max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold text-slate-900">
                {churchToViewMembers.name} — Member Roster
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Registered Pathfinder members affiliated with this local church.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-2">
              {getChurchMembers(churchToViewMembers).length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="p-3">Member Name</th>
                      <th className="p-3">Age</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Guardian</th>
                      <th className="p-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getChurchMembers(churchToViewMembers).map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{m.name}</td>
                        <td className="p-3 text-slate-600">{m.age} yrs</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {m.category}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-700">{m.guardian}</td>
                        <td className="p-3 text-slate-600 font-mono">{m.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No active registered pathfinders enrolled under {churchToViewMembers.name} yet.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChurchToViewMembers(null)}
                className="border-slate-300 text-xs"
              >
                Close Roster
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!churchToDelete} onOpenChange={(open) => !open && setChurchToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              This action cannot be undone. This will permanently remove <strong>{churchToDelete?.name}</strong> from the district directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChurch} className="bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold">
              Delete Church
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Churches;
