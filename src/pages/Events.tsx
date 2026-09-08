import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface ClubEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status?: string;
  participantsCount?: number;
  uniform?: string;
  uniformBadge?: string;
  description?: string;
  highlights?: string[];
}

const getEventTheme = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('investiture') || cat.includes('ceremony') || cat.includes('sabbath')) {
    return {
      uniform: 'Full Dress Uniform',
      uniformBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  }
  if (cat.includes('service') || cat.includes('outreach') || cat.includes('clean')) {
    return {
      uniform: 'Casual / Work Clothes',
      uniformBadge: 'bg-slate-100 text-slate-800 border-slate-300',
    };
  }
  return {
    uniform: 'Field Uniform',
    uniformBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };
};

const categories = [
  { key: 'all', label: 'All Gatherings' },
  { key: 'camporee', label: 'Camporees & Camps' },
  { key: 'investiture', label: 'Investiture & Honors' },
  { key: 'rally', label: 'Rallies & Drills' },
  { key: 'service', label: 'Community Service' },
];

const Events = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalEvent, setActiveModalEvent] = useState<ClubEvent | null>(null);

  useEffect(() => {
    api<ClubEvent[]>('/events')
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch((err) => {
        console.warn('[Events] Live events fetch notice:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'all') return true;
    return (e.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      <main className="flex-1">
        {/* Events Hero Banner */}
        <section className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-20 border-b border-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
            style={{ backgroundImage: "url('/registration-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-[#163f3c]/90 to-slate-950/85 backdrop-blur-[1.5px]" />

          <div className="container relative z-10 max-w-5xl mx-auto text-center md:text-left">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Club Gatherings & Events
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mb-6">
              Stay up to date with regular Sunday morning field drills, Sabbath youth society programs, annual wilderness camporees, and investitures.
            </p>

            <p className="text-xs sm:text-sm text-amber-300 font-semibold flex items-center justify-center md:justify-start gap-2">
              Next Gathering: Sunday Parade Drills at 8:30 AM • Santasi SDA Grounds
            </p>
          </div>
        </section>

        {/* Filter Navigation */}
        <section className="bg-white border-b border-border sticky top-16 z-30 shadow-xs">
          <div className="container max-w-5xl py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat.key
                      ? 'bg-[#22534f] text-white shadow-xs'
                      : 'bg-slate-100 text-muted-foreground hover:text-foreground hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground hidden sm:inline">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12 bg-slate-50 flex-1">
          <div className="container max-w-5xl">
            {isLoading ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Loading schedule from club database...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-slate-200 bg-white p-8">
                <p className="text-base font-semibold text-slate-700">No scheduled events in this category yet</p>
                <p className="text-xs text-slate-500 mt-1">Check back soon or view all gatherings above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((evt) => {
                  const theme = getEventTheme(evt.category);
                  return (
                    <div
                      key={evt.id}
                      className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${theme.uniformBadge}`}>
                            {theme.uniform}
                          </span>
                          <span className="text-xs font-semibold text-[#855f03] bg-[#d7a60c]/15 px-2.5 py-1 rounded-md">
                            {evt.date}
                          </span>
                        </div>

                        <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                          {evt.title}
                        </h3>

                        <div className="space-y-1.5 py-3 border-y border-border/60 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Time:</span>
                            <span>{evt.time || '9:00 AM'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Location:</span>
                            <span className="truncate">{evt.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Category:</span>
                            <span className="capitalize">{evt.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setActiveModalEvent({ ...evt, ...theme })}
                          className="text-xs font-bold text-primary hover:text-primary/80 inline-flex items-center gap-1"
                        >
                          View Details &rarr;
                        </button>

                        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
                          <Link to="/register">
                            Register to Attend
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Event Detail Modal */}
        {activeModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
            <div className="bg-card rounded-2xl border border-border max-w-lg w-full my-8 p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border mb-1.5 ${activeModalEvent.uniformBadge || 'bg-slate-100 text-slate-800'}`}>
                    {activeModalEvent.uniform || 'Field Uniform'}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    {activeModalEvent.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#855f03] mt-1">
                    {activeModalEvent.date} • {activeModalEvent.time}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalEvent(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                <p><strong>Location:</strong> {activeModalEvent.location}</p>
                <p><strong>Category:</strong> {activeModalEvent.category}</p>
                {activeModalEvent.status && (
                  <p><strong>Status:</strong> {activeModalEvent.status}</p>
                )}
                {activeModalEvent.participantsCount ? (
                  <p><strong>Expected Participants:</strong> {activeModalEvent.participantsCount} members</p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setActiveModalEvent(null)}>
                  Close
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">
                    Join / Register
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Events;
