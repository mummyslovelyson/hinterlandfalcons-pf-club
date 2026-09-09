import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { Registration } from '@/types/registration';
import {
  MapPin,
  Clock,
  Copy,
  Check,
  Search,
  ChevronDown,
} from 'lucide-react';

const heroBackgrounds = [
  {
    id: 'flag-ceremony',
    title: 'Ceremonial Flag Bearers',
    file: '/WhatsApp Image 2026-09-05 at 16.26.02.jpeg',
    caption: 'Official Flag Presentation & Drill Inspection at Santasi',
  },
  {
    id: 'sanctuary-worship',
    title: 'Sanctuary Investiture',
    file: '/WhatsApp Image 2026-09-05 at 16.26.03.jpeg',
    caption: 'Pathfinders Assembled for Divine Worship and Honors',
  },
  {
    id: 'leadership-council',
    title: 'Executive Council',
    file: '/cccc.jpeg',
    caption: 'Hinterland Falcons Leadership & Unit Counselors',
  },
];

const journalPhotos = [
  {
    src: '/WhatsApp Image 2026-09-05 at 16.26.02.jpeg',
    title: 'Flag Ceremony & Inspection',
    alt: 'Pathfinder and AYM Flag Presentation',
    desc: 'Color guards presenting the Pathfinder and Santasi AYM District standards on the steps of the church complex during official inspection.',
    location: 'Santasi SDA Church Complex',
  },
  {
    src: '/WhatsApp Image 2026-09-05 at 16.26.03.jpeg',
    title: 'Sabbath Sanctuary Assembly',
    alt: 'Pathfinders Seated in Sanctuary',
    desc: 'Pathfinders seated in solemn assembly in crisp white uniform shirts, yellow scarves, green skirts, and earned honor sashes.',
    location: 'Santasi SDA Main Sanctuary',
  },
  {
    src: '/cccc.jpeg',
    title: 'Club Executive Leadership',
    alt: 'Club Leadership Council',
    desc: 'Our volunteer club directors, unit counselors, and staff officers assembled in official club polo uniforms and yellow scarves.',
    location: 'Outdoor Headquarters Grounds',
  },
  {
    src: '/tyty.jpeg',
    title: 'Creative Honors & Unit Crests',
    alt: 'Young Pathfinders with hand-drawn unit art',
    desc: 'Young cadets proudly exhibiting hand-drawn unit symbols, nature artwork, and emblems alongside their dedicated counselors.',
    location: 'Field Study Workshop',
  },
  {
    src: '/gggggg.jpeg',
    title: 'Executive Master Guide Corps',
    alt: 'Master Guides in full dress regalia',
    desc: 'Certified Master Guides in ceremonial dark green dress uniforms, honor sashes, medals, and berets during district investiture.',
    location: 'District Investiture Meet',
  },
  {
    src: '/45.jpeg',
    title: 'Junior Unit Fellowship',
    alt: 'Adventurers Unit Picnic',
    desc: 'The Little Lambs, Eager Beavers, and Busy Bees of the Adventurer Club enjoying outdoor fellowship, meals, and wholesome games.',
    location: 'Santasi Community Picnic',
  },
];

