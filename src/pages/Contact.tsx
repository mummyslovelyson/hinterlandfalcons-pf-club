import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    MessageSquare,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: 'General Inquiry',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please complete all required fields');
            return;
        }

        setIsSubmitting(true);
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSubmitting(false);
        setSubmitted(true);
        toast.success('Thank you! Your message has been sent to our leadership council.');
    };

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white">
            <Header />

            <main className="flex-1">
                {/* Hero Header */}
                <section className="relative py-16 md:py-24 bg-slate-950 text-white overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center -z-10 opacity-25"
                        style={{ backgroundImage: "url('/church-portal-bg.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-[#102a24]/85 to-slate-950 -z-10" />

                    <div className="container relative z-10 px-4 max-w-5xl mx-auto text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-3 py-1 font-semibold uppercase tracking-wider mb-3">
                                Get In Touch With Falcons
                            </Badge>
                            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                                Contact & Fellowship Headquarters
                            </h1>
                            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-3 leading-relaxed">
                                Reach out to our club directorship, youth pastoral leadership, or regalia department. We are here to serve our community and youth.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Main Content Grid */}
                <section className="py-12 md:py-20 container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Contact Information Cards (Left 5 cols) */}
                        <div className="lg:col-span-5 space-y-6">
                            <div>
                                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                                    Our Sanctuary & Meeting Grounds
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Visit us during weekly drill sessions or contact our administrative Secretariat anytime.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Sanctuary Address Card */}
                                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-foreground text-sm">Meeting Location</h3>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                Santasi Seventh-day Adventist Church Grounds<br />
                                                Opposite Kumasi High School Road, Santasi, Kumasi, Ghana
                                            </p>
                                            <a
                                                href="https://maps.google.com/?q=Santasi+SDA+Church+Kumasi"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-2.5"
                                            >
                                                Open in Google Maps <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone & WhatsApp */}
                                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-foreground text-sm">Call & WhatsApp</h3>
                                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                                <p>Club Secretariat: <span className="font-semibold text-foreground">+233 (0)24 555 7890</span></p>
                                                <p>Pastoral Office: <span className="font-semibold text-foreground">+233 (0)24 412 3456</span></p>
                                            </div>
                                            <a
                                                href="https://wa.me/233245557890"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline mt-2.5"
                                            >
                                                Chat with us on WhatsApp <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Channels */}
                                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-foreground text-sm">Official Email Inquiries</h3>
                                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                                <p>General Secretariat: <span className="font-semibold text-foreground">santasi.pathfinders@gmail.com</span></p>
                                                <p>Registrations: <span className="font-semibold text-foreground">admissions@hinterlandfalcons.org</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gathering Times */}
                                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-foreground text-sm">Parade & Schedule</h3>
                                            <div className="text-xs text-muted-foreground mt-1 space-y-1.5">
                                                <p>
                                                    <strong className="text-foreground">Sunday Drill & Honors:</strong><br />
                                                    8:30 AM – 11:30 AM (Field Uniform)
                                                </p>
                                                <p>
                                                    <strong className="text-foreground">Sabbath AY Society:</strong><br />
                                                    4:00 PM – 6:00 PM (Full Dress Uniform)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Contact Form (Right 7 cols) */}
                        <div className="lg:col-span-7">
                            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-10 shadow-sm">
                                <div className="mb-6">
                                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        Send Our Leadership a Message
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Fill out the form below and our club directorship will reply within 24 hours.
                                    </p>
                                </div>

                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12 px-4 rounded-xl bg-emerald-50/70 border border-emerald-200"
                                    >
                                        <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-3" />
                                        <h3 className="font-heading text-xl font-bold text-emerald-950">Message Sent Successfully!</h3>
                                        <p className="text-sm text-emerald-800 max-w-md mx-auto mt-2 mb-6">
                                            Thank you, {formData.name}. We have received your inquiry and our club leadership will get in touch with you shortly.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSubmitted(false);
                                                setFormData({
                                                    name: '',
                                                    email: '',
                                                    phone: '',
                                                    category: 'General Inquiry',
                                                    subject: '',
                                                    message: '',
                                                });
                                            }}
                                            className="border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                                        >
                                            Send Another Message
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="name" className="text-xs font-semibold">
                                                    Your Full Name <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="name"
                                                    required
                                                    placeholder="Elder / Mr. / Ms. Kwabena Mensah"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="h-10 text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="email" className="text-xs font-semibold">
                                                    Email Address <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    placeholder="you@email.com"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="h-10 text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="phone" className="text-xs font-semibold">
                                                    Phone / WhatsApp Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="024 123 4567"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    className="h-10 text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold">
                                                    Inquiry Category
                                                </Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={v => setFormData({ ...formData, category: v })}
                                                >
                                                    <SelectTrigger className="h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="General Inquiry" className="text-xs">General Club Inquiry</SelectItem>
                                                        <SelectItem value="Membership & Application" className="text-xs">New Membership / Application</SelectItem>
                                                        <SelectItem value="Youth Ministry & AY" className="text-xs">Youth Ministry & AY Society</SelectItem>
                                                        <SelectItem value="Uniforms & Regalia" className="text-xs">Uniforms & Regalia Orders</SelectItem>
                                                        <SelectItem value="Pastoral Support" className="text-xs">Pastoral Counseling & Prayer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="subject" className="text-xs font-semibold">
                                                Subject
                                            </Label>
                                            <Input
                                                id="subject"
                                                placeholder="Brief summary of your question or message"
                                                value={formData.subject}
                                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                                className="h-10 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="message" className="text-xs font-semibold">
                                                Message Details <span className="text-destructive">*</span>
                                            </Label>
                                            <Textarea
                                                id="message"
                                                required
                                                rows={5}
                                                placeholder="Write your message, question, or request in detail..."
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                className="text-xs resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-11 shadow-xs"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {isSubmitting ? 'Sending Message...' : 'Submit Message to Directorship'}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
