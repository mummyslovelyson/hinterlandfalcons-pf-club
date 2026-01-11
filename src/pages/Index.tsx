import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Compass,
  Users,
  Award,
  TreePine,
  Heart,
  ArrowRight,
  Star,
  Map,
  Calendar,
  Tent,
  Flame,
  Quote
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF9]">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Organic Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
          {/* Background Texture */}
          <div className="absolute inset-0 z-0 bg-[#F5F5F0]">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            {/* Organic Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Registration Open 2024</span>
                </div>

                <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tight">
                  Adventures <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary/80">
                    Await You.
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Join the Santasi SDA Pathfinder Club — discovering potential through nature, service, and faith.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild size="xl" className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105">
                    <Link to="/register">
                      <span className="mr-2 text-lg">Start Your Journey</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="xl" className="h-14 px-8 rounded-2xl border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-foreground transition-all">
                    <a href="#explore">Explore Programs</a>
                  </Button>
                </div>

                <div className="flex items-center gap-4 pt-8 text-sm text-muted-foreground">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <p>Join <span className="font-bold text-foreground">2,000+</span> pathfinders worldwide</p>
                </div>
              </div>

              <div className="relative hidden lg:block h-[600px]">
                <div className="absolute right-0 top-0 w-[90%] h-full bg-cover bg-center rounded-[3rem] shadow-2xl rotate-3" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80")' }} />
                <div className="absolute left-0 bottom-12 w-[60%] h-[40%] bg-cover bg-center rounded-[2rem] shadow-xl -rotate-3 border-4 border-white" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80")' }} />

                {/* Floating Badge */}
                <div className="absolute top-20 left-10 bg-white p-4 rounded-2xl shadow-xl rotate-[-6deg] animate-float">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/20 rounded-xl">
                      <Compass className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Next Event</p>
                      <p className="font-bold">Summer Camp '24</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organic Divider */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[100px] w-full fill-white">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>

        {/* Bento Grid Features - "Beyond the Club" */}
        <section id="explore" className="py-24 bg-white">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">More Than Just a Club</h2>
                <p className="text-lg text-muted-foreground">It's a lifestyle. Discover how the Pathfinder experience shapes character and builds lifelong friendships.</p>
              </div>
              <Button variant="link" className="text-primary font-semibold text-lg group">
                View All Activities <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
              {/* Large Feature */}
              <Card className="md:col-span-2 md:row-span-2 group overflow-hidden relative border-none shadow-none bg-[#F3F4F6] rounded-[2rem]">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80")' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <div className="mb-4 p-3 bg-white/20 backdrop-blur-md w-fit rounded-xl">
                    <Tent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-2">Outdoor Survival</h3>
                  <p className="text-white/80 max-w-sm">Master the art of camping, knot-tying, and wilderness survival in our signature field events.</p>
                </div>
              </Card>

              {/* Top Right */}
              <Card className="bg-primary text-primary-foreground border-none shadow-none rounded-[2rem] p-8 flex flex-col justify-between group hover:bg-primary/90 transition-colors">
                <Award className="h-10 w-10 text-accent mb-4" />
                <div>
                  <h3 className="font-heading text-xl font-bold mb-2">Honors System</h3>
                  <p className="text-primary-foreground/80 text-sm">Earn over 300+ specialized badges.</p>
                </div>
              </Card>

              <Card className="bg-[#FFE4CF] border-none shadow-none rounded-[2rem] p-8 flex flex-col justify-between group hover:bg-[#ffdec4] transition-colors">
                <Heart className="h-10 w-10 text-[#FF8B3D] mb-4" />
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#4A2B15] mb-2">Service</h3>
                  <p className="text-[#6D4C33] text-sm">Impact your local community.</p>
                </div>
              </Card>

              {/* Bottom Right */}
              <Card className="md:col-span-2 bg-secondary/30 border-none shadow-none rounded-[2rem] p-8 flex items-center gap-8 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                  <Users className="h-64 w-64" />
                </div>
                <div className="relative z-10">
                  <Badge variant="secondary" className="mb-4 bg-white">Community</Badge>
                  <h3 className="font-heading text-2xl font-bold mb-2">Friends for Life</h3>
                  <p className="text-muted-foreground max-w-xs">Building strong relationships through shared experiences and challenges.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Timeline Section - "A Year in the Life" */}
        <section className="py-24 bg-[#1E293B] text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[100px] bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 100%)' }} />

          <div className="container relative z-10 pt-12">
            <div className="text-center mb-20">
              <span className="text-accent font-bold tracking-wider uppercase text-sm">Pathfinder Calendar</span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mt-2">A Year in Action</h2>
            </div>

            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 hidden md:block" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { date: 'Spring', title: 'Induction', icon: Star, desc: 'Welcoming new members to the club.' },
                  { date: 'Summer', title: 'Camporee', icon: Flame, desc: '5-day wilderness adventure.' },
                  { date: 'Autumn', title: 'Community', icon: Map, desc: 'Food drives and service projects.' },
                  { date: 'Winter', title: 'Investiture', icon: Award, desc: 'Celebrating achievements.' },
                ].map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-16 h-16 bg-[#2D3F59] rounded-full border-4 border-[#1E293B] flex items-center justify-center z-10 group-hover:bg-accent group-hover:scale-110 transition-all duration-300 mx-auto md:mx-0 mb-4 md:mb-0">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`md:pt-32 text-center ${idx % 2 === 0 ? 'md:pb-32 md:pt-0 md:-mt-16' : ''}`}>
                      <span className="text-accent font-bold">{item.date}</span>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-white/60 text-sm px-4">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action - Split */}
        <section className="py-0">
          <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
            <div className="flex-1 bg-primary p-12 md:p-24 flex flex-col justify-center items-start text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <Quote className="h-12 w-12 text-accent mb-6" />
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-8 leading-tight">
                "Pathfinders changed how I see the world. It gave me confidence I never knew I had."
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  JD
                </div>
                <div>
                  <p className="font-bold">John Doe</p>
                  <p className="text-primary-foreground/70 text-sm">Master Guide</p>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#F5F5F0] p-12 md:p-24 flex flex-col justify-center items-start">
              <h2 className="font-heading text-4xl font-bold text-foreground mb-6">Ready to Join?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Registration is currently open for the 2024 season. Don't miss out on the adventure used by God to change lives.
              </p>

              <div className="space-y-4 w-full max-w-md">
                <Button asChild size="lg" className="w-full h-14 text-lg rounded-xl">
                  <Link to="/register">
                    Apply for Membership
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full h-14 text-lg rounded-xl bg-transparent border-2">
                  <Link to="/contact">
                    Contact a Leader
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
