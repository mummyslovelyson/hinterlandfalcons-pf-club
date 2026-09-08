import { useState, useEffect, useMemo } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getRegistrations } from '@/lib/registrations';
import { PATHFINDER_CLASSES } from '@/types/registration';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface AttendanceRecord {
  memberId: string;
  name: string;
  className: string;
  status: 'Present' | 'Absent' | 'Excused';
}

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    let active = true;
    const fetchAttendance = async () => {
      try {
        const remote = await api<AttendanceRecord[]>(`/attendance?date=${selectedDate}`);
        if (!active) return;
        if (Array.isArray(remote) && remote.length > 0) {
          setRecords(remote);
          return;
        }
      } catch (err) {
        console.warn('[Attendance] Backend fetch fallback:', err);
      }

      // If no attendance recorded yet for this date, build from approved members
      const members = getRegistrations().filter((r) => r.status === 'approved');
      const initial: AttendanceRecord[] = members.map((m) => ({
        memberId: m.id,
        name: m.applicant?.fullName || 'Member',
        className: m.membership?.completedClasses?.[0] || 'Friend',
        status: 'Present',
      }));
      if (active) setRecords(initial);
    };

    fetchAttendance();
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const setMemberStatus = (memberId: string, status: 'Present' | 'Absent' | 'Excused') => {
    const updated = records.map((r) => (r.memberId === memberId ? { ...r, status } : r));
    setRecords(updated);
    api('/attendance', {
      method: 'PUT',
      body: JSON.stringify({ date: selectedDate, records: updated }),
    }).catch((err) => console.warn('[Attendance] Backend save deferred:', err));
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const updated = records.map((r) => {
      if (selectedClass !== 'All' && r.className !== selectedClass) return r;
      return { ...r, status };
    });
    setRecords(updated);
    api('/attendance', {
      method: 'PUT',
      body: JSON.stringify({ date: selectedDate, records: updated }),
    }).catch((err) => console.warn('[Attendance] Backend save deferred:', err));
    toast.success(`Marked all ${selectedClass !== 'All' ? selectedClass : 'roster'} as ${status}`);
  };

  const handleSaveAttendance = async () => {
    try {
      await api('/attendance', {
        method: 'PUT',
        body: JSON.stringify({ date: selectedDate, records }),
      });
      toast.success(`Attendance saved to server for ${selectedDate}`);
    } catch (err) {
      toast.error('Failed to save attendance to server');
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error('No attendance records to export');
      return;
    }

    const headers = ['Member ID', 'Full Name', 'Class Level', 'Meeting Date', 'Status'];
    const rows = records.map((r) => [
      r.memberId,
      `"${r.name}"`,
      r.className,
      selectedDate,
      r.status,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Santasi_AYM_Attendance_${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported attendance sheet for ${selectedDate}`);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesClass = selectedClass === 'All' ? true : r.className === selectedClass;
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [records, selectedClass, searchQuery]);

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const excusedCount = records.filter((r) => r.status === 'Excused').length;
  const attendanceRate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <>
      <AdminHeader
        title="Parade & Drill Attendance"
        subtitle="Log Sunday parade drills, fellowship assemblies, and investiture rehearsals."
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
        <div className="w-full max-w-7xl mx-auto space-y-6">

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Parade Roster</span>
              <p className="text-2xl font-heading font-extrabold text-foreground mt-1">{records.length}</p>
              <p className="text-xs text-slate-500">Active pathfinders</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Present on Parade</span>
              <p className="text-2xl font-heading font-extrabold text-primary mt-1">{presentCount}</p>
              <p className="text-xs text-slate-500">{attendanceRate}% turn-out</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Absent / Excused</span>
              <p className="text-2xl font-heading font-extrabold text-slate-700 mt-1">
                {absentCount} <span className="text-xs font-normal text-slate-400">({excusedCount} excused)</span>
              </p>
              <p className="text-xs text-slate-500">Non-attending</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Session Status</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-sm font-heading font-bold text-foreground">Roll Call Active</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedDate}</p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Meeting Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Class Unit:</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="All">All Classes</option>
                    {PATHFINDER_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="border-slate-200 text-xs font-semibold hover:bg-slate-50 hover:text-primary"
                >
                  ↓ Export Sheet (CSV)
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-8"
                >
                  Save Roll Call
                </Button>
              </div>
            </div>

            {/* Quick Batch Controls & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="max-w-xs w-full">
                <Input
                  placeholder="Filter by member name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Quick Batch:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll('Present')}
                  className="h-7 text-xs border-slate-200 hover:border-primary hover:text-primary"
                >
                  All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll('Absent')}
                  className="h-7 text-xs border-slate-200 hover:border-slate-400 text-slate-600"
                >
                  All Absent
                </Button>
              </div>
            </div>
          </div>

          {/* Member Attendance Roster Container */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* Mobile Roll Call Cards (screens < md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <div key={r.memberId} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-heading font-bold text-foreground text-sm leading-tight">
                          {r.name}
                        </p>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {r.memberId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700">
                          {r.className}
                        </Badge>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'Present'
                              ? 'bg-primary/10 text-primary'
                              : r.status === 'Absent'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-500/10 text-amber-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              r.status === 'Present'
                                ? 'bg-primary'
                                : r.status === 'Absent'
                                ? 'bg-slate-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {r.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-slate-200 p-1 bg-slate-100/70">
                      {(['Present', 'Absent', 'Excused'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setMemberStatus(r.memberId, st)}
                          className={`py-2 px-2 rounded-md text-xs font-bold transition-all text-center ${
                            r.status === st
                              ? st === 'Present'
                                ? 'bg-primary text-white shadow-xs'
                                : st === 'Absent'
                                ? 'bg-slate-700 text-white shadow-xs'
                                : 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-foreground hover:bg-white/60'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No pathfinders found matching the selected parameters.
                </div>
              )}
            </div>

            {/* Desktop Table View (screens >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Pathfinder Identity</th>
                    <th className="px-6 py-3.5">Progressive Rank</th>
                    <th className="px-6 py-3.5">Mark Attendance</th>
                    <th className="px-6 py-3.5 text-right">Recorded Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((r) => (
                      <tr key={r.memberId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-heading font-bold text-foreground text-sm leading-tight">
                            {r.name}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {r.memberId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700">
                            {r.className}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100/60">
                            {(['Present', 'Absent', 'Excused'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setMemberStatus(r.memberId, st)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                  r.status === st
                                    ? st === 'Present'
                                    ? 'bg-primary text-white'
                                    : st === 'Absent'
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-amber-600 text-white'
                                    : 'text-slate-600 hover:text-foreground'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                              r.status === 'Present'
                                ? 'bg-primary/10 text-primary'
                                : r.status === 'Absent'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-500/10 text-amber-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                r.status === 'Present'
                                  ? 'bg-primary'
                                  : r.status === 'Absent'
                                  ? 'bg-slate-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 text-xs">
                        No pathfinders found matching the selected parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>{filteredRecords.length} records in view</span>
              <span>Santasi AYM Attendance Verification</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Attendance;