const Index = () => {
  // Hero Background Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Application Status Lookup State
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Registration | null | 'not-found'>(null);
  const [copied, setCopied] = useState(false);

  // Active Tab for Pledge & Law
  const [creedTab, setCreedTab] = useState<'pledge' | 'law'>('pledge');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // OneVoice27 Global Campaign Pledge State
  const [oneVoicePledged, setOneVoicePledged] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pf_one_voice_pledged') === 'true';
    } catch {
      return false;
    }
  });

  const [oneVoiceCount, setOneVoiceCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pf_one_voice_count');
      return saved ? parseInt(saved, 10) : 1428;
    } catch {
      return 1428;
    }
  });

  const handleOneVoicePledge = () => {
    if (!oneVoicePledged) {
      const nextCount = oneVoiceCount + 1;
      setOneVoiceCount(nextCount);
      setOneVoicePledged(true);
      try {
        localStorage.setItem('pf_one_voice_pledged', 'true');
        localStorage.setItem('pf_one_voice_count', nextCount.toString());
      } catch {
        // LocalStorage fallback
      }
    }
  };

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBackgrounds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    try {
      const found = await api<Registration>(`/public/registrations/lookup?q=${encodeURIComponent(searchId.trim())}`);
      setSearchResult(found);
    } catch {
      setSearchResult('not-found');
    } finally {
      setIsSearching(false);
    }
  };

  const copyRefId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const classesList = [
    {
      name: 'Friend',
      age: 'Age 10 • Grade 5',
      color: '#1e3a8a',
      accent: 'bg-blue-900',
      image: '/friend-class.jpg',
      description: 'Foundational knotcraft, trail signs, simple campcraft, and discovering Jesus as our best friend.',
      keyHonors: ['Camp Craft', 'Knots & Lashings', 'Mammals', 'Christian Citizenship'],
    },
    {
      name: 'Companion',
      age: 'Age 11 • Grade 6',
      color: '#b91c1c',
      accent: 'bg-red-700',
      image: '/companion-class.jpg',
      description: 'First aid essentials, pioneering, compass reading, and practicing Christlike empathy in the community.',
      keyHonors: ['Basic First Aid', 'Orienteering', 'Bird Study', 'Community Service'],
    },
    {
      name: 'Explorer',
      age: 'Age 12 • Grade 7',
      color: '#15803d',
      accent: 'bg-green-700',
      image: '/explorer-class.jpg',
      description: 'Wilderness shelter building, star navigation, environmental stewardship, and Christian church heritage.',
      keyHonors: ['Stars', 'Weather', 'Wilderness Living', 'Christian Grooming'],
    },
    {
      name: 'Ranger',
      age: 'Age 13 • Grade 8',
      color: '#475569',
      accent: 'bg-slate-600',
      image: '/ranger-class.jpg',
      description: 'Precision drill maneuvers, emergency preparedness, spiritual discovery, and mentoring younger club units.',
      keyHonors: ['Pioneering', 'Backpacking', 'Advanced First Aid', 'Physical Fitness'],
    },
    {
      name: 'Voyager',
      age: 'Age 14 • Grade 9',
      color: '#7e22ce',
      accent: 'bg-purple-700',
      image: '/voyager-class.jpg',
      description: 'Christian worldview formation, outdoor survival endurance, peer evangelism, and leadership readiness.',
      keyHonors: ['Storytelling', 'Fire Building', 'Ecology', 'Sanctuary Message'],
    },
    {
      name: 'Guide',
      age: 'Age 15 • Grade 10',
      color: '#ca8a04',
      accent: 'bg-amber-600',
      image: '/guide-class.jpg',
      description: 'Senior leadership training, expedition planning, unit captaincy, and youth ministry coordination.',
      keyHonors: ['Camp Leadership', 'Disaster Response', 'Temperance', 'Youth Evangelism'],
    },
  ];

  const laws = [
    {
      title: 'Keep the morning watch',
      scripture: 'Psalm 5:3',
      desc: 'Beginning each day with personal prayer and Bible study before the world’s distractions begin.',
    },
    {
      title: 'Do my honest part',
      scripture: 'Colossians 3:23',
      desc: 'Fulfilling all assigned duties at home, school, church, and club diligently and truthfully.',
    },
    {
      title: 'Care for my body',
      scripture: '1 Corinthians 6:19-20',
      desc: 'Practicing temperance, physical vigor, clean habits, and honoring the body as God’s temple.',
    },
    {
      title: 'Keep a level eye',
      scripture: 'Psalm 101:7',
      desc: 'Facing every person with honest courage, despising deceit, and championing what is right.',
    },
    {
      title: 'Be courteous and obedient',
      scripture: 'Ephesians 6:1-2',
      desc: 'Showing sincere respect and prompt, cheerful obedience to parents, pastors, teachers, and leaders.',
    },
    {
      title: 'Walk softly in the sanctuary',
      scripture: 'Habakkuk 2:20',
      desc: 'Maintaining reverence, quietness, and dignity in God’s house during sacred worship.',
    },
    {
      title: 'Keep a song in my heart',
      scripture: 'Psalm 100:2',
      desc: 'Living with joyful gratitude and cheerfulness, dispelling gloom with Christian praise.',
    },
    {
      title: 'Go on God’s errands',
      scripture: 'Isaiah 6:8',
      desc: 'Ready at a moment’s notice to help the sick, serve the poor, and share Jesus with others.',
    },
  ];

  const pledgeClauses = [
    {
      clause: 'By the Grace of God',
      scripture: '2 Corinthians 12:9',
      theme: 'Total Reliance on Christ',
      desc: 'Human willpower fails on its own; only through Christ’s strength can we consistently do what is noble and right.',
    },
    {
      clause: 'I Will Be Pure',
      scripture: 'Philippians 4:8',
      theme: 'Clean Mind & Conduct',
      desc: 'Guarding what we watch, speak, and think; preserving our moral purity and bodily health.',
    },
    {
      clause: 'I Will Be Kind',
      scripture: 'Ephesians 4:32',
      theme: 'Christlike Courtesy',
      desc: 'Practicing courtesy at all times, respecting the elderly, protecting the weak, and showing tenderness to animals.',
    },
    {
      clause: 'I Will Be True',
      scripture: '1 Kings 2:4',
      theme: 'Unwavering Integrity',
      desc: 'Standing firm for truth, honesty in our schoolwork and chores, even when no one is watching.',
    },
    {
      clause: 'I Will Be a Servant of God',
      scripture: 'Matthew 20:28',
      theme: 'Dedicated Ministry',
      desc: 'Putting God first in our youth, using our hands and talents for the mission of the church and community.',
    },
    {
      clause: 'And a Friend to Man',
      scripture: 'Proverbs 18:24',
      theme: 'Brotherhood Without Bias',
      desc: 'Living without prejudice, being a dependable neighbor in Kumasi, and sharing Christian love with all.',
    },
  ];

  const faqs = [
    {
      q: 'Does my child need to be a Seventh-day Adventist to join?',
      a: 'No! The Hinterland Falcons welcomes all youth ages 10–15 (and Adventurers ages 4–9) across Santasi, Kumasi, and surrounding communities regardless of denomination, provided they agree to uphold club discipline, the Pledge, and Law.',
    },
    {
      q: 'What is the regular meeting schedule and venue?',
      a: 'We hold regular Sunday outdoor field drill sessions from 8:30 AM to 11:30 AM at the Santasi SDA Church school grounds. Sabbath afternoon AY and club fellowship takes place from 4:00 PM to 6:00 PM in the main sanctuary.',
    },
    {
      q: 'How do we obtain the official club uniform and scarves?',
      a: 'Once registered, parents can place orders through our official Uniform Portal for full Class A dress shirts, matching trousers/skirts, field t-shirts, yellow scarves with Pathfinder slides, and honor sashes.',
    },
    {
      q: 'What adult supervision and safety protocols are in place?',
      a: 'Every session and campout is directed by certified Master Guides trained in First Aid, youth protection, and outdoor logistics. Medical disclosures and guardian contact details are kept on file for every child.',
    },
    {
      q: 'What is the age requirement for Pathfinders vs Adventurers?',
      a: 'The Adventurers Club serves children ages 4–9. The Pathfinder Club serves youth ages 10–15 (Grades 5–10). Youth ages 16 and above enter the Senior Youth and Master Guide leadership training curriculum.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fbfdfc] text-[#112c27] selection:bg-[#d7a60c]/30 selection:text-[#112c27]">
      <Header />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* SECTION 1: AUTHENTIC HERO BANNER                                         */}
        {/* ========================================================================= */}
        <section className="relative bg-[#071816] text-white overflow-hidden border-b border-[#1c453b]">
          {/* Background Slideshow of Real Club Ceremonies */}
          {heroBackgrounds.map((bg, idx) => (
            <div
              key={bg.id}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                currentSlide === idx ? 'opacity-75 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url('${bg.file}')`,
                transitionProperty: 'opacity, transform',
                transitionDuration: '1000ms, 8000ms',
              }}
            />
          ))}

          {/* Reduced Linear Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071816] via-[#071816]/40 to-black/30" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="container relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-16 sm:pt-20 sm:pb-24">
            {/* Hero Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >

              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Hinterland Falcons <br />
                <span className="text-[#f5c432]">Pathfinder Club</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto">
                Training Christian youth in spiritual courage, precision drill marching, honors discovery, and selfless community service at Santasi SDA Church in Kumasi. 3 years of steadfast guidance for children and adolescents.
              </p>

              {/* Primary Calls to Action */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 rounded-xl bg-[#d7a60c] hover:bg-[#ba8607] text-[#091f1d] font-bold shadow-md transition-all hover:scale-[1.01]"
                >
                  <Link to="/register">
                    Apply for 2026 Intake &rarr;
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/portal">
                    Member & Parent Portal
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-12 px-5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <a href="#track-status">
                    Track Application Status
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Slide Navigation Toggles */}
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Featured Photo:</span>
                <span className="font-semibold text-[#f5c432]">
                  {heroBackgrounds[currentSlide].caption}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {heroBackgrounds.map((bg, idx) => (
                  <button
                    key={bg.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx ? 'w-6 bg-[#d7a60c]' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={bg.title}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: WELCOME FROM CLUB DIRECTOR                                      */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-20 bg-white border-b border-slate-200 overflow-hidden">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Director Portrait with Official Master Guide Credential */}
              <motion.div
                initial={{ opacity: 0, x: -35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5"
              >
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900 group">
                  <img
                    src="/vvvv.jpeg"
                    alt="Director MG Adu-Attah Samuel in Master Guide Uniform"
                    className="w-full h-auto object-cover object-top max-h-[480px] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071816] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                    <h3 className="font-heading text-lg font-bold">
                      Director MG Adu-Attah Samuel
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Club Director • Santasi District AYM Council
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Pastoral Welcome Letter */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 space-y-5"
              >
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#112c27]">
                    "We Are Smart and Vigilant in Service"
                  </h2>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                  <p>
                    Welcome to the official portal of the <strong>Hinterland Falcons Pathfinder Club</strong> at Santasi Seventh-day Adventist Church. Formed and officially launched in <strong>October 2023</strong>, our club stands as a vibrant anchor of moral character, spiritual grounding, and physical vitality for boys and girls across Santasi and Kumasi.
                  </p>
                  <p>
                    We believe that young people thrive when they are challenged with constructive responsibility, anchored in the Word of God, and guided by mentors who truly care. Whether learning the intricacies of first aid and pioneering knotcraft or standing at attention before the sanctuary during investiture, every Hinterland Falcon learns that true greatness lies in humble Christian service.
                  </p>
                  <p>
                    We encourage every parent in Santasi and our surrounding communities to enroll their children for this year’s journey. Our certified counselors stand ready to welcome them into a brotherhood and sisterhood of faithful adventure.
                  </p>
                </div>

                {/* Core Pillars Bullet */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-default"
                  >
                    <div className="font-bold text-xs text-[#22534f]">Spiritual Roots</div>
                    <div className="text-xs text-slate-600 mt-0.5">Morning watch, Bible quizzing, and baptismal readiness.</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-default"
                  >
                    <div className="font-bold text-xs text-[#22534f]">Wilderness Skills</div>
                    <div className="text-xs text-slate-600 mt-0.5">Pioneering, knots, campouts, and nature honors.</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-default"
                  >
                    <div className="font-bold text-xs text-[#22534f]">Civic Service</div>
                    <div className="text-xs text-slate-600 mt-0.5">Neighborhood cleanups, health expos, and outreach.</div>
                  </motion.div>
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <Button asChild className="bg-[#22534f] hover:bg-[#183d3a] text-white font-semibold rounded-xl text-xs h-10 px-5">
                    <Link to="/about">
                      Read Our Club History & Creed &rarr;
                    </Link>
                  </Button>
                  <a href="#schedule" className="text-xs font-semibold text-[#22534f] hover:underline">
                    View Weekly Drill Times
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: LIFE IN THE FALCONS — AUTHENTIC PHOTO JOURNAL                  */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-20 bg-[#0c2420] text-white border-b border-[#1c453b]">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-white/10"
            >
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                  Life in the Hinterland Falcons
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Unfiltered moments from our Sunday drills, sanctuary investitures, and leadership councils at Santasi.
                </p>
              </div>

              <div className="text-xs text-slate-300 font-mono">
                Santasi SDA Church Grounds • Kumasi
              </div>
            </motion.div>

            {/* Photo Grid with Real Uploaded Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {journalPhotos.map((photo, idx) => (
                <motion.div
                  key={photo.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg flex flex-col hover:border-amber-400/40 transition-colors"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-900">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white mb-1 group-hover:text-amber-300 transition-colors">
                        {photo.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {photo.desc}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10 text-[11px] text-[#f5c432] font-mono">
                      {photo.location}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: UNIFIED APPLICATION TRACKER & MEMBER PORTAL ACCESS             */}
        {/* ========================================================================= */}
        <section id="track-status" className="py-14 sm:py-20 bg-[#f4f7f6] border-b border-slate-200">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.99 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm"
            >
              <div className="max-w-xl mx-auto text-center space-y-2 mb-8">
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#112c27]">
                  Track Application or Open Member Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Enter your <strong>Application Reference ID</strong> (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-[#22534f]">PF-...</code>) or applicant full name to check admission approval status.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchStatus} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter Reference ID (e.g. PF-174...) or Name"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#22534f] transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="h-12 px-6 rounded-xl bg-[#22534f] hover:bg-[#183d3a] text-white font-bold text-sm shadow-xs transition-transform active:scale-95"
                >
                  {isSearching ? 'Searching...' : 'Lookup Record'}
                </Button>
              </form>

              {/* Status Results Display with AnimatePresence */}
              <AnimatePresence mode="wait">
                {searchResult && searchResult !== 'not-found' && (
                  <motion.div
                    key="result-found"
                    initial={{ opacity: 0, y: 12, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -12, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 p-5 rounded-2xl bg-[#f7faf9] border border-[#22534f]/20 max-w-xl mx-auto space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Applicant Record</span>
                        <strong className="font-heading text-lg text-slate-900">{searchResult.applicant?.fullName}</strong>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                          searchResult.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : searchResult.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {searchResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Class / Unit:</span>
                        <strong className="text-slate-800">{searchResult.membership?.completedClasses?.[0] || 'Friend'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Church Station:</span>
                        <strong className="text-slate-800 truncate block">{searchResult.applicant?.church || 'Santasi SDA'}</strong>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                      <Button asChild className="flex-1 h-11 bg-[#22534f] hover:bg-[#183d3a] text-white text-xs font-bold rounded-xl transition-transform active:scale-95">
                        <Link to="/portal">
                          Open Full Member Dashboard &rarr;
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyRefId(searchResult.id)}
                        className="text-xs h-11 border-slate-300 rounded-xl transition-transform active:scale-95"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copied ? 'Copied' : 'Copy ID'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {searchResult === 'not-found' && (
                  <motion.div
                    key="result-not-found"
                    initial={{ opacity: 0, y: 12, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -12, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center max-w-xl mx-auto space-y-1 overflow-hidden"
                  >
                    <p className="font-semibold">No active application found matching "{searchId}"</p>
                    <p className="text-slate-600">
                      Please verify your reference number. If you have not submitted an application yet, you can{' '}
                      <Link to="/register" className="font-bold text-[#22534f] underline">
                        register online now
                      </Link>.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
                <span>Already an approved Pathfinder member or parent?</span>
                <Link to="/portal/login" className="font-bold text-[#22534f] hover:underline flex items-center gap-1">
                  Sign In with Phone/Reference to Member Dashboard &rarr;
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: THE 6 PROGRESSIVE CLASSES CURRICULUM                            */}
        {/* ========================================================================= */}
        <section
          id="classes"
          className="relative py-16 sm:py-22 bg-cover bg-center bg-no-repeat border-b border-slate-200"
          style={{ backgroundImage: "url('/falcons-outdoors.jpg')" }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />

          <div className="container relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                The 6 Pathfinder Classes
              </h2>
              <p className="text-xs sm:text-sm text-slate-200">
                From Grade 5 to Grade 10, each progressive class represents a milestone year of spiritual maturity, vocational badges, nature study, and outdoor endurance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classesList.map((c, idx) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#22534f] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header bar with class badge and level */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-800">
                        {c.name} Class
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {c.age}
                      </span>
                    </div>

                    {/* Class Emblem Display */}
                    <div className="h-32 w-32 mx-auto rounded-full p-2 bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <img
                        src={c.image}
                        alt={`${c.name} Class Crest`}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="space-y-1.5 text-center">
                      <h3 className="font-heading text-xl font-bold text-[#112c27]">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  {/* Honors badges */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-[#22534f] block mb-1.5">
                      Core Vocational Honors:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.keyHonors.map((h) => (
                        <span
                          key={h}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Senior Youth & Master Guide Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-10 p-6 rounded-2xl bg-[#071816] text-white border border-[#1c453b] flex flex-col md:flex-row items-center justify-between gap-5"
            >
              <div className="space-y-1">
                <h4 className="font-heading text-lg sm:text-xl font-bold">
                  Master Guide & Counselor Training (Ages 16+)
                </h4>
                <p className="text-xs text-slate-300 max-w-xl">
                  Young adults ages 16 and older train under the Master Guide leadership curriculum to command units, direct drill maneuvers, and mentor cadets.
                </p>
              </div>
              <Button asChild className="bg-[#d7a60c] hover:bg-[#ba8607] text-[#091f1d] font-bold text-xs h-11 px-6 rounded-xl flex-shrink-0 transition-transform active:scale-95">
                <Link to="/register">
                  Enroll as Senior Youth / Leader
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: THE PLEDGE & LAW (CHURCH CREED PRESENTATION)                   */}
        {/* ========================================================================= */}
        <section id="pledge-law" className="py-16 sm:py-22 bg-[#f4f7f6] border-b border-slate-200 overflow-hidden">
          <div className="container max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto space-y-2 mb-10"
            >
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#112c27]">
                The Pathfinder Pledge & Law
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Recited with hand over heart at every Sunday parade and Sabbath divine assembly.
              </p>

              {/* Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 mt-4 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCreedTab('pledge')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    creedTab === 'pledge'
                      ? 'bg-[#22534f] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  The Pathfinder Pledge
                </button>
                <button
                  type="button"
                  onClick={() => setCreedTab('law')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    creedTab === 'law'
                      ? 'bg-[#22534f] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  The 8 Pathfinder Laws
                </button>
              </div>
            </motion.div>

            {/* Tab Switching with AnimatePresence */}
            <AnimatePresence mode="wait">
              {creedTab === 'pledge' ? (
                <motion.div
                  key="pledge-content"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Plaque Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                      <span className="text-xs font-bold text-[#112c27]">
                        The Pathfinder Pledge
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        General Conference of Seventh-day Adventists
                      </span>
                    </div>

                    <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif font-medium text-[#112c27] py-4 pl-6 border-l-4 border-[#22534f] bg-[#f9fbfa] rounded-r-2xl leading-snug">
                      "By the grace of God, <br />
                      I will be pure, and kind, and true. <br />
                      I will be a servant of God <br />
                      and a friend to man."
                    </blockquote>
                  </div>

                  {/* The 6 Clauses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pledgeClauses.map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-[#22534f]/50 hover:shadow-sm transition-colors cursor-default"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-[#22534f]">Clause 0{idx + 1}</span>
                          <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {item.scripture}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-[#112c27]">
                          {item.clause}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="law-content"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {laws.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4 hover:border-[#22534f]/50 hover:shadow-sm transition-colors cursor-default"
                    >
                      <div className="h-8 w-8 rounded-lg bg-[#22534f] text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                        0{idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-heading font-bold text-sm text-[#112c27]">
                            {item.title}
                          </h4>
                          <span className="text-[11px] font-mono text-[#22534f] bg-[#22534f]/10 px-2 py-0.5 rounded">
                            {item.scripture}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: ONEVOICE27 GLOBAL MOVEMENT SHOWCASE                            */}
        {/* ========================================================================= */}
        <section id="one-voice-27" className="py-16 sm:py-20 bg-[#070e1c] text-white border-b border-slate-800 overflow-hidden">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Mission Narrative */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
                    OneVoice<span className="text-amber-400">27</span>: Mission For All
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Under the worldwide Adventist Youth Ministries banner, <strong>OneVoice27</strong> unites millions of Pathfinders, youth, and leaders to proclaim the Three Angels’ Messages of Revelation 14:6–12.
                  </p>
                </div>

                {/* Local Station Commission */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-amber-400">
                    Santasi AYM Station Commission
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hinterland Falcons units are deploying across Kumasi with youth-led neighborhood Bible studies, door-to-door compassion ministries, and health expos.
                  </p>
                </div>

                {/* Pledge Button */}
                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={handleOneVoicePledge}
                    className={`h-12 px-6 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                      oneVoicePledged
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                    }`}
                  >
                    {oneVoicePledged
                      ? `✓ Pledge Confirmed (${oneVoiceCount.toLocaleString()} Pathfinders)`
                      : `I Pledge to Speak With One Voice (${oneVoiceCount.toLocaleString()})`}
                  </Button>
                </div>
              </motion.div>

              {/* Right Column: Campaign Poster */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02 }}
                className="lg:col-span-5"
              >
                <div className="rounded-2xl overflow-hidden border border-purple-500/40 shadow-xl bg-slate-900 group">
                  <img
                    src="/one-voice-27.jpg"
                    alt="OneVoice27 Official Campaign Poster"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
                    <span className="text-amber-400 font-bold block">Revelation 14:6</span>
                    "Having the everlasting gospel to preach unto them that dwell on the earth."
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: GATHERING SCHEDULE & LOCATION                                 */}
        {/* ========================================================================= */}
        <section
          id="schedule"
          className="relative py-16 sm:py-24 bg-cover bg-center bg-no-repeat border-b border-slate-200 overflow-hidden"
          style={{ backgroundImage: "url('/church-sanctuary.jpg')" }}
        >
          {/* Subtle dark overlay for contrast & readability */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />

          <div className="container relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                    Where & When We Gather
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Meetings are conducted on the official grounds of the Santasi Seventh-day Adventist Church.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md flex items-start gap-4"
                  >
                    <Clock className="h-5 w-5 text-[#f5c432] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Sunday Morning Field Session</h4>
                      <p className="text-xs text-[#f5c432] font-medium">8:30 AM – 11:30 AM</p>
                      <p className="text-xs text-slate-300 mt-1">
                        Inspection, precision drill marching, knotcraft, outdoor pioneer skills, and class honors.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md flex items-start gap-4"
                  >
                    <Clock className="h-5 w-5 text-[#f5c432] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Sabbath Afternoon AY & Club Fellowship</h4>
                      <p className="text-xs text-[#f5c432] font-medium">4:00 PM – 6:00 PM</p>
                      <p className="text-xs text-slate-300 mt-1">
                        Adventist Youth Society devotionals, Bible quizzes, sacred music ministry, and unit reports.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md flex items-start gap-4"
                  >
                    <MapPin className="h-5 w-5 text-[#f5c432] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Physical Address & Grounds</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Santasi Seventh-day Adventist Church Complex, Opposite Kumasi High School Road, Santasi, Kumasi, Ghana.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Safeguarding Card */}
              <motion.div
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#071816]/90 backdrop-blur-md text-white border border-[#1c453b] space-y-5 shadow-2xl"
              >
                <div className="space-y-2">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold">
                    Supervised Mentorship & Child Protection
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    We understand the trust parents place in us. Every field activity, camping exercise, and drill is supervised by certified Master Guides trained in First Aid and child welfare protocols.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <strong className="text-white block mb-0.5">Health Protocols</strong>
                    <span className="text-slate-400">Medical emergency forms kept on file for each cadet.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <strong className="text-white block mb-0.5">Safe Logistics</strong>
                    <span className="text-slate-400">Strict adult-to-cadet ratios on all outdoor expeditions.</span>
                  </div>
                </div>

                <Button asChild className="w-full h-11 rounded-xl bg-[#d7a60c] hover:bg-[#ba8607] text-[#091f1d] font-bold text-xs">
                  <Link to="/register">
                    Enroll Your Child Today &rarr;
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* SECTION 9: FAQS FOR PARENTS                                               */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-20 bg-[#f4f7f6] border-b border-slate-200">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-2 mb-10"
            >
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#112c27]">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Key information for parents enrolling children in the Santasi Pathfinder Club.
              </p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-colors hover:border-[#22534f]/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-heading text-sm sm:text-base font-bold text-[#112c27]">
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="text-[#22534f] flex-shrink-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10: FINAL ENROLLMENT CALL TO ACTION                               */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-22 bg-[#071816] text-white text-center border-t border-[#1c453b] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="container max-w-2xl mx-auto px-4 sm:px-6 space-y-6"
          >
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold">
              Ready to Join the Hinterland Falcons?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
              Spaces in each progressive class unit are limited to maintain close mentoring ratios. Complete your child’s 2026 intake registration online today.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-[#d7a60c] hover:bg-[#ba8607] text-[#091f1d] font-bold text-sm shadow-md transition-transform active:scale-95">
                <Link to="/register">
                  Submit Online Application
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 text-sm transition-transform active:scale-95">
                <Link to="/uniform-request">
                  Uniform & Sash Requisitions
                </Link>
              </Button>
            </div>

            <p className="text-[11px] text-white/40 pt-4">
              Santasi Seventh-day Adventist Church • Central Ghana Conference
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
