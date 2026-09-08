import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';


interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: 'History' | 'Honors' | 'Camping' | 'Spiritual';
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  summary: string;
  image: string;
  content: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'the-story-of-hinterland-falcons',
    title: 'The Story of Hinterland Falcons: Formed & Launched in October 2023',
    category: 'History',
    author: 'Elder K. Boateng',
    authorRole: 'Master Guide & Club Historian',
    date: 'February 15, 2026',
    readTime: '4 min read',
    summary: 'Formed and launched in October 2023 at Santasi SDA Church, discover the vision, mission, and rapid rise of the Hinterland Falcons Pathfinder Club in the Ashanti South Ghana Conference.',
    image: '/falcons-group.jpg',
    content: [
      'In October 2023, visionary church leaders and youth mentors at Santasi Seventh-day Adventist Church recognized the call to inaugurate a structured, dynamic Christian youth society. They envisioned a club that would not merely occupy children on weekends, but instill character, outdoorsmanship, leadership, and a lifelong devotion to Jesus Christ.',
      'That vision officially birthed the Hinterland Falcons Pathfinder Club in October 2023. The falcon was chosen deliberately as our mascot: a bird renowned for keen vision, swift flight, soaring altitude, and relentless vigilance. That identity is crystalized into our enduring club slogan: "We Are Smart and Vigilant in Service."',
      'Since our launch, young Pathfinders and Senior Youth across Santasi have gathered regularly for class work, campouts, honors, drill exercises, and community service. Our commitment to guiding this rising generation remains steadfast.'
    ],
  },
  {
    id: '2',
    slug: '10-essential-pathfinder-knots',
    title: '10 Essential Survival Knots Every Pathfinder Must Master Before Camporee',
    category: 'Honors',
    author: 'Counselor Kwesi Appiah',
    authorRole: 'Deputy Director & Camping Specialist',
    date: 'January 28, 2026',
    readTime: '6 min read',
    summary: 'A complete illustrated guide to the foundational knots required for the Campcraft and Knotcraft honors, from the square knot to the timber hitch.',
    image: '/registration-bg.jpg',
    content: [
      'Knotcraft is the universal language of the outdoors. Whether pitching a canvas tent in heavy rain or constructing a 20-foot pioneering watchtower at a conference camporee, knowing how to tie the right knot quickly and reliably can be the difference between safety and disaster.',
      'Here are the core knots every Hinterland Falcon must master:',
      '1. The Square (Reef) Knot: The fundamental joining knot for two ropes of equal diameter. Easy to tie and untie, used widely in first aid slings.',
      '2. The Sheet Bend: Indispensable when joining two ropes of different thicknesses or tying a rope into an eye.',
      '3. The Clove Hitch: The supreme starting and finishing knot for timber lashings. Grips tightly under tension.',
      '4. The Bowline: Often called the "King of Knots," creating a secure, non-slip loop that will not jam even after bearing immense weight.',
      '5. The Taut-Line Hitch: An adjustable friction hitch that allows you to tighten or loosen tent guy lines without untying.',
      'During our Sunday morning field drill sessions, pathfinders are timed on tying these knots blindfolded to ensure complete muscle memory under pressure.'
    ],
  },
  {
    id: '3',
    slug: 'spiritual-meaning-of-pathfinder-emblem',
    title: 'The Sacred Meaning Behind the Pathfinder Scarf, Shield, and Colors',
    category: 'Spiritual',
    author: 'Pastor D. Owusu',
    authorRole: 'District Youth Pastor',
    date: 'January 10, 2026',
    readTime: '4 min read',
    summary: 'Discover the rich biblical symbolism behind every color, thread, and symbol found on the official Pathfinder uniform and Hinterland Falcons regalia.',
    image: '/church-portal-bg.jpg',
    content: [
      'To an outsider, the Pathfinder uniform may look like standard military or scout attire. But to every invested Pathfinder, every color and patch tells the story of the Gospel.',
      'The Shield represents God: "Fear not, Abram: I am thy shield, and thy exceeding great reward" (Genesis 15:1). It signifies that our protection and strength rest in God alone.',
      'The Colors carry deep biblical resonance: Red symbolizes the sacrificial blood of Jesus Christ shed on Calvary. Gold signifies excellence, heavenly character, and the trial of faith. Blue stands for steadfast loyalty to God, family, and church. White represents moral purity in thoughts, words, and actions.',
      'The Yellow Scarf, worn folded around the neck with an official slide, reminds every member that we are servants of God and friends to man, ready to be commissioned on God’s errands at a moment’s notice.'
    ],
  },
  {
    id: '4',
    slug: 'preparing-for-ashanti-camporee-2026',
    title: 'Countdown to Camporee 2026: The Ultimate Preparation & Gear Checklist',
    category: 'Camping',
    author: 'Master Guide Abena Mensah',
    authorRole: 'Camporee Logistics Coordinator',
    date: 'December 20, 2025',
    readTime: '5 min read',
    summary: 'Everything parents and pathfinders need to know regarding medical consent forms, sleeping gear, mess kits, and inspection criteria for the 2026 Camporee.',
    image: '/falcons-group.jpg',
    content: [
      'The Ashanti South Conference Camporee is the biggest highlight of the entire Pathfinder calendar! 5 days of sleeping under canvas, cooking over open fire, marching on the parade grounds, and worshiping beneath the starry canopy of God’s creation.',
      'Preparation begins months in advance. Here are the crucial steps every parent and unit captain must check:',
      '1. Medical & Health Clearance: Every camper must have updated medical records and signed parental liability waivers filed with the church secretary.',
      '2. Uniform Readiness: Two complete sets of field uniform (green/black trousers or skirts and club t-shirts) and one immaculate full dress uniform with all earned honor badges properly sewn on the sash.',
      '3. Personal Equipment: Flashlight with extra batteries, sleeping mat, canteen, personal Bible, Sabbath School quarterly, mess kit (plate, cup, spoon in cloth bag), and mosquito netting.',
      'Let us prepare our hearts and minds for a life-transforming spiritual adventure.'
    ],
  },
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const categories = ['All', 'History', 'Honors', 'Camping', 'Spiritual'];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      <main className="flex-1">
        {/* Blog Hero Banner */}
        <section className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-20 border-b border-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
            style={{ backgroundImage: "url('/falcons-group.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-[#163f3c]/90 to-slate-950/85 backdrop-blur-[1.5px]" />

          <div className="container relative z-10 max-w-5xl mx-auto text-center md:text-left">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Club Articles & Updates
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mb-6">
              Insights, camping skills, honors guides, and reflections from the leaders and mentors of Santasi Hinterland Falcons Pathfinder Club.
            </p>

            {/* Search Input */}
            <div className="max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles, honors, or authors..."
                className="w-full h-11 px-4 rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 backdrop-blur-md"
              />
            </div>
          </div>
        </section>

        {/* Category Pill Navigation */}
        <section className="bg-white border-b border-border sticky top-16 z-30 shadow-xs">
          <div className="container max-w-5xl py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#22534f] text-white shadow-xs'
                      : 'bg-slate-100 text-muted-foreground hover:text-foreground hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground hidden sm:inline">
              Showing {filteredPosts.length} publications
            </span>
          </div>
        </section>

        {/* Blog Post Grid */}
        <section className="py-12 md:py-16">
          <div className="container max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-xs text-amber-300 font-bold text-[11px] border border-slate-700">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-3">
                        {post.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-border/50 flex items-center justify-between">
                    <div className="text-xs">
                      <p className="font-bold text-foreground">{post.author}</p>
                      <p className="text-[11px] text-muted-foreground">{post.authorRole}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActivePost(post)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                    >
                      Read Article &rarr;
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Article Reading Modal */}
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
            <div className="bg-card rounded-2xl border border-border max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase mb-2">
                    {activePost.category}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                    {activePost.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span>By <strong>{activePost.author}</strong> ({activePost.authorRole})</span>
                    <span>•</span>
                    <span>{activePost.date}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePost(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="h-56 sm:h-64 w-full rounded-xl overflow-hidden border border-border">
                <img src={activePost.image} alt={activePost.title} className="h-full w-full object-cover" />
              </div>

              <div className="space-y-4 text-sm text-foreground/90 leading-relaxed font-sans">
                {activePost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground italic">
                  Santasi Hinterland Falcons Pathfinder Club Publications
                </span>
                <Button onClick={() => setActivePost(null)} size="sm">
                  Close Article
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

export default Blog;
