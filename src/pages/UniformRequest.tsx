import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  FabricOrder,
  FABRIC_COLORS,
  GENDER_OPTIONS,
} from '@/types/uniform';
import { saveUniformRequest, generateUniformId } from '@/lib/uniforms';
import { getChurches, syncChurchesFromBackend } from '@/lib/churches';
import { MEMBERSHIP_CATEGORIES } from '@/types/registration';

const UniformRequestPage = () => {
  const navigate = useNavigate();

  // Churches loaded dynamically from backend API / MySQL
  const [districtChurches, setDistrictChurches] = useState<string[]>([]);

  useEffect(() => {
    syncChurchesFromBackend().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDistrictChurches([...data.map((c) => c.name), 'Other SDA Church']);
      }
    });
    const existing = getChurches();
    if (existing && existing.length > 0) {
      setDistrictChurches([...existing.map((c) => c.name), 'Other SDA Church']);
    }
  }, []);

  // Form state
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [selectedChurch, setSelectedChurch] = useState('');
  const [customChurch, setCustomChurch] = useState('');
  const [memberCategory, setMemberCategory] = useState('');
  const [gender, setGender] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fabric yards state — one entry per color
  const [fabricOrders, setFabricOrders] = useState<FabricOrder[]>(
    FABRIC_COLORS.map((c) => ({ colorId: c.id, colorLabel: c.label, yards: 0 }))
  );

  const updateYards = (colorId: string, yards: number) => {
    setFabricOrders((prev) =>
      prev.map((f) => (f.colorId === colorId ? { ...f, yards: Math.max(0, yards) } : f))
    );
  };

  const incrementYards = (colorId: string) => {
    setFabricOrders((prev) =>
      prev.map((f) => (f.colorId === colorId ? { ...f, yards: Math.round((f.yards + 0.5) * 10) / 10 } : f))
    );
  };

  const decrementYards = (colorId: string) => {
    setFabricOrders((prev) =>
      prev.map((f) => (f.colorId === colorId ? { ...f, yards: Math.max(0, Math.round((f.yards - 0.5) * 10) / 10) } : f))
    );
  };

  const totalYards = Math.round(fabricOrders.reduce((sum, f) => sum + f.yards, 0) * 10) / 10;
  const activeOrders = fabricOrders.filter((f) => f.yards > 0);

  const finalChurchName = selectedChurch === 'Other SDA Church' ? customChurch.trim() : selectedChurch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!memberName.trim()) {
      toast.error('Please enter applicant full name');
      return;
    }
    if (!memberPhone.trim()) {
      toast.error('Please provide a contact phone number');
      return;
    }
    if (!finalChurchName) {
      toast.error('Please select or enter your SDA church congregation');
      return;
    }
    if (!memberCategory) {
      toast.error('Please select your Pathfinder rank or category');
      return;
    }
    if (!gender) {
      toast.error('Please select gender for tailoring records');
      return;
    }
    if (totalYards <= 0) {
      toast.error('Please select at least 0.5 yards for one fabric color');
      return;
    }

    setIsSubmitting(true);

    try {
      const request = {
        id: generateUniformId(),
        memberName: memberName.trim(),
        memberPhone: memberPhone.trim(),
        memberChurch: finalChurchName,
        memberCategory,
        gender,
        fabrics: activeOrders,
        totalYards,
        specialNotes: specialNotes.trim(),
        status: 'pending' as const,
        submittedAt: new Date().toISOString(),
      };

      await saveUniformRequest(request, true);
      toast.success('Uniform material requisition submitted!');
      navigate('/uniform-request/success');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to submit uniform request. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="container max-w-3xl px-4 sm:px-6">
          {/* Header Banner */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              Request Uniform Fabric & Regalia
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Santasi AYM District supplies certified Pathfinder textile cuts (Class A White, Field Khaki, and Drill Green) directly for member tailoring.
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Section 1: Member Identification */}
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-white font-bold text-xs shadow-xs">
                  01
                </span>
                <div>
                  <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
                    Member Details & Station
                  </h2>
                  <p className="text-xs text-slate-500">Contact information for order dispatch and pickup</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="memberName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name *
                  </Label>
                  <Input
                    id="memberName"
                    placeholder="Enter member's full name"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="border-slate-300 h-10 bg-slate-50/50 focus:bg-white text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="memberPhone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number *
                  </Label>
                  <Input
                    id="memberPhone"
                    placeholder="e.g., 0244123456"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="border-slate-300 h-10 bg-slate-50/50 focus:bg-white text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="memberCategory" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Membership Category *
                  </Label>
                  <Select value={memberCategory} onValueChange={setMemberCategory}>
                    <SelectTrigger id="memberCategory" className="border-slate-300 h-10 bg-slate-50/50 focus:bg-white text-sm">
                      <SelectValue placeholder="Select Pathfinder rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBERSHIP_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="memberChurch" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Home Church *
                  </Label>
                  <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                    <SelectTrigger id="memberChurch" className="border-slate-300 h-10 bg-slate-50/50 focus:bg-white text-sm">
                      <SelectValue placeholder="Select home church unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtChurches.map((ch) => (
                        <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Gender *
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender" className="border-slate-300 h-10 bg-slate-50/50 focus:bg-white text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedChurch === 'Other SDA Church' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="customChurch" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Specify Other Church Name *
                    </Label>
                    <Input
                      id="customChurch"
                      placeholder="e.g., Bantama SDA or Tafo SDA"
                      value={customChurch}
                      onChange={(e) => setCustomChurch(e.target.value)}
                      className="border-slate-300 h-10 bg-slate-50/50 focus:bg-white text-sm"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Fabric Selection & Yardage Calculator */}
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-white font-bold text-xs shadow-xs">
                    02
                  </span>
                  <div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
                      Fabric Material & Yardage
                    </h2>
                    <p className="text-xs text-slate-500">Pick required lengths (0.5 yard increments)</p>
                  </div>
                </div>
                {totalYards > 0 && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 self-start sm:self-auto">
                    {totalYards} {totalYards === 1 ? 'yard' : 'yards'} selected
                  </Badge>
                )}
              </div>

              {/* Recommended Yardage Reference Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 mb-6 text-xs text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Tailoring Reference Guide:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block">Junior (10–12 yrs)</span>
                    <span>~1.5 - 2 yds top • ~1.5 yds bottom</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block">Teen (13–15 yrs)</span>
                    <span>~2 - 2.5 yds top • ~2 yds bottom</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block">Senior / Staff (16+)</span>
                    <span>~2.5 - 3 yds top • ~2.5 - 3 yds bottom</span>
                  </div>
                </div>
              </div>

              {/* Fabric Cards */}
              <div className="space-y-4">
                {FABRIC_COLORS.map((fabric) => {
                  const order = fabricOrders.find((f) => f.colorId === fabric.id);
                  const yards = order?.yards || 0;
                  const isActive = yards > 0;

                  const roleDescription =
                    fabric.id === 'white'
                      ? 'Class A Formal Uniform Top (Official shirt or blouse)'
                      : fabric.id === 'khaki'
                      ? 'Field Uniform Top (Drill, hike, and camporee shirt)'
                      : 'Uniform Bottom (Official trousers or skirt)';

                  return (
                    <div
                      key={fabric.id}
                      className={`rounded-xl border p-4 sm:p-5 transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Swatch & Label */}
                        <div className="flex items-center gap-3.5">
                          <div
                            className="h-12 w-12 rounded-xl border-2 shadow-2xs shrink-0 flex items-center justify-center font-bold text-xs"
                            style={{
                              backgroundColor: fabric.hex,
                              borderColor: fabric.border,
                              color: fabric.id === 'white' ? '#64748b' : '#ffffff',
                            }}
                          >
                            {fabric.label[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading font-bold text-slate-900 text-base">{fabric.label} Fabric</h3>
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {fabric.description}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{roleDescription}</p>
                          </div>
                        </div>

                        {/* Stepper Controls */}
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg border-slate-300 text-base font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                            onClick={() => decrementYards(fabric.id)}
                            disabled={yards <= 0}
                            aria-label={`Decrease ${fabric.label} yards`}
                          >
                            −
                          </Button>

                          <div className="text-center min-w-[64px]">
                            <span className="font-heading text-xl font-extrabold text-foreground">{yards}</span>
                            <span className="text-[11px] text-slate-500 block -mt-0.5">
                              {yards === 1 ? 'yard' : 'yards'}
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg border-slate-300 text-base font-bold text-slate-700 hover:bg-slate-100"
                            onClick={() => incrementYards(fabric.id)}
                            aria-label={`Increase ${fabric.label} yards`}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Quick Yard Select Buttons */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-400 mr-1">Quick pick:</span>
                        {[1, 1.5, 2, 2.5, 3, 3.5, 4, 5].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => updateYards(fabric.id, preset)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              yards === preset
                                ? 'bg-primary text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {preset} yd{preset !== 1 ? 's' : ''}
                          </button>
                        ))}
                        {yards > 0 && (
                          <button
                            type="button"
                            onClick={() => updateYards(fabric.id, 0)}
                            className="text-[11px] font-semibold text-destructive hover:underline ml-auto"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Special Notes */}
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-white font-bold text-xs shadow-xs">
                  03
                </span>
                <div>
                  <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
                    Additional Instructions (Optional)
                  </h2>
                  <p className="text-xs text-slate-500">Any special sizing, tailoring, or pickup instructions</p>
                </div>
              </div>
              <Textarea
                placeholder="e.g., Sizing notes, preferred pickup date at Santasi Central grounds, or tailor coordination notes..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="border-slate-300 min-h-[90px] bg-slate-50/50 focus:bg-white text-xs sm:text-sm"
              />
            </div>

            {/* Order Summary & Submit Button */}
            <div className="p-6 sm:p-8 bg-slate-50/60">
              {activeOrders.length > 0 && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Requisition Summary
                  </h3>
                  <div className="space-y-2">
                    {activeOrders.map((order) => (
                      <div key={order.colorId} className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-slate-100 last:border-0">
                        <span className="font-semibold text-slate-800">{order.colorLabel} Material</span>
                        <span className="font-mono font-bold text-slate-900">{order.yards} {order.yards === 1 ? 'yard' : 'yards'}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm sm:text-base font-bold text-slate-900">
                      <span>Total Allocation</span>
                      <span className="text-primary font-black">{totalYards} {totalYards === 1 ? 'yard' : 'yards'}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-13 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Submitting Requisition...' : 'Submit Uniform Fabric Request →'}
              </Button>
              <p className="text-center text-xs text-slate-500 mt-3">
                Material slips will be queued for the Santasi District Quartermaster upon submission.
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UniformRequestPage;
