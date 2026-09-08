import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Edit, Trash2, MessageSquare, Church as ChurchIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getUniformRequests,
  saveUniformRequest,
  updateUniformRequest,
  deleteUniformRequest,
  generateUniformId,
  syncUniformRequestsFromBackend,
  UNIFORMS_SYNC_EVENT,
} from '@/lib/uniforms';
import { getChurches, syncChurchesFromBackend } from '@/lib/churches';
import { api } from '@/lib/api';
import { UniformRequest, FABRIC_COLORS, GENDER_OPTIONS } from '@/types/uniform';
import { MEMBERSHIP_CATEGORIES } from '@/types/registration';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'pending' | 'processing' | 'ready' | 'delivered';
type SortField = 'name' | 'totalYards' | 'submittedAt' | 'status' | 'church';
type SortDirection = 'asc' | 'desc';


const statusConfig: Record<string, { label: string; color: string; bg: string; order: number }> = {
  pending: { label: 'Pending', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-300', order: 0 },
  processing: { label: 'Processing', color: 'text-slate-800', bg: 'bg-slate-100 border-slate-300', order: 1 },
  ready: { label: 'Ready', color: 'text-primary', bg: 'bg-primary/10 border-primary/30', order: 2 },
  delivered: { label: 'Delivered', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', order: 3 },
};

const AdminUniformRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<UniformRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [churchFilter, setChurchFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<UniformRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sorting
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Date range filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [editingRequest, setEditingRequest] = useState<UniformRequest | null>(null);

  // Dynamic Churches
  const [availableChurches, setAvailableChurches] = useState<string[]>([]);

  // Messaging Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{
    name: string;
    phone: string;
    church?: string;
    yards?: number;
    count?: number;
  } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Add/Edit Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formChurch, setFormChurch] = useState('Santasi SDA Church');
  const [formCategory, setFormCategory] = useState('Explorer');
  const [formGender, setFormGender] = useState('Male');
  const [formWhiteYards, setFormWhiteYards] = useState<number>(2);
  const [formKhakiYards, setFormKhakiYards] = useState<number>(0);
  const [formGreenYards, setFormGreenYards] = useState<number>(2.5);
  const [formSpecialNotes, setFormSpecialNotes] = useState('');
  const [formAdminNotes, setFormAdminNotes] = useState('');
  const [formStatus, setFormStatus] = useState<UniformRequest['status']>('pending');

  const printRef = useRef<HTMLDivElement>(null);

  const dedupe = useCallback((list: UniformRequest[]) => {
    const map = new Map<string, UniformRequest>();
    for (const item of list) {
      if (item && item.id) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values());
  }, []);

  const fetchRequests = useCallback(() => {
    const data = getUniformRequests();
    const validData = dedupe(data.filter((r) => Array.isArray(r.fabrics)));
    setRequests(validData);
    syncUniformRequestsFromBackend().then((fresh) => {
      if (fresh) {
        setRequests(dedupe(fresh.filter((r) => Array.isArray(r.fabrics))));
      }
    });
  }, [dedupe]);

  useEffect(() => {
    fetchRequests();
    window.addEventListener(UNIFORMS_SYNC_EVENT, fetchRequests);
    window.addEventListener('focus', fetchRequests);
    return () => {
      window.removeEventListener(UNIFORMS_SYNC_EVENT, fetchRequests);
      window.removeEventListener('focus', fetchRequests);
    };
  }, [fetchRequests]);

  useEffect(() => {
    const loadChurches = () => {
      const stored = getChurches();
      if (stored && stored.length > 0) {
        setAvailableChurches(stored.map((c) => c.name));
      }
      syncChurchesFromBackend().then((fresh) => {
        if (fresh && fresh.length > 0) {
          setAvailableChurches(fresh.map((c) => c.name));
        }
      });
    };
    loadChurches();
  }, []);

  const churchList = availableChurches;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchQuery, statusFilter, dateFrom, dateTo]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.memberChurch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.memberPhone.includes(searchQuery) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesChurch = churchFilter === 'all' || req.memberChurch === churchFilter;

      let matchesDate = true;
      if (dateFrom) {
        matchesDate = matchesDate && new Date(req.submittedAt) >= new Date(dateFrom);
      }
      if (dateTo) {
        const toEnd = new Date(dateTo);
        toEnd.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(req.submittedAt) <= toEnd;
      }

      return matchesSearch && matchesStatus && matchesChurch && matchesDate;
    });
  }, [requests, searchQuery, statusFilter, churchFilter, dateFrom, dateTo]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.memberName.localeCompare(b.memberName);
          break;
        case 'church':
          comparison = a.memberChurch.localeCompare(b.memberChurch);
          break;
        case 'totalYards':
          comparison = (a.totalYards || 0) - (b.totalYards || 0);
          break;
        case 'status':
          comparison = (statusConfig[a.status]?.order ?? 99) - (statusConfig[b.status]?.order ?? 99);
          break;
        case 'submittedAt':
        default:
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRequests, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const processing = requests.filter((r) => r.status === 'processing').length;
    const ready = requests.filter((r) => r.status === 'ready').length;
    const delivered = requests.filter((r) => r.status === 'delivered').length;
    const totalYards = requests.reduce((sum, r) => sum + (r.totalYards || 0), 0);
    return { total, pending, processing, ready, delivered, totalYards };
  }, [requests]);

  // Fabric yards aggregate totals
  const fabricTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    requests.forEach((r) => {
      (r.fabrics || []).forEach((f) => {
        totals[f.colorId] = (totals[f.colorId] || 0) + f.yards;
      });
    });
    return totals;
  }, [requests]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === sortedRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRequests.map((r) => r.id)));
    }
  };

  const isAllSelected = sortedRequests.length > 0 && selectedIds.size === sortedRequests.length;
  const isSomeSelected = selectedIds.size > 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-[10px] text-slate-300 ml-1">↕</span>;
    return sortDirection === 'asc' ? (
      <span className="text-xs text-primary font-bold ml-1">↑</span>
    ) : (
      <span className="text-xs text-primary font-bold ml-1">↓</span>
    );
  };

  const handleStatusChange = (id: string, newStatus: UniformRequest['status']) => {
    updateUniformRequest(id, {
      status: newStatus,
      processedAt: newStatus !== 'pending' ? new Date().toISOString() : undefined,
      processedBy: newStatus !== 'pending' ? 'Admin' : undefined,
    });
    toast.success(`Request status updated to "${newStatus}"`);
    fetchRequests();
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const handleBulkStatusChange = (newStatus: UniformRequest['status']) => {
    const count = selectedIds.size;
    selectedIds.forEach((id) => {
      updateUniformRequest(id, {
        status: newStatus,
        processedAt: newStatus !== 'pending' ? new Date().toISOString() : undefined,
        processedBy: newStatus !== 'pending' ? 'Admin' : undefined,
      });
    });
    toast.success(`${count} request(s) updated to "${newStatus}"`);
    setSelectedIds(new Set());
    fetchRequests();
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (!confirm(`Permanently delete ${count} request(s)? This cannot be undone.`)) return;
    selectedIds.forEach((id) => deleteUniformRequest(id));
    toast.success(`${count} request(s) deleted`);
    setSelectedIds(new Set());
    setSelectedRequest(null);
    fetchRequests();
  };

  const handleSaveNotes = (id: string) => {
    updateUniformRequest(id, { adminNotes });
    toast.success('Notes saved');
    fetchRequests();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this uniform request?')) return;
    deleteUniformRequest(id);
    toast.success('Request deleted');
    setSelectedRequest(null);
    fetchRequests();
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormName('');
    setFormPhone('');
    setFormChurch('Santasi Central SDA');
    setFormCategory('Explorer');
    setFormGender('Male');
    setFormWhiteYards(2);
    setFormKhakiYards(0);
    setFormGreenYards(2.5);
    setFormSpecialNotes('');
    setFormAdminNotes('');
    setFormStatus('pending');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (req: UniformRequest) => {
    setEditingRequest(req);
    setFormName(req.memberName);
    setFormPhone(req.memberPhone);
    setFormChurch(req.memberChurch);
    setFormCategory(req.memberCategory);
    setFormGender(req.gender);
    setFormWhiteYards((req.fabrics || []).find((f) => f.colorId === 'white')?.yards || 0);
    setFormKhakiYards((req.fabrics || []).find((f) => f.colorId === 'khaki')?.yards || 0);
    setFormGreenYards((req.fabrics || []).find((f) => f.colorId === 'green')?.yards || 0);
    setFormSpecialNotes(req.specialNotes || '');
    setFormAdminNotes(req.adminNotes || '');
    setFormStatus(req.status);
  };

  // Messaging Handlers
  const handleOpenMessageModal = (req: UniformRequest) => {
    setMessageTarget({
      name: req.memberName,
      phone: req.memberPhone,
      church: req.memberChurch,
      yards: req.totalYards,
    });
    setMessageText(
      `Hello ${req.memberName}, your uniform fabric request (${req.totalYards || 0} yds) at ${req.memberChurch || 'Santasi AYM'} is currently ${req.status}. Please contact the Quartermaster for pickup details.`
    );
    setMessageModalOpen(true);
  };

  const handleBulkMessage = () => {
    const selectedList = requests.filter((r) => selectedIds.has(r.id));
    if (selectedList.length === 0) return;
    const first = selectedList[0];
    setMessageTarget({
      name: `${selectedList.length} Selected Members`,
      phone: first.memberPhone,
      church: first.memberChurch,
      count: selectedList.length,
    });
    setMessageText(
      `Hello Pathfinder, your uniform requisition with Santasi AYM District is being processed. Please check with your local church clerk or quartermaster.`
    );
    setMessageModalOpen(true);
  };

  const formatGhanaPhoneForWhatsApp = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('233')) return digits;
    if (digits.startsWith('0')) return `233${digits.slice(1)}`;
    return digits;
  };

  const handleSendWhatsApp = () => {
    if (!messageTarget || !messageTarget.phone) {
      toast.error('No valid phone number found for member');
      return;
    }
    const cleanPhone = formatGhanaPhoneForWhatsApp(messageTarget.phone);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    toast.success(`WhatsApp chat opened for ${messageTarget.name}`);
  };

  const handleSendSms = async () => {
    if (!messageTarget || !messageText.trim()) return;
    setIsSendingMessage(true);
    try {
      await api('/notifications/send-message', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: messageTarget.name,
          recipientPhone: messageTarget.phone,
          message: messageText.trim(),
        }),
      });
      toast.success(`SMS notification dispatched to ${messageTarget.name}`);
      setMessageModalOpen(false);
    } catch (err) {
      console.warn('[Message] SMS dispatch warning, launching WhatsApp:', err);
      toast.info('SMS server offline, opening WhatsApp dispatch...');
      handleSendWhatsApp();
      setMessageModalOpen(false);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Save Add Request with double-click guard
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAdd) return;
    if (!formName.trim() || !formPhone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }
    const fabrics = [
      { colorId: 'white', colorLabel: 'White', yards: formWhiteYards },
      { colorId: 'khaki', colorLabel: 'Khaki', yards: formKhakiYards },
      { colorId: 'green', colorLabel: 'Green', yards: formGreenYards },
    ].filter((f) => f.yards > 0);

    const totalYards = fabrics.reduce((sum, f) => sum + f.yards, 0);
    if (totalYards <= 0) {
      toast.error('Please assign at least 0.5 yards of fabric');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const newReq: UniformRequest = {
        id: generateUniformId(),
        memberName: formName.trim(),
        memberPhone: formPhone.trim(),
        memberChurch: formChurch,
        memberCategory: formCategory,
        gender: formGender,
        fabrics,
        totalYards,
        specialNotes: formSpecialNotes.trim(),
        adminNotes: formAdminNotes.trim(),
        status: formStatus,
        submittedAt: new Date().toISOString(),
        processedAt: formStatus !== 'pending' ? new Date().toISOString() : undefined,
        processedBy: formStatus !== 'pending' ? 'Admin' : undefined,
      };

      await saveUniformRequest(newReq, true);
      toast.success('New uniform requisition logged successfully!');
      setIsAddModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Failed to save uniform request:', err);
      const message = err instanceof Error ? err.message : 'Failed to save requisition. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Save Edit Request
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    if (!formName.trim() || !formPhone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }
    const fabrics = [
      { colorId: 'white', colorLabel: 'White', yards: formWhiteYards },
      { colorId: 'khaki', colorLabel: 'Khaki', yards: formKhakiYards },
      { colorId: 'green', colorLabel: 'Green', yards: formGreenYards },
    ].filter((f) => f.yards > 0);

    const totalYards = fabrics.reduce((sum, f) => sum + f.yards, 0);
    if (totalYards <= 0) {
      toast.error('Please assign at least 0.5 yards of fabric');
      return;
    }

    try {
      await updateUniformRequest(editingRequest.id, {
        memberName: formName.trim(),
        memberPhone: formPhone.trim(),
        memberChurch: formChurch,
        memberCategory: formCategory,
        gender: formGender,
        fabrics,
        totalYards,
        specialNotes: formSpecialNotes.trim(),
        adminNotes: formAdminNotes.trim(),
        status: formStatus,
        processedAt: formStatus !== 'pending' ? (editingRequest.processedAt || new Date().toISOString()) : undefined,
        processedBy: formStatus !== 'pending' ? (editingRequest.processedBy || 'Admin') : undefined,
      });

      toast.success('Uniform requisition updated successfully!');
      setEditingRequest(null);
      fetchRequests();
      if (selectedRequest?.id === editingRequest.id) {
        setSelectedRequest({
          ...selectedRequest,
          memberName: formName.trim(),
          memberPhone: formPhone.trim(),
          memberChurch: formChurch,
          memberCategory: formCategory,
          gender: formGender,
          fabrics,
          totalYards,
          specialNotes: formSpecialNotes.trim(),
          adminNotes: formAdminNotes.trim(),
          status: formStatus,
        });
      }
    } catch (err) {
      console.error('Failed to update uniform request:', err);
      const message = err instanceof Error ? err.message : 'Failed to update requisition. Please try again.';
      toast.error(message);
    }
  };

  const buildCSV = (data: UniformRequest[]) => {
    const headers = [
      'ID', 'Name', 'Phone', 'Church', 'Category', 'Gender',
      'White (yards)', 'Khaki (yards)', 'Green (yards)', 'Total Yards',
      'Notes', 'Status', 'Submitted At', 'Admin Notes'
    ];
    const rows = data.map((r) => {
      const getYards = (colorId: string) => (r.fabrics || []).find((f) => f.colorId === colorId)?.yards || 0;
      return [
        r.id,
        `"${r.memberName}"`,
        `"${r.memberPhone}"`,
        `"${r.memberChurch}"`,
        r.memberCategory,
        r.gender,
        getYards('white'),
        getYards('khaki'),
        getYards('green'),
        r.totalYards || 0,
        `"${(r.specialNotes || '').replace(/"/g, '""')}"`,
        r.status,
        r.submittedAt,
        `"${(r.adminNotes || '').replace(/"/g, '""')}"`,
      ];
    });
    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const csv = buildCSV(sortedRequests);
    downloadCSV(csv, `Santasi_AYM_Uniform_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${sortedRequests.length} uniform requests`);
  };

  const handleExportSelected = () => {
    const selected = sortedRequests.filter((r) => selectedIds.has(r.id));
    const csv = buildCSV(selected);
    downloadCSV(csv, `Santasi_AYM_Uniform_Selected_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${selected.length} selected requests`);
  };

  const handlePrint = () => {
    if (!selectedRequest) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const req = selectedRequest;
    printWindow.document.write(`
      <html>
      <head>
        <title>Uniform Slip - ${req.memberName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
          h1 { font-size: 20px; font-weight: 800; color: #22534f; margin-bottom: 2px; }
          .subtitle { color: #64748b; font-size: 12px; margin-bottom: 20px; }
          .section { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #fff; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #22534f; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .field-label { font-size: 11px; color: #64748b; font-weight: 500; }
          .field-value { font-size: 13px; font-weight: 600; color: #0f172a; }
          .fabric-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .fabric-row:last-child { border-bottom: none; }
          .total-row { font-weight: bold; border-top: 2px solid #22534f; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 14px; }
          .notes { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 12px; color: #334155; }
          .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <h1>Hinterland Falcons Pathfinder Club</h1>
        <p class="subtitle">Uniform Material Requisition Slip • Order: ${req.id} • Date: ${new Date(req.submittedAt).toLocaleDateString()} • Status: ${statusConfig[req.status]?.label || req.status}</p>

        <div class="section">
          <div class="section-title">Applicant Details</div>
          <div class="grid">
            <div><div class="field-label">Full Name</div><div class="field-value">${req.memberName}</div></div>
            <div><div class="field-label">Phone</div><div class="field-value">${req.memberPhone}</div></div>
            <div><div class="field-label">Home Church</div><div class="field-value">${req.memberChurch}</div></div>
            <div><div class="field-label">Pathfinder Category</div><div class="field-value">${req.memberCategory}</div></div>
            <div><div class="field-label">Gender</div><div class="field-value">${req.gender}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Fabric Yardage Allocation</div>
          ${(req.fabrics || []).map((f) => {
            return `<div class="fabric-row"><span>${f.colorLabel} Fabric</span><strong>${f.yards} yards</strong></div>`;
          }).join('')}
          <div class="total-row"><span>Total Fabric Allocated</span><span>${req.totalYards || 0} yards</span></div>
        </div>

        ${req.specialNotes ? `<div class="section"><div class="section-title">Member Special Notes</div><div class="notes">${req.specialNotes}</div></div>` : ''}
        ${req.adminNotes ? `<div class="section"><div class="section-title">Executive Notes</div><div class="notes">${req.adminNotes}</div></div>` : ''}

        <div class="footer">Issued by Santasi AYM Executive Committee • Santasi SDA Church Grounds</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFrom || dateTo;

  const filterTabs = [
    { value: 'all', label: 'All Orders', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'processing', label: 'Processing', count: stats.processing },
    { value: 'ready', label: 'Ready for Pickup', count: stats.ready },
    { value: 'delivered', label: 'Delivered', count: stats.delivered },
  ] as const;

  return (
    <>
      <AdminHeader
        title="Uniform Requests Management"
        subtitle={`${stats.total} total orders recorded • ${stats.totalYards} total yards of fabric requested.`}
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending</span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-slate-900">{stats.pending}</p>
              <p className="text-xs text-slate-400 mt-1">Awaiting coordinator review</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Processing</span>
                <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-slate-900">{stats.processing}</p>
              <p className="text-xs text-slate-400 mt-1">Measuring & cutting fabric</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ready</span>
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-primary">{stats.ready}</p>
              <p className="text-xs text-slate-400 mt-1">Packaged for member pickup</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivered</span>
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-slate-700">{stats.delivered}</p>
              <p className="text-xs text-slate-400 mt-1">Completed handovers</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Yards</span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-slate-900">{stats.totalYards}</p>
              <p className="text-xs text-slate-400 mt-1">Total yards across orders</p>
            </div>
          </div>

          {/* Fabric Breakdown Summary */}
          {stats.total > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fabric Yardage Breakdown (All Requests)
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {stats.totalYards} yards cumulative
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FABRIC_COLORS.map((fabric) => (
                  <div
                    key={fabric.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg border border-slate-300 shrink-0"
                        style={{ backgroundColor: fabric.hex }}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{fabric.label}</p>
                        <p className="text-[11px] text-slate-500">{fabric.description}</p>
                      </div>
                    </div>
                    <span className="font-heading font-black text-lg text-slate-900">
                      {fabricTotals[fabric.id] || 0}
                      <span className="text-xs font-normal text-slate-400 ml-1">yds</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls Bar: Search, Church Filter, + Add Request, Manage Churches, and Actions */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex items-center gap-2 w-full lg:max-w-xl">
              <Input
                placeholder="Search by member name, church, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-slate-300 h-10 text-xs flex-1"
              />
              <Select value={churchFilter} onValueChange={setChurchFilter}>
                <SelectTrigger className="h-10 w-[170px] text-xs bg-white border-slate-300">
                  <SelectValue placeholder="All Churches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Churches</SelectItem>
                  {churchList.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              <Button
                onClick={handleOpenAddModal}
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-3.5 flex items-center gap-1.5"
              >
                <span>+ Add Uniform Request</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/churches')}
                className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 h-9 flex items-center gap-1.5"
                title="Manage district churches and pastors"
              >
                <ChurchIcon className="h-3.5 w-3.5 text-primary" />
                <span>Manage Churches</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={cn(
                  'text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 h-9',
                  showAdvancedFilters && 'bg-slate-100'
                )}
              >
                Date Filter {dateFrom || dateTo ? '• Active' : ''}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRequests}
                className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 h-9"
              >
                ↻ Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
                disabled={sortedRequests.length === 0}
                className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 h-9"
              >
                ↓ Export All CSV
              </Button>
              {isSomeSelected && (
                <Button
                  size="sm"
                  onClick={handleExportSelected}
                  className="text-xs font-semibold bg-primary hover:bg-primary/90 text-white h-9"
                >
                  ↓ Export Selected ({selectedIds.size})
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Date Filter Box */}
          {showAdvancedFilters && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">From:</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[150px] h-8 text-xs bg-white border-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">To:</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[150px] h-8 text-xs bg-white border-slate-300"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-xs font-semibold text-destructive hover:underline ml-2"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}

          {/* Filter Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
                </button>
              );
            })}
          </div>

          {/* Requests Table */}
          {sortedRequests.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                    <tr>
                      <th className="px-4 py-3.5 w-10">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={selectAll}
                          aria-label="Select all"
                        />
                      </th>
                      <th
                        className="px-4 py-3.5 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        Member Details <SortIndicator field="name" />
                      </th>
                      <th className="px-4 py-3.5">Fabric Selection</th>
                      <th
                        className="px-4 py-3.5 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort('totalYards')}
                      >
                        Total Yards <SortIndicator field="totalYards" />
                      </th>
                      <th
                        className="px-4 py-3.5 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        Status <SortIndicator field="status" />
                      </th>
                      <th
                        className="px-4 py-3.5 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort('submittedAt')}
                      >
                        Submitted <SortIndicator field="submittedAt" />
                      </th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedRequests.map((req) => {
                      const isSelected = selectedIds.has(req.id);
                      const config = statusConfig[req.status] || statusConfig.pending;

                      return (
                        <tr
                          key={req.id}
                          className={cn(
                            'hover:bg-slate-50/80 transition-colors',
                            isSelected && 'bg-primary/5'
                          )}
                        >
                          <td className="px-4 py-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(req.id)}
                              aria-label={`Select ${req.memberName}`}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-bold text-slate-900 text-sm">{req.memberName}</span>
                                <Badge variant="outline" className="text-[10px] font-medium border-slate-300 text-slate-600">
                                  {req.memberCategory}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{req.memberChurch} • {req.memberPhone}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              {(req.fabrics || []).map((fabric) => {
                                const colorInfo = FABRIC_COLORS.find((f) => f.id === fabric.colorId);
                                return (
                                  <div
                                    key={fabric.colorId}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 border border-slate-200"
                                  >
                                    <div
                                      className="h-3 w-3 rounded-sm border border-slate-300"
                                      style={{ backgroundColor: colorInfo?.hex }}
                                    />
                                    <span className="font-semibold text-slate-800">{fabric.colorLabel}</span>
                                    <span className="text-slate-500 font-mono">{fabric.yards}yd</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono font-black text-base text-slate-900">{req.totalYards || 0}</span>
                            <span className="text-xs text-slate-500 ml-1">yds</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border', config.bg, config.color)}>
                              {config.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {new Date(req.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Select
                                value={req.status}
                                onValueChange={(val) => handleStatusChange(req.id, val as UniformRequest['status'])}
                              >
                                <SelectTrigger className="h-8 w-[110px] text-xs bg-white border-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenMessageModal(req)}
                                className="h-8 w-8 text-primary border-slate-300 hover:text-primary hover:bg-primary/10"
                                title="Send Message / SMS to Applicant"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setAdminNotes(req.adminNotes || '');
                                }}
                                className="h-8 w-8 text-slate-700 border-slate-300 hover:text-primary hover:bg-slate-100"
                                title="View Request Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenEditModal(req)}
                                className="h-8 w-8 text-slate-700 border-slate-300 hover:text-primary hover:bg-slate-100"
                                title="Edit Request"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(req.id)}
                                className="h-8 w-8 text-destructive border-slate-300 hover:text-destructive hover:bg-red-50 hover:border-red-300"
                                title="Delete Request"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-slate-200 bg-white">
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                No Uniform Requests Found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                {hasActiveFilters
                  ? 'No requests match your current search, church, or date filters.'
                  : 'Uniform material requests submitted by pathfinders will appear here. Click "+ Add Uniform Request" above to log a new requisition.'}
              </p>
              {hasActiveFilters && (
                <div className="flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="border-slate-300 text-xs">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bulk Selection Bar */}
      {isSomeSelected && (
        <div className="sticky bottom-0 z-40 border-t border-slate-300 bg-white/95 backdrop-blur-md px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-slate-900">
                {selectedIds.size} request{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-medium mr-1">Batch status:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange('pending')}
                className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
              >
                Mark Pending
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange('processing')}
                className="text-xs border-slate-300 text-slate-800 hover:bg-slate-100"
              >
                Mark Processing
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange('ready')}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                Mark Ready
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange('delivered')}
                className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Mark Delivered
              </Button>
              <div className="w-px h-5 bg-slate-300 mx-1" />
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkMessage}
                className="text-xs border-primary/40 text-primary hover:bg-primary/10 flex items-center gap-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Message Selected ({selectedIds.size})</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                className="text-xs font-semibold"
              >
                Delete Batch
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-500"
              >
                Deselect
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Centered Modal Dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => setSelectedRequest(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-slate-300 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">Uniform Request Details</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedRequest.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenMessageModal(selectedRequest)}
                  className="text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Message Applicant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditModal(selectedRequest)}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Print Slip
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 text-sm overflow-y-auto flex-1" ref={printRef}>
                {/* Status Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Current Processing Status
                  </label>
                  <Select
                    value={selectedRequest.status}
                    onValueChange={(val) => handleStatusChange(selectedRequest.id, val as UniformRequest['status'])}
                  >
                    <SelectTrigger className="w-full bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="processing">In Processing / Cutting</SelectItem>
                      <SelectItem value="ready">Ready for Pickup</SelectItem>
                      <SelectItem value="delivered">Delivered to Member</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedRequest.processedAt && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      Last updated: {new Date(selectedRequest.processedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Member Profile */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                    Applicant Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Full Name</p>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.memberName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Phone</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.memberPhone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Home Church</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.memberChurch}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Category</p>
                      <Badge variant="outline" className="mt-0.5 text-[10px] text-slate-700 border-slate-300">
                        {selectedRequest.memberCategory}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400">Gender</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedRequest.gender}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Submitted Date</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fabric Order */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
                    Fabric Yardage Allocation
                  </h3>
                  <div className="space-y-2.5">
                    {(selectedRequest.fabrics || []).map((fabric) => {
                      const colorInfo = FABRIC_COLORS.find((f) => f.id === fabric.colorId);
                      return (
                        <div
                          key={fabric.colorId}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-8 rounded-lg border border-slate-300"
                              style={{ backgroundColor: colorInfo?.hex }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{fabric.colorLabel}</p>
                              <p className="text-[11px] text-slate-500">{colorInfo?.description}</p>
                            </div>
                          </div>
                          <span className="font-mono font-black text-sm text-slate-900">
                            {fabric.yards} yds
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-3 border-t border-slate-200 text-xs font-bold text-slate-900">
                      <span>Total Yards Requested</span>
                      <span className="font-mono text-primary text-sm font-black">{selectedRequest.totalYards || 0} yards</span>
                    </div>
                  </div>
                </div>

                {/* Member Notes */}
                {selectedRequest.specialNotes && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                      Applicant Special Instructions
                    </h3>
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200">
                      {selectedRequest.specialNotes}
                    </p>
                  </div>
                )}

                {/* Internal Admin Notes */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                    Executive / Coordinator Notes
                  </h3>
                  <Textarea
                    placeholder="Enter internal notes regarding material distribution, tailor assignments, or pickups..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="min-h-[80px] text-xs bg-white border-slate-300 mb-3"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveNotes(selectedRequest.id)}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(selectedRequest.id)}
                className="text-xs text-destructive hover:text-destructive hover:bg-red-50 gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Delete Request
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="border-slate-300 text-xs text-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Uniform Request Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 border-slate-200">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Add Uniform Material Request
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Log a manual or walk-in uniform fabric requisition for a club candidate.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAdd} className="space-y-4 text-xs mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-bold text-slate-700">Member Name *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Full name"
                  className="h-9 text-xs border-slate-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Phone Number *</Label>
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0244000000"
                  className="h-9 text-xs border-slate-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Home Church *</Label>
                <Select value={formChurch} onValueChange={setFormChurch}>
                  <SelectTrigger className="h-9 text-xs border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {churchList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Rank / Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-9 text-xs border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Gender *</Label>
                <Select value={formGender} onValueChange={setFormGender}>
                  <SelectTrigger className="h-9 text-xs border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fabric Allocation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                Fabric Yardage Allocation
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-slate-600 block mb-1">White (Top)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formWhiteYards}
                    onChange={(e) => setFormWhiteYards(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600 block mb-1">Khaki (Top)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formKhakiYards}
                    onChange={(e) => setFormKhakiYards(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600 block mb-1">Green (Bottom)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formGreenYards}
                    onChange={(e) => setFormGreenYards(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium text-right">
                Total: {Math.round((formWhiteYards + formKhakiYards + formGreenYards) * 10) / 10} yards
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Initial Status</Label>
              <Select value={formStatus} onValueChange={(val) => setFormStatus(val as UniformRequest['status'])}>
                <SelectTrigger className="h-9 text-xs border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Coordinator / Executive Notes</Label>
              <Input
                value={formAdminNotes}
                onChange={(e) => setFormAdminNotes(e.target.value)}
                placeholder="e.g. Assigned to central tailor"
                className="h-9 text-xs border-slate-300"
              />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs"
              >
                Save Requisition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Uniform Request Dialog */}
      <Dialog open={!!editingRequest} onOpenChange={(open) => !open && setEditingRequest(null)}>
        <DialogContent className="max-w-lg bg-white p-6 border-slate-200">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Edit Uniform Request ({editingRequest?.id})
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update member details, fabric allocation, or coordinator dispatch notes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-bold text-slate-700">Member Name *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-9 text-xs border-slate-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Phone Number *</Label>
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="h-9 text-xs border-slate-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Home Church *</Label>
                <Select value={formChurch} onValueChange={setFormChurch}>
                  <SelectTrigger className="h-9 text-xs border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {churchList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Rank / Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-9 text-xs border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Gender *</Label>
                <Select value={formGender} onValueChange={setFormGender}>
                  <SelectTrigger className="h-9 text-xs border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fabric Allocation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                Fabric Yardage Allocation
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-slate-600 block mb-1">White (Top)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formWhiteYards}
                    onChange={(e) => setFormWhiteYards(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600 block mb-1">Khaki (Top)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formKhakiYards}
                    onChange={(e) => setFormKhakiYards(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600 block mb-1">Green (Bottom)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formGreenYards}
                    onChange={(e) => setFormGreenYards(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium text-right">
                Total: {Math.round((formWhiteYards + formKhakiYards + formGreenYards) * 10) / 10} yards
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Processing Status</Label>
              <Select value={formStatus} onValueChange={(val) => setFormStatus(val as UniformRequest['status'])}>
                <SelectTrigger className="h-9 text-xs border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Coordinator / Executive Notes</Label>
              <Input
                value={formAdminNotes}
                onChange={(e) => setFormAdminNotes(e.target.value)}
                placeholder="e.g. Fabric released to tailors"
                className="h-9 text-xs border-slate-300"
              />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRequest(null)}
                className="text-xs border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs"
              >
                Update Requisition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Message to User Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 border-slate-200">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Dispatch Message to Member</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Send an instant WhatsApp message or SMS alert directly to the applicant.
            </DialogDescription>
          </DialogHeader>

          {messageTarget && (
            <div className="space-y-4 text-xs mt-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{messageTarget.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {messageTarget.phone} {messageTarget.church ? `• ${messageTarget.church}` : ''}
                  </p>
                </div>
                <Badge variant="outline" className="bg-white text-primary border-primary/30">
                  {messageTarget.yards ? `${messageTarget.yards} yds requested` : 'Uniform Applicant'}
                </Badge>
              </div>

              {/* Quick Message Templates */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Quick Notice Presets</Label>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setMessageText(
                        `Hello ${messageTarget.name}, your Pathfinder uniform fabric order (${messageTarget.yards || 0} yds) is READY FOR COLLECTION at the Santasi Central SDA Quartermaster's store. Please come along with your Pathfinder ID.`
                      )
                    }
                    className="text-left p-2 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-primary/5 text-[11px] text-slate-700 transition-colors"
                  >
                    <span className="font-bold text-primary block">📦 Ready for Collection</span>
                    Fabric is ready for pickup at Quartermaster store.
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMessageText(
                        `Hello ${messageTarget.name}, your uniform requisition is currently BEING TAILORED and prepared. We will notify you immediately once your kit is ready for pickup.`
                      )
                    }
                    className="text-left p-2 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-primary/5 text-[11px] text-slate-700 transition-colors"
                  >
                    <span className="font-bold text-primary block">✂️ Tailoring in Progress</span>
                    Materials are currently assigned and being tailored.
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMessageText(
                        `Hello ${messageTarget.name}, please contact the Santasi AYM District Quartermaster regarding your uniform measurements and verification.`
                      )
                    }
                    className="text-left p-2 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-primary/5 text-[11px] text-slate-700 transition-colors"
                  >
                    <span className="font-bold text-primary block">📋 Verification Required</span>
                    Request member to contact the Quartermaster.
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Message Content *</Label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  placeholder="Type message to member..."
                  className="text-xs bg-white border-slate-300"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendWhatsApp}
                  className="flex-1 bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 text-xs font-bold h-9"
                >
                  <span>Chat via WhatsApp</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleSendSms}
                  disabled={isSendingMessage || !messageText.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs font-bold h-9"
                >
                  {isSendingMessage ? 'Sending...' : 'Send SMS Dispatch'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUniformRequests;
