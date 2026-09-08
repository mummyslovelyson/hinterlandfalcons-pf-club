import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RegistrationForm from '@/components/registration/RegistrationForm';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <Header />

      {/* Main Registration Body with Group Photo & Linear Gradient Overlay */}
      <main className="flex-1 py-10 md:py-16 relative overflow-hidden">
        {/* Background Outdoor Club Image */}
        <div
          className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/registration-bg.jpg')" }}
        />

        {/* Perfect Linear-Gradient Overlay in Club Colors (Deep Pine Green to Midnight Slate) */}
        <div
          className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-slate-950/94 via-[#163f3c]/90 to-slate-950/95 backdrop-blur-[2px]"
        />

        <div className="container relative z-10 max-w-5xl mx-auto px-4">
          {/* Header Title */}
          <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Membership Application
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
              Santasi Adventist Youth Ministries. Please complete all 4 sections to enroll for the 2026 Pathfinder club season.
            </p>
          </div>

          {/* Registration Form Card with Glassmorphic Container */}
          <div className="rounded-3xl border border-white/15 bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-8">
            <RegistrationForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
