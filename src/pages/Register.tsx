import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RegistrationForm from '@/components/registration/RegistrationForm';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pathfinder Club Application
            </h1>
            <p className="text-muted-foreground">
              Complete all sections below to submit your application
            </p>
          </div>
          
          <RegistrationForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
