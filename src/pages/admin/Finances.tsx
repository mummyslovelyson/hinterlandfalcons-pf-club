import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Printer, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type FeeCategory = 'Annual Registration Dues' | 'Monthly Dues' | 'Camporee Levy' | 'Uniform Kit';
type PaymentMethod = 'MTN Mobile Money' | 'Telecel Cash' | 'Cash' | 'Bank Transfer';

interface Transaction {
  id: string;
  date: string;
  memberName: string;
  category: FeeCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  receiptNo: string;
  status: 'Completed' | 'Pending' | 'Refunded';
}

const CATEGORIES = ['All', 'Annual Registration Dues', 'Monthly Dues', 'Camporee Levy', 'Uniform Kit'] as const;

const Finances = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    try {
      const data = await api<Transaction[]>('/finances');
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err) {
      console.warn('[Finances] Failed to fetch transactions:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const [newRecord, setNewRecord] = useState<Partial<Transaction>>({
    category: 'Annual Registration Dues',
    paymentMethod: 'MTN Mobile Money',
    amount: 50.00,
    status: 'Completed',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSaveTransaction = async () => {
    if (!newRecord.memberName || !newRecord.amount) {
      toast.error('Please enter member name and payment amount');
      return;
    }

    try {
      const payload = {
        date: newRecord.date || new Date().toISOString().split('T')[0],
        memberName: newRecord.memberName,
        category: (newRecord.category as FeeCategory) || 'Annual Registration Dues',
        amount: Number(newRecord.amount),
        paymentMethod: (newRecord.paymentMethod as PaymentMethod) || 'MTN Mobile Money',
        receiptNo: `REC-${Date.now().toString().slice(-6)}`,
        status: 'Completed',
      };

      const created = await api<Transaction>('/finances', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const updated = [created, ...transactions];
      setTransactions(updated);
      toast.success(`Payment receipt ${created.receiptNo} recorded successfully!`);
      setIsRecordModalOpen(false);
      setNewRecord({
        category: 'Annual Registration Dues',
        paymentMethod: 'MTN Mobile Money',
        amount: 50.00,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      toast.error('Failed to record payment on server');
    }
  };

  const handleDeleteTransaction = async (id: string, receiptNo: string) => {
    if (!confirm(`Are you sure you want to delete ledger receipt ${receiptNo}? This cannot be undone.`)) return;
    try {
      await api(`/finances/${id}`, { method: 'DELETE' });
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      toast.success(`Receipt ${receiptNo} deleted from ledger`);
    } catch (err) {
      toast.error('Failed to delete receipt from ledger');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Date', 'Member Name', 'Category', 'Amount (GHS)', 'Payment Method', 'Status'];
    const rows = transactions.map((t) => [
      t.receiptNo,
      t.date,
      `"${t.memberName}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      `"${t.paymentMethod}"`,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `falcons_club_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial ledger exported to CSV');
  };

  const totalCollected = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const camporeeFund = transactions
    .filter((t) => t.category === 'Camporee Levy')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const duesFund = transactions
    .filter((t) => t.category === 'Annual Registration Dues' || t.category === 'Monthly Dues')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const uniformFund = transactions
    .filter((t) => t.category === 'Uniform Kit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTransactions = transactions.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <AdminHeader
        title="Club Dues & Financial Ledger"
        subtitle={`Total GHS ${totalCollected.toFixed(2)} verified receipts recorded across Santasi AYM District.`}
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 w-full">
        <div className="w-full space-y-6">

          {/* Executive KPI Financial Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Receipts (YTD)
              </span>
              <p className="text-3xl font-heading font-extrabold text-foreground mt-1">
                GHS {totalCollected.toFixed(2)}
              </p>
              <p className="text-xs text-primary font-semibold mt-0.5">100% verified ledger</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Camporee Trust Fund
              </span>
              <p className="text-3xl font-heading font-extrabold text-foreground mt-1">
                GHS {camporeeFund.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Earmarked for Bosomtwe</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Dues & Subscriptions
              </span>
              <p className="text-3xl font-heading font-extrabold text-foreground mt-1">
                GHS {duesFund.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">General club administration</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Uniform Material Funds
              </span>
              <p className="text-3xl font-heading font-extrabold text-foreground mt-1">
                GHS {uniformFund.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">District fabric & accessories</p>
            </div>
          </div>

          {/* Top Actions & Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Input
                  placeholder="Search ledger by member name or receipt number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs h-10 w-full bg-slate-50/50 focus:bg-white border-slate-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="text-xs font-semibold h-10 border-slate-300 text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                >
                  ↓ Export CSV
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsRecordModalOpen(true)}
                  className="text-xs font-semibold h-10 bg-primary hover:bg-primary/90 text-white whitespace-nowrap"
                >
                  + Record Payment
                </Button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {CATEGORIES.map((cat) => {
                const count = cat === 'All'
                  ? transactions.length
                  : transactions.filter(t => t.category === cat).length;
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    )}
                  >
                    <span>{cat}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-white/20 text-white font-bold" : "bg-white text-slate-600 border border-slate-200"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Financial Transactions Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Receipt No</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Fee Category</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(tx)}
                            className="font-mono font-bold text-slate-900 hover:text-primary transition-colors text-left"
                            title="Click to view receipt"
                          >
                            {tx.receiptNo}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{tx.date}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {tx.memberName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          GHS {tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{tx.paymentMethod}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setSelectedReceipt(tx)}
                              className="h-8 w-8 text-slate-700 border-slate-300 hover:text-primary hover:bg-slate-100"
                              title="View & Print Official Receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleDeleteTransaction(tx.id, tx.receiptNo)}
                              className="h-8 w-8 text-destructive border-slate-300 hover:text-destructive hover:bg-red-50 hover:border-red-300"
                              title="Delete Transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No financial records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Record Payment */}
          <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-lg">Record Member Dues / Fee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Member Full Name</label>
                  <Input
                    placeholder="e.g. Kofi Boateng"
                    value={newRecord.memberName || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, memberName: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Category</label>
                    <select
                      value={newRecord.category}
                      onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value as FeeCategory })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Annual Registration Dues">Annual Registration Dues</option>
                      <option value="Monthly Dues">Monthly Dues</option>
                      <option value="Camporee Levy">Camporee Levy</option>
                      <option value="Uniform Kit">Uniform Kit</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Amount (GHS)</label>
                    <Input
                      type="number"
                      value={newRecord.amount || ''}
                      onChange={(e) => setNewRecord({ ...newRecord, amount: parseFloat(e.target.value) || 0 })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Payment Method</label>
                    <select
                      value={newRecord.paymentMethod}
                      onChange={(e) => setNewRecord({ ...newRecord, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Telecel Cash">Telecel Cash</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Payment Date</label>
                    <Input
                      type="date"
                      value={newRecord.date || ''}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setIsRecordModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveTransaction} className="bg-primary text-white">
                  Save Payment Receipt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal: Official Receipt View & Print */}
          <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-lg">Official Club Receipt</DialogTitle>
              </DialogHeader>
              {selectedReceipt && (
                <div className="space-y-4 py-2 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-heading font-extrabold text-sm text-slate-900">
                          Hinterland Falcons Pathfinder Club
                        </h4>
                        <p className="text-[11px] text-slate-500">Santasi AYM District • Kumasi, Ghana</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {selectedReceipt.receiptNo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Paid By</span>
                        <span className="font-bold text-slate-900">{selectedReceipt.memberName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Date</span>
                        <span className="font-medium text-slate-900">{selectedReceipt.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                        <span className="font-medium text-slate-900">{selectedReceipt.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Channel</span>
                        <span className="font-medium text-slate-900">{selectedReceipt.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Amount Paid</span>
                      <span className="font-heading font-extrabold text-lg text-primary">
                        GHS {selectedReceipt.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Digitally Verified
                      </span>
                      <span>Authorized Treasurer Stamp</span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    window.print();
                    toast.success(`Printing receipt ${selectedReceipt?.receiptNo}`);
                  }}
                  className="bg-primary text-white"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Receipt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </main>
    </>
  );
};

export default Finances;
