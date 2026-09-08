import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';


const galleryPhotos = [
  {
    id: 'company',
    url: '/falcons-group.jpg',
    title: 'Full Club Company Roster',
    category: 'Parade & Ceremony',
    description: 'Pathfinders, Senior Youth, and Master Guides gathered in full dress and field uniforms on the Santasi grounds.',
  },
  {
    id: 'outdoors',
    url: '/registration-bg.jpg',
    title: 'Outdoor Assembly with the Colors',
    category: 'Field Drills',
    description: 'The club youth assemble outdoors with the Ghana national flag and official Pathfinder banner under the trees.',
  },
  {
    id: 'sanctuary',
    url: '/church-portal-bg.jpg',
    title: 'Sanctuary Worship & Leadership Investiture',
    category: 'Divine Service',
    description: 'Worship and fellowship at the pulpit of the Santasi SDA Church sanctuary during divine youth service.',
  },
];

const leadershipRoles = [
  {
    role: 'Club Director',
    title: 'Directorate & General Oversight',
    description: 'Provides spiritual direction, conference coordination, annual calendar planning, and executive leadership.',
  },
  {
    role: 'Deputy Directors',
    title: 'Drills & Class Curriculum',
    description: 'Supervise unit counselors, manage progressive class work (Friend to Guide), and organize Sunday field drills.',
  },
  {
    role: 'Unit Counselors',
    title: 'Hands-on Mentorship',
    description: 'Directly mentor units of 6–8 pathfinders through knotcraft, camping, spiritual devotion, and honor completion.',
  },
  {
    role: 'Master Guides',
    title: 'Certified Senior Leaders',
    description: 'Accredited leaders who teach specialized honors, certify investitures, and guide camporee survival exercises.',
  },
];

const About = () => {
  const [selectedPhoto, setSelectedPhoto] = useState(galleryPhotos[0]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      <main className="flex-1">
        {/* About Hero Banner */}
        <section className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24 border-b border-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
            style={{ backgroundImage: "url('/church-portal-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-[#163f3c]/90 to-slate-950/85 backdrop-blur-[1.5px]" />

          <div className="container relative z-10 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  About Hinterland Falcons
                </h1>

                <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mb-6">
                  A premier youth organization of the Santasi Seventh-day Adventist Church. Formed and officially launched in October 2023, our club is dedicated to shaping character, leadership, and faith in young people ages 10–15 and Senior Youth.
                </p>

                <p className="text-amber-300 font-semibold text-sm italic">
                  "We Are Smart and Vigilant in Service" • Formed & Launched October 2023, Santasi • Kumasi
                </p>
              </div>

              <div className="h-44 w-44 sm:h-52 sm:w-52 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl bg-primary shrink-0 p-1">
                <img
                  src="/falcons-logo.png"
                  alt="Hinterland Falcons Emblem"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* History & Heritage Section */}
        <section className="py-16 bg-white border-b border-border">
          <div className="container max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Formed & Launched in October 2023 at Santasi
                </h2>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Formed and officially launched in <strong>October 2023</strong> under the youth ministries department of the Santasi Seventh-day Adventist Church, the <strong>Hinterland Falcons Pathfinder Club</strong> was birthed to serve as a vibrant bastion of Christian discipline, moral fortitude, and biblical education for young people in Santasi and Kumasi.
                  </p>
                  <p>
                    Under dedicated club leadership and mentors, the club has swiftly established all progressive Pathfinder classes (from Friend to Guide), Senior Youth units, and an active corps of certified Master Guides.
                  </p>
                  <p>
                    Operating within the <strong>Ashanti South Ghana Conference</strong>, our members regularly participate in drill formations, spiritual knowledge bowls, survival camporees, and community humanitarian initiatives.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-6 bg-slate-50 space-y-4 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Key Identity Pillars
                </h3>

                <div className="p-4 rounded-xl bg-white border border-border/80">
                  <span className="text-xs font-bold text-primary block mb-1">
                    Club Aim
                  </span>
                  <p className="text-sm font-medium text-foreground italic">
                    "The Advent Message to All the World in My Generation"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-border/80">
                  <span className="text-xs font-bold text-amber-700 block mb-1">
                    Club Motto & Slogan
                  </span>
                  <p className="text-sm font-medium text-foreground italic">
                    "The Love of Christ Constrains Me" • "We Are Smart and Vigilant in Service"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-border/80">
                  <span className="text-xs font-bold text-emerald-700 block mb-1">
                    Meeting Grounds
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Santasi SDA Church Grounds, Opp. Kumasi High School Rd, Kumasi, Ghana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery Spotlight */}
        <section className="py-16 bg-slate-100/70 border-b border-border">
          <div className="container max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Life in the Hinterland Falcons
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl mx-auto">
                Explore real snapshots of our club in field training, outdoor color ceremonies, and divine sanctuary worship.
              </p>
            </div>

            {/* Featured Photo Viewer */}
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-lg mb-6">
              <div className="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-1">
                    {selectedPhoto.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200/90 max-w-2xl">
                    {selectedPhoto.description}
                  </p>
                </div>
              </div>

              {/* Photo Selector Strip */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border-t border-border">
                {galleryPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border ${
                      selectedPhoto.id === photo.id
                        ? 'bg-white border-amber-500 shadow-sm ring-1 ring-amber-500/40'
                        : 'bg-transparent border-transparent hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="h-12 w-16 rounded-lg overflow-hidden shrink-0 border border-slate-300">
                      <img src={photo.url} alt={photo.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-xs font-bold text-foreground truncate">{photo.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{photo.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership & Organization Structure */}
        <section className="py-16 bg-white border-b border-border">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Club Leadership Structure
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl mx-auto">
                Every unit in the Hinterland Falcons operates under the watchful guidance of trained and vetted volunteer leaders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadershipRoles.map((lead, idx) => (
                <div
                  key={lead.role}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 font-bold text-xs">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-1">
                      {lead.role}
                    </h3>
                    <p className="text-xs font-semibold text-amber-700 mb-3">
                      {lead.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {lead.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-14 bg-primary text-white text-center relative overflow-hidden">
          <div className="container relative z-10 max-w-2xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
              Be a Part of the Falcons Legacy
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mb-6 leading-relaxed">
              Registrations are open for new Pathfinders and Senior Youth leaders for the 2026 session.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow">
                <Link to="/register">
                  Enroll for 2026 Session
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-white/30 bg-white/10 hover:bg-white/20 text-white">
                <Link to="/events">
                  View Upcoming Events
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
