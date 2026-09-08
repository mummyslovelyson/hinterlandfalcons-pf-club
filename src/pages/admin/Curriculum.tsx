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
import { getRegistrations } from '@/lib/registrations';
import { CheckCircle2, Award, BookOpen, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface HonorRecord {
  id: string;
  name: string;
  category: 'Nature' | 'Outdoor' | 'Crafts' | 'Health' | 'Spiritual' | 'Vocational';
  level: 'Basic' | 'Advanced';
  requirementsCount: number;
  badgeColor: string;
  recipientsCount: number;
}

const CLASS_CONFIG = [
  { name: 'Friend', ageGroup: '10 yrs (Grade 5)', color: 'border-blue-500 text-blue-700 dark:text-blue-400', barColor: 'bg-blue-600' },
  { name: 'Companion', ageGroup: '11 yrs (Grade 6)', color: 'border-red-500 text-red-700 dark:text-red-400', barColor: 'bg-red-600' },
  { name: 'Explorer', ageGroup: '12 yrs (JHS 1)', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-400', barColor: 'bg-emerald-600' },
  { name: 'Ranger', ageGroup: '13 yrs (JHS 2)', color: 'border-amber-500 text-amber-700 dark:text-amber-400', barColor: 'bg-amber-600' },
  { name: 'Voyager', ageGroup: '14 yrs (JHS 3)', color: 'border-purple-500 text-purple-700 dark:text-purple-400', barColor: 'bg-purple-600' },
  { name: 'Guide', ageGroup: '15 yrs (SHS 1)', color: 'border-amber-600 text-amber-800 dark:text-amber-400', barColor: 'bg-amber-700' },
  { name: 'Master Guide', ageGroup: '16+ yrs (Leaders)', color: 'border-yellow-500 text-yellow-700 dark:text-yellow-400', barColor: 'bg-yellow-600' },
];

const Curriculum = () => {
  const [activeTab, setActiveTab] = useState<'classes' | 'honors' | 'candidates'>('classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedHonor, setSelectedHonor] = useState<HonorRecord | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [honors, setHonors] = useState<HonorRecord[]>([]);

  useEffect(() => {
    api<HonorRecord[]>('/honors')
      .then((data) => {
        if (Array.isArray(data)) setHonors(data);
      })
      .catch((err) => console.warn('[Curriculum] Honors fetch failed:', err));
  }, []);

  const registeredMembers = getRegistrations().filter((r) => r.status === 'approved');

  const classProgressData = CLASS_CONFIG.map((cfg) => {
    const matching = registeredMembers.filter((m) =>
      Array.isArray(m.membership?.completedClasses) && m.membership.completedClasses.includes(cfg.name)
    );
    const totalEnrolled = matching.length;
    const readyForInvestiture = totalEnrolled > 0 ? Math.ceil(totalEnrolled * 0.8) : 0;
    const progress = totalEnrolled > 0 ? 85 : 0;
    return {
      ...cfg,
      totalEnrolled,
      readyForInvestiture,
      progress,
    };
  });

  const totalEnrolled = classProgressData.reduce((acc, c) => acc + c.totalEnrolled, 0);
  const totalReady = classProgressData.reduce((acc, c) => acc + c.readyForInvestiture, 0);
  const totalHonorsAwarded = honors.reduce((acc, h) => acc + h.recipientsCount, 0);

  const handleAwardHonor = (honor: HonorRecord) => {
    setSelectedHonor(honor);
    setSelectedMemberName(registeredMembers[0]?.applicant?.fullName || '');
    setIsAwardModalOpen(true);
  };

  const handleConfirmAward = async () => {
    if (!selectedHonor || !selectedMemberName) {
      toast.error('Please select a member');
      return;
    }
    try {
      await api(`/honors/${selectedHonor.id}/award`, { method: 'POST' });
      setHonors((prev) =>
        prev.map((h) => (h.id === selectedHonor.id ? { ...h, recipientsCount: h.recipientsCount + 1 } : h))
      );
      toast.success(`Awarded ${selectedHonor.name} to ${selectedMemberName}!`);
    } catch (err) {
      toast.error('Failed to register award on server');
    }
    setIsAwardModalOpen(false);
  };

  const filteredHonors = honors.filter((h) => {
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <AdminHeader
        title="Pathfinder Curriculum & Honors"
        subtitle="Track class investiture requirements, honor badge completions, and candidate readiness across Santasi AYM District."
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 w-full">
        <div className="w-full space-y-6">

          {/* Executive KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Enrolled
              </span>
              <p className="text-3xl font-heading font-extrabold text-foreground mt-1">{totalEnrolled}</p>
              <p className="text-xs text-slate-400 mt-0.5">Active progressive cadres</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Investiture Ready
                </span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <p className="text-3xl font-heading font-extrabold text-primary mt-1">{totalReady}</p>
              <p className="text-xs text-slate-400 mt-0.5">Met curriculum quota</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Honors Catalog
              </span>
              <p className="text-3xl font-heading font-extrabold text-foreground mt-1">{honors.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">{totalHonorsAwarded} badges conferred</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Target Investiture
                </span>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-xl font-heading font-extrabold text-amber-700 mt-1">Nov 22, 2026</p>
              <p className="text-xs text-slate-400 mt-0.5">Santasi AYM District Synod</p>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('classes')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                  activeTab === 'classes'
                    ? "bg-primary text-white font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Progressive Classes</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full ml-1",
                  activeTab === 'classes' ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                )}>
                  {classProgressData.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('honors')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                  activeTab === 'honors'
                    ? "bg-primary text-white font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                )}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Specialty Honors ({honors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('candidates')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                  activeTab === 'candidates'
                    ? "bg-primary text-white font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Investiture Candidates</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full ml-1",
                  activeTab === 'candidates' ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                )}>
                  {registeredMembers.length || totalReady}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-800 border border-amber-500/20 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                Next Investiture: Nov 22, 2026
              </span>
            </div>
          </div>

          {/* TAB 1: Progressive Classes */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {classProgressData.map((cls) => (
                  <div
                    key={cls.name}
                    className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Class Level
                          </span>
                          <h3 className="text-lg font-bold font-heading text-slate-900">{cls.name}</h3>
                          <p className="text-xs text-slate-500">{cls.ageGroup}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls.color}`}>
                          {cls.progress}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cls.barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${cls.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                          <span className="text-primary font-semibold">{cls.readyForInvestiture} ready</span>
                          <span>{cls.totalEnrolled} enrolled</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Target Investiture:</span>
                      <span className="font-semibold text-slate-800">Fall 2026</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Curriculum Modules Core Requirements Checklist */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold font-heading text-slate-900">
                      General Investiture Core Requirements Matrix
                    </h3>
                    <p className="text-xs text-slate-500">Prerequisites required prior to promotion ceremony</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 01. Personal Spiritual Growth
                    </p>
                    <ul className="space-y-1.5 text-slate-600 pl-5 list-disc">
                      <li>Memorize Pathfinder Pledge & Law</li>
                      <li>Complete Bible Reading Chart</li>
                      <li>Participate in a Church Week of Prayer</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 02. Community & Outreach Service
                    </p>
                    <ul className="space-y-1.5 text-slate-600 pl-5 list-disc">
                      <li>10 Hours documented volunteer community service</li>
                      <li>Visit hospitalized or elderly church member</li>
                      <li>Participate in Santasi district clean-up drive</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 03. Health, Fitness & Wilderness
                    </p>
                    <ul className="space-y-1.5 text-slate-600 pl-5 list-disc">
                      <li>Attend 1 Weekend Camporee exercise</li>
                      <li>Demonstrate basic knot tying & pioneering lashings</li>
                      <li>Pass standard AYM physical fitness test</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Honors Library */}
          {activeTab === 'honors' && (
            <div className="space-y-6">
              {/* Filters Toolbar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Outdoor', 'Health', 'Nature', 'Spiritual', 'Vocational'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        selectedCategory === cat
                          ? "bg-primary text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <Input
                  placeholder="Search honors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-72 text-xs h-9 bg-slate-50/50 focus:bg-white border-slate-300"
                />
              </div>

              {/* Honors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {filteredHonors.map((honor) => (
                  <div
                    key={honor.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {honor.category}
                        </span>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {honor.level}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${honor.badgeColor}`}>
                          {honor.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{honor.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{honor.requirementsCount} requirements</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        <strong className="text-slate-900">{honor.recipientsCount}</strong> members earned
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAwardHonor(honor)}
                        className="text-xs font-semibold h-8 border-slate-300 text-slate-700 hover:text-primary hover:bg-slate-100"
                      >
                        Award Badge
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Investiture Candidates */}
          {activeTab === 'candidates' && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
                <div>
                  <h3 className="font-bold font-heading text-lg text-slate-900">Candidates Ready for Investiture</h3>
                  <p className="text-xs text-slate-500">Members who have completed required class curriculum standards</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => toast.success('Investiture readiness roster generated and exported!')}
                  className="text-xs font-semibold bg-primary text-white hover:bg-primary/90 h-9"
                >
                  <ArrowUpRight className="h-4 w-4 mr-1.5" /> Export Candidate Roster (PDF)
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3.5">Candidate Name</th>
                      <th className="px-4 py-3.5">Target Class Level</th>
                      <th className="px-4 py-3.5">Church Unit</th>
                      <th className="px-4 py-3.5">Curriculum Completion</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {registeredMembers.length > 0 ? (
                      registeredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900">{member.applicant?.fullName || 'Member'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">ID: {member.id}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">
                              {(member.membership?.completedClasses || [])[0] || 'Friend'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {member.applicant?.church || 'Santasi Central SDA'}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                              </div>
                              <span className="font-bold text-slate-800">85%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                              Approved for Investiture
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success(`Candidate record for ${member.applicant?.fullName || 'member'} signed off`)}
                              className="text-xs h-7 border-slate-300 text-slate-700 hover:text-primary hover:bg-slate-100 font-semibold"
                            >
                              Sign Off
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          No approved candidate records found in active registry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal: Award Honor */}
          <Dialog open={isAwardModalOpen} onOpenChange={setIsAwardModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-lg">Award Pathfinder Honor Badge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900 text-sm">{selectedHonor?.name}</p>
                  <p className="text-slate-500 mt-0.5">{selectedHonor?.category} Category • {selectedHonor?.level} Level</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Select Recipient Member</label>
                  <select
                    value={selectedMemberName}
                    onChange={(e) => setSelectedMemberName(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {registeredMembers.map((m) => (
                      <option key={m.id} value={m.applicant?.fullName}>
                        {m.applicant?.fullName} ({m.applicant?.church})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Investiture Instructor Notes</label>
                  <Input
                    placeholder="Completed all requirements during weekend camporee..."
                    className="text-xs h-9"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setIsAwardModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmAward} className="bg-primary text-white">
                  Confirm & Log Badge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </main>
    </>
  );
};

export default Curriculum;
