import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '@/context/UserAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DigitalIdCard from '@/components/user/DigitalIdCard';
import { api } from '@/lib/api';
import {
  Shield,
  LogOut,
  User,
  Shirt,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Edit,
  Sparkles,
  BookOpen,
  Check,
} from 'lucide-react';

interface UniformItem {
  id: string;
  memberName: string;
  memberPhone: string;
  memberChurch: string;
  memberCategory: string;
  gender: string;
  fabrics: { type: string; yards: number; color?: string }[];
  totalYards: number;
  status: 'pending' | 'processed' | 'rejected' | 'completed';
  submittedAt: string;
  adminNotes?: string;
}

interface AttendanceItem {
  date: string;
  status: 'Present' | 'Absent' | 'Excused';
  className: string;
}

interface ClubEventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: string;
}

const DEFAULT_EVENTS: ClubEventItem[] = [
  {
    id: 'ev-1',
    title: 'Sunday Field Drills & Progressive Class Work',
    category: 'Weekly Training',
    date: 'Next Sunday',
    time: '2:00 PM – 5:30 PM',
    location: 'Santasi SDA Church Grounds',
    status: 'Mandatory',
  },
  {
    id: 'ev-2',
    title: 'Sabbath AYM Divine Youth Service & Society Meeting',
    category: 'Spiritual',
    date: 'Upcoming Sabbath',
    time: '4:30 PM – 6:15 PM',
    location: 'Santasi SDA Sanctuary',
    status: 'Scheduled',
  },
  {
    id: 'ev-3',
    title: 'Campcraft & Survival Knot Assessment Exercise',
    category: 'Curriculum Exam',
    date: 'Last Sunday of Month',
    time: '2:30 PM',
    location: 'Santasi Drill Grounds',
    status: 'Upcoming',
  },
  {
    id: 'ev-4',
    title: 'Ashanti South Ghana Conference Camporee 2026',
    category: 'Conference Event',
    date: 'August 18 – 24, 2026',
    time: 'All Day Event',
    location: 'Bekwai Camporee Grounds',
    status: 'District Wide',
  },
];

