import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
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
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ClubEvent {
  id: string;
  title: string;
  category: 'Camporee' | 'Investiture' | 'Rally' | 'Community' | 'Bible Bowl';
  date: string;
  time: string;
  location: string;
  status: 'Upcoming' | 'Completed' | 'Planning';
  participantsCount: number;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);

  const fetchEvents = async () => {
    try {
      const data = await api<ClubEvent[]>('/events');
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.warn('[AdminEvents] Failed to fetch events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<ClubEvent>>({
    category: 'Camporee',
    status: 'Upcoming',
    participantsCount: 50,
  });

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      const payload = {
        title: newEvent.title,
        category: newEvent.category || 'Camporee',
        date: newEvent.date,
        time: newEvent.time || '9:00 AM',
        location: newEvent.location,
        status: newEvent.status || 'Upcoming',
        participantsCount: Number(newEvent.participantsCount) || 0,
      };

      const saved = await api<ClubEvent>('/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const updated = [saved, ...events];
      setEvents(updated);
      toast.success('Club event scheduled successfully');
      setIsDialogOpen(false);
      setNewEvent({ category: 'Camporee', status: 'Upcoming', participantsCount: 50 });
    } catch (err) {
      toast.error('Failed to save event to backend');
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      toast.success(`Event "${title}" deleted`);
    } catch (err) {
      toast.error('Failed to delete event from backend');
    }
  };

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AdminHeader
        title="Club Events & Gatherings"
        subtitle="Schedule and oversee camporees, investitures, and district rallies."
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-muted/30">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Input
              placeholder="Filter events by title, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md h-10"
            />
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              + Schedule New Event
            </Button>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="rounded-2xl border border-border bg-card p-6 space-y-4 relative group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      {ev.id} • {ev.category}
                    </span>
                    <h3 className="text-lg font-heading font-bold text-foreground">
                      {ev.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      ev.status === 'Upcoming'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {ev.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Delete Event"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground block">Date & Time</span>
                    <p className="font-semibold text-foreground mt-0.5">{ev.date} @ {ev.time}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground block">Expected Attendance</span>
                    <p className="font-semibold text-foreground mt-0.5">{ev.participantsCount} members</p>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-muted-foreground block">Venue Location</span>
                  <p className="font-medium text-foreground mt-0.5">{ev.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Schedule Event Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Club Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEvent} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="eventTitle">Event Title *</Label>
              <Input
                id="eventTitle"
                placeholder="e.g. Santasi Investiture 2026"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="eventDate">Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={newEvent.date || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eventTime">Time</Label>
                <Input
                  id="eventTime"
                  placeholder="8:30 AM"
                  value={newEvent.time || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eventLocation">Location *</Label>
              <Input
                id="eventLocation"
                placeholder="e.g. Santasi SDA Church Grounds"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eventAttendees">Expected Members</Label>
              <Input
                id="eventAttendees"
                type="number"
                value={newEvent.participantsCount || 50}
                onChange={(e) => setNewEvent({ ...newEvent, participantsCount: parseInt(e.target.value) || 0 })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-white font-semibold">
                Save & Publish Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminEvents;