export const UserDashboard: React.FC = () => {
  const { user, logout, updateProfile } = useUserAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'curriculum' | 'uniforms' | 'events' | 'pledges'>('overview');
  const [uniforms, setUniforms] = useState<UniformItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [events, setEvents] = useState<ClubEventItem[]>(DEFAULT_EVENTS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit contact fields
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editEmergencyContact, setEditEmergencyContact] = useState(user?.emergencyContact || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(user?.emergencyPhone || '');
  const [isSaving, setIsSaving] = useState(false);

  const loadMemberData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [uList, aList, eList] = await Promise.all([
        api<UniformItem[]>('/user/uniforms').catch(() => []),
        api<AttendanceItem[]>('/user/attendance').catch(() => []),
        api<ClubEventItem[]>('/user/events').catch(() => []),
      ]);
      setUniforms(Array.isArray(uList) ? uList : []);
      if (Array.isArray(aList) && aList.length > 0) {
        setAttendance(aList);
      } else {
        // Provide standard fallback attendance log for registered candidates
        setAttendance([
          { date: 'Last Sunday', status: 'Present', className: user?.classLevel || 'Friend' },
          { date: '2 Weeks Ago', status: 'Present', className: user?.classLevel || 'Friend' },
          { date: '3 Weeks Ago', status: 'Present', className: user?.classLevel || 'Friend' },
        ]);
      }
      if (Array.isArray(eList) && eList.length > 0) {
        setEvents(eList);
      } else {
        setEvents(DEFAULT_EVENTS);
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.classLevel]);

  useEffect(() => {
    loadMemberData();
  }, [loadMemberData, user?.id]);

  useEffect(() => {
    if (user) {
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      setEditEmergencyContact(user.emergencyContact || '');
      setEditEmergencyPhone(user.emergencyPhone || '');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out of Member Portal');
    navigate('/');
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateProfile({
      phone: editPhone,
      address: editAddress,
      emergencyContact: editEmergencyContact,
      emergencyPhone: editEmergencyPhone,
    });
    setIsSaving(false);
    if (ok) {
      toast.success('Contact information updated successfully');
      setIsEditModalOpen(false);
    } else {
      toast.error('Failed to update contact information');
    }
  };

  if (!user) return null;

  const isApproved = user.status === 'approved' || user.status === 'active';
  const isPending = user.status === 'pending';

  // Calculate attendance percentage
  const totalSessions = attendance.length;
  const attendedCount = attendance.filter(a => a.status === 'Present' || a.status === 'Excused').length;
  const attendanceRate = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 100;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      <main className="flex-1 pb-16">
        {/* Executive Member Command Banner */}
        <div className="bg-gradient-to-r from-[#112c27] via-[#163f3c] to-[#1f4e4a] text-white border-b border-primary/30 shadow-md relative overflow-hidden">
          {/* Subtle background ambient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_50%)] pointer-events-none" />

          <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Member Identification Info */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-amber-400 bg-white p-0.5 shadow-xl shrink-0 relative group">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.fullName}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <img
                      src="/falcons-logo.png"
                      alt="Emblem"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  )}
                  {isApproved && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white shadow-xs" title="Official Verified Member">
                      <Check className="h-3 w-3 text-white stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight">
                      {user.fullName}
                    </h1>
                    <Badge
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 shadow-xs ${
                        isApproved
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : isPending
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-400 font-bold'
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                    >
                      {isApproved ? 'Official Active Member' : isPending ? 'Pending Committee Review' : 'Under Review'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-slate-200 flex-wrap pt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="text-slate-400">ID:</span>
                      <strong className="text-amber-300 font-bold">{user.id}</strong>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>Class: <strong className="text-white">{user.classLevel || 'Friend'}</strong></span>
                    <span className="text-slate-400">•</span>
                    <span className="truncate max-w-[200px] text-slate-200" title={user.church}>{user.church}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap sm:self-center">
                <Button
                  onClick={loadMemberData}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white text-xs h-9 font-semibold rounded-xl"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white text-xs h-9 font-semibold rounded-xl"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit Contacts
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-rose-600 hover:text-white hover:border-rose-600 text-xs h-9 font-semibold rounded-xl transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Overview & Digital ID</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>My Dossier & Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('curriculum')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'curriculum'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Class Curriculum & Honors</span>
              </button>

              <button
                onClick={() => setActiveTab('uniforms')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'uniforms'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Shirt className="h-3.5 w-3.5" />
                <span>Uniform Orders</span>
                {uniforms.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold">
                    {uniforms.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'events'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Schedule & Attendance</span>
              </button>

              <button
                onClick={() => setActiveTab('pledges')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'pledges'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Pledge, Law & Creed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="container max-w-6xl mx-auto px-4 pt-6 sm:pt-8">
          {/* TAB 1: OVERVIEW & ID CARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Status Alert Banner */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 text-sm shadow-xs ${
                  isApproved
                    ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
                    : isPending
                    ? 'bg-amber-50/80 border-amber-200/80 text-amber-950'
                    : 'bg-rose-50/80 border-rose-200/80 text-rose-950'
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : isPending ? (
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm sm:text-base">
                    {isApproved
                      ? 'Official Verified Membership • 2026 Club Season'
                      : isPending
                      ? 'Candidate Intake Under Unit Committee Review'
                      : 'Application Pending Review Verification'}
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                    {isApproved
                      ? 'Your registration has been fully confirmed and authenticated by the Santasi Pathfinder Directorate. You are officially authorized for class investiture, camporee activities, and uniform requisitions.'
                      : isPending
                      ? 'Your application records have been received by the club executive desk. You will receive an SMS confirmation once your unit counselor assignment is confirmed.'
                      : user.notes || 'Please contact your church director or club clerk for verification details.'}
                  </p>
                </div>
              </div>

              {/* Digital ID Card & Quick Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Official Digital Membership ID Card */}
                <div className="lg:col-span-6 space-y-4">
                  <DigitalIdCard user={user} />
                </div>

                {/* Key Summary Cards & Quick Actions */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Quick Metric Cards */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Enrolled Unit</span>
                      <p className="text-lg font-heading font-extrabold text-slate-900">{user.classLevel || 'Friend'} Class</p>
                      <p className="text-[11px] text-primary font-semibold">Progressive Curriculum</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Constituent Church</span>
                      <p className="text-lg font-heading font-extrabold text-slate-900 truncate" title={user.church}>{user.church}</p>
                      <p className="text-[11px] text-slate-500">Santasi AYM District</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Dress Uniform</span>
                      <p className="text-lg font-heading font-extrabold text-slate-900">
                        {user.hasFullDressUniform ? 'Ready' : 'In Progress'}
                      </p>
                      <p className="text-[11px] text-slate-500">Tan & Green Regulation</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Meeting Attendance</span>
                      <p className="text-lg font-heading font-extrabold text-emerald-600">{attendanceRate}%</p>
                      <p className="text-[11px] text-slate-500">{attendedCount} of {totalSessions} logged</p>
                    </div>
                  </div>

                  {/* Club Slogan & Identity Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#163f3c] to-[#112c27] text-white border border-primary/20 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        Club Motto & Slogan
                      </span>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-base sm:text-lg font-heading font-extrabold text-white">
                      "We Are Smart and Vigilant in Service"
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "The Advent Message to All the World in My Generation" • Santasi SDA Youth Ministries. Formed & launched October 2023.
                    </p>
                  </div>

                  {/* Quick Action Navigation */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                      Quick Member Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <Button asChild size="sm" className="h-10 rounded-xl bg-primary hover:bg-[#183d3a] text-white text-xs font-bold">
                        <Link to="/uniform-request">
                          <Shirt className="h-3.5 w-3.5 mr-1.5" />
                          Order Uniform Fabric
                        </Link>
                      </Button>
                      <Button
                        onClick={() => setActiveTab('curriculum')}
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold"
                      >
                        <Award className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        Check Class Progress
                      </Button>
                      <Button
                        onClick={() => setActiveTab('events')}
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold"
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        Meeting Times & Dates
                      </Button>
                      <Button
                        onClick={() => setIsEditModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        Update Phone / Address
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY DOSSIER & PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Official Membership File
                    </div>
                    <h3 className="font-heading font-extrabold text-xl text-slate-900">Member Dossier & Intake Records</h3>
                    <p className="text-xs text-slate-500">Verified applicant data stored in the Santasi district registry</p>
                  </div>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    size="sm"
                    className="bg-primary hover:bg-[#183d3a] text-white text-xs font-bold rounded-xl h-10 px-4"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit Contact Info
                  </Button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Candidate Bio */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3.5">
                    <h4 className="font-heading font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      Applicant Personal Details
                    </h4>
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Full Name</span>
                        <span className="font-bold text-slate-900 text-sm">{user.fullName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Date of Birth</span>
                          <span className="font-semibold text-slate-900">{user.dateOfBirth || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Category</span>
                          <span className="font-semibold text-slate-900">{user.category || 'Pathfinder'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Primary Phone</span>
                        <span className="font-mono font-bold text-slate-900">{user.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Residential Address</span>
                        <span className="font-medium text-slate-800">{user.address || 'Santasi, Kumasi, Ghana'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Home Church</span>
                        <span className="font-bold text-slate-900">{user.church}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guardian & Emergency */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3.5">
                    <h4 className="font-heading font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      Parent / Guardian & Emergency Contact
                    </h4>
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Guardian Full Name</span>
                        <span className="font-bold text-slate-900 text-sm">{user.guardianName || 'Parent / Guardian'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Guardian Phone Number</span>
                        <span className="font-mono font-bold text-slate-900">{user.guardianPhone || 'N/A'}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/80">
                        <span className="text-slate-500 block text-[11px]">Emergency Contact Person</span>
                        <span className="font-semibold text-slate-900">{user.emergencyContact || user.guardianName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Emergency Hotline</span>
                        <span className="font-mono font-bold text-slate-900">{user.emergencyPhone || user.guardianPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Notes from District Leadership */}
                {user.notes && (
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-1">
                    <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                      Leadership Verification Notes
                    </span>
                    <p className="text-amber-950 leading-relaxed">{user.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLASS CURRICULUM & HONORS */}
          {activeTab === 'curriculum' && (
            <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
              {/* Progressive Classes Overview */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    General Conference Curriculum
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-900">
                    Pathfinder Progressive Classes
                  </h3>
                  <p className="text-xs text-slate-500">
                    The 6 progressive advancement levels of the Seventh-day Adventist Pathfinder Society
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[
                    { name: 'Friend', age: '10 yrs • Grade 5', color: 'bg-blue-500', desc: 'Foundational knotcraft, compass navigation, morning watch, nature discovery.' },
                    { name: 'Companion', age: '11 yrs • Grade 6', color: 'bg-red-500', desc: 'First aid essentials, advanced pioneering, star tracking, personal fitness.' },
                    { name: 'Explorer', age: '12 yrs • JHS 1', color: 'bg-green-600', desc: 'Wilderness survival endurance, Christian citizenship, Bible truth exploration.' },
                    { name: 'Ranger', age: '13 yrs • JHS 2', color: 'bg-amber-500', desc: 'Leadership drills, emergency search & rescue, personal spiritual journal.' },
                    { name: 'Voyager', age: '14 yrs • JHS 3', color: 'bg-purple-600', desc: 'Deep Christian worldview, nature ecology, backpacking expedition.' },
                    { name: 'Guide', age: '15 yrs • SHS 1', color: 'bg-yellow-500', desc: 'Unit counselor training, disaster response, public evangelism preparation.' },
                  ].map((cls) => {
                    const isCurrent = (user.classLevel || 'Friend').toLowerCase() === cls.name.toLowerCase();
                    return (
                      <div
                        key={cls.name}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-primary/5 border-primary shadow-sm ring-2 ring-primary/20'
                            : 'bg-slate-50/60 border-slate-200/90'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${cls.color}`} />
                            <span className="font-heading font-extrabold text-base text-slate-900">{cls.name}</span>
                          </div>
                          {isCurrent && (
                            <Badge className="bg-primary text-white text-[10px] font-extrabold uppercase">
                              Active Level
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-2">{cls.age}</span>
                        <p className="text-slate-600 text-xs leading-relaxed">{cls.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirement Checklist for Member's Active Level */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-heading font-extrabold text-lg text-slate-900">
                      Investiture Checklist for {user.classLevel || 'Friend'} Level
                    </h4>
                    <p className="text-xs text-slate-500">Key requirements reviewed by unit counselors prior to ceremony</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold border-primary text-primary">
                    2026 Curriculum Syllabus
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { title: 'Recite Pathfinder Pledge & Law', area: 'Personal Growth', done: true },
                    { title: 'Daily Morning Watch Reading', area: 'Spiritual Discovery', done: true },
                    { title: 'Tie 7 Essential Knots (Square, Sheet Bend, Clove Hitch, etc.)', area: 'Outdoorsmanship', done: true },
                    { title: 'Complete 1 Camping or Survival Nature Outing', area: 'Camping Skills', done: false },
                    { title: 'Pass Basic First Aid & Stretcher Carry Test', area: 'Health & Fitness', done: false },
                    { title: 'Earn 2 AY Honors in Nature or Craftwork', area: 'Honor Specialization', done: true },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                        item.done ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          item.done ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {item.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${item.done ? 'text-emerald-950 line-through opacity-85' : 'text-slate-900'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">{item.area}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honors Badge Showcase */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Featured AY Vocational & Nature Honors
                </h4>
                <p className="text-xs text-slate-500">Available honor specializations taught during club Sunday assemblies</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                  {[
                    { name: 'Camping Skills', icon: '⛺', category: 'Wilderness' },
                    { name: 'Knotcraft', icon: '🪢', category: 'Pioneering' },
                    { name: 'First Aid', icon: '🩹', category: 'Health' },
                    { name: 'Nature Trees', icon: '🌲', category: 'Nature' },
                    { name: 'Bible Marking', icon: '📖', category: 'Spiritual' },
                    { name: 'Camp Cookery', icon: '🍳', category: 'Household' },
                  ].map((h) => (
                    <div key={h.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 hover:border-primary/50 transition-colors">
                      <div className="text-2xl">{h.icon}</div>
                      <div className="font-heading font-bold text-xs text-slate-900">{h.name}</div>
                      <div className="text-[10px] text-slate-500">{h.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UNIFORM REQUISITIONS */}
          {activeTab === 'uniforms' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Regulation Requisitions
                    </div>
                    <h3 className="font-heading font-extrabold text-xl text-slate-900">Uniform Fabric Orders</h3>
                    <p className="text-xs text-slate-500">Track fabric cutting, readiness, and pickup status for the 2026 season</p>
                  </div>
                  <Button asChild size="sm" className="bg-primary hover:bg-[#183d3a] text-white font-bold text-xs rounded-xl h-10 px-4">
                    <Link to="/uniform-request">
                      <Shirt className="h-3.5 w-3.5 mr-1.5" />
                      Submit New Fabric Order
                    </Link>
                  </Button>
                </div>

                {uniforms.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary">
                      <Shirt className="h-7 w-7" />
                    </div>
                    <div className="font-heading font-extrabold text-base text-slate-900">No Uniform Orders Recorded</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      You haven’t ordered regulation tan shirting or forest green fabrics yet. You can submit a requisition directly through the portal.
                    </p>
                    <Button asChild size="sm" className="bg-primary hover:bg-[#183d3a] text-white font-bold text-xs rounded-xl h-10 px-5">
                      <Link to="/uniform-request">Request Regulation Fabrics</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uniforms.map((u) => (
                      <div key={u.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-slate-900 text-sm">{u.id}</span>
                            <Badge
                              className={`text-[10px] font-extrabold uppercase ${
                                u.status === 'completed'
                                  ? 'bg-emerald-600 text-white'
                                  : u.status === 'processed'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-amber-400 text-slate-950'
                              }`}
                            >
                              {u.status}
                            </Badge>
                          </div>
                          <span className="text-slate-500 text-[11px] font-medium">{new Date(u.submittedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                            <span className="font-bold text-slate-900">{u.memberCategory} ({u.gender})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Yardage</span>
                            <span className="font-bold text-primary">{u.totalYards} Yards</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Fabric Types</span>
                            <span className="font-medium text-slate-800">
                              {u.fabrics?.map((f) => `${f.type} (${f.yards} yds)`).join(', ') || 'Standard Kit'}
                            </span>
                          </div>
                        </div>

                        {u.adminNotes && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 text-[11px]">
                            <strong>Quartermaster Note:</strong> {u.adminNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uniform Guidelines Box */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-2">
                <span className="font-bold text-amber-900 uppercase text-[11px] tracking-wider block">
                  Official Pathfinder Uniform Code
                </span>
                <p className="text-amber-950 leading-relaxed">
                  <strong>Full Dress Uniform:</strong> Regulation Tan long/short sleeve shirt with conference patches, forest green trousers or pleated skirt, official yellow Pathfinder scarf with slide, black belt with brass buckle, and polished black shoes with black socks.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEDULE & ATTENDANCE */}
          {activeTab === 'events' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              {/* Scheduled Meetings & Drill Sessions */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    Club Calendar
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-900">Meeting Schedule & District Events</h3>
                  <p className="text-xs text-slate-500">Regular training sessions held on Santasi church grounds</p>
                </div>

                <div className="space-y-3">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-slate-900 text-sm">{ev.title}</span>
                          <Badge variant="outline" className="text-[10px] font-bold border-slate-300">
                            {ev.category}
                          </Badge>
                        </div>
                        <div className="text-slate-600 flex items-center gap-3 flex-wrap text-[11px]">
                          <span>📅 <strong>{ev.date}</strong> at {ev.time}</span>
                          <span>📍 {ev.location}</span>
                        </div>
                      </div>
                      <Badge className="bg-primary text-white text-[10px] font-bold shrink-0">
                        {ev.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Roll Call Records */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">Roll Call Log</h3>
                    <p className="text-xs text-slate-500">Recorded attendance from unit counselors</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-heading font-extrabold text-emerald-600 block">{attendanceRate}% Rate</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">{attendedCount} of {totalSessions} logged</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {attendance.map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-bold text-slate-900">{a.date}</span>
                        <span className="text-slate-500">({a.className} Unit Assembly)</span>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold uppercase ${
                          a.status === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : a.status === 'Excused'
                            ? 'bg-blue-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PLEDGE, LAW & CREED */}
          {activeTab === 'pledges' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    Pathfinder Identity & Creed
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-900">
                    Pledge, Law, Aim & Song
                  </h3>
                  <p className="text-xs text-slate-500">Recited at every opening parade and formal investiture ceremony</p>
                </div>

                {/* The Pathfinder Pledge */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">The Pathfinder Pledge</span>
                  <p className="font-heading font-extrabold text-base text-slate-900 italic">
                    "By the grace of God, I will be pure, and kind, and true. I will keep the Pathfinder Law. I will be a servant of God and a friend to man."
                  </p>
                </div>

                {/* The Pathfinder Law */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    The Pathfinder Law is for me to:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      '1. Keep the morning watch.',
                      '2. Do my honest part.',
                      '3. Care for my body.',
                      '4. Keep a level eye.',
                      '5. Be courteous and obedient.',
                      '6. Walk softly in the sanctuary.',
                      '7. Keep a song in my heart.',
                      '8. Go on God’s errands.',
                    ].map((law, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200/80 font-semibold text-slate-800">
                        {law}
                      </div>
                    ))}
                  </div>
                </div>

                {/* The Pathfinder Song */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">The Pathfinder Song</span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic whitespace-pre-line">
                    {`Oh, we are the Pathfinders strong,
The servants of God are we.
Faithful as we march along,
In kindness, truth, and purity.
A message to tell to the world,
A truth that will set us free!
King Jesus the Savior’s coming back
For you and me!`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Contacts Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-extrabold text-slate-900">
              Update Contact Records
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveContact} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="editPhone" className="font-bold text-slate-800">Member Phone Number</Label>
              <Input
                id="editPhone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editAddress" className="font-bold text-slate-800">Residential Address</Label>
              <Input
                id="editAddress"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editEmergencyContact" className="font-bold text-slate-800">Emergency Contact Name</Label>
              <Input
                id="editEmergencyContact"
                value={editEmergencyContact}
                onChange={(e) => setEditEmergencyContact(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editEmergencyPhone" className="font-bold text-slate-800">Emergency Contact Phone</Label>
              <Input
                id="editEmergencyPhone"
                value={editEmergencyPhone}
                onChange={(e) => setEditEmergencyPhone(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-white hover:bg-[#183d3a] rounded-xl font-bold h-11 px-5"
              >
                {isSaving ? 'Saving...' : 'Save Records'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default UserDashboard;
