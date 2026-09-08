import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/common/PageTransition";
import Index from "./pages/Index";
import About from "./pages/About";
import Events from "./pages/Events";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import UniformRequestPage from "./pages/UniformRequest";
import UniformRequestSuccess from "./pages/UniformRequestSuccess";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Applications from "./pages/admin/Applications";
import ApplicationDetail from "./pages/admin/ApplicationDetail";
import Churches from "./pages/admin/Churches";
import Members from "./pages/admin/Members";
import MemberDetail from "./pages/admin/MemberDetail";
import Attendance from "./pages/admin/Attendance";
import AdminEvents from "./pages/admin/AdminEvents";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import AdminUniformRequests from "./pages/admin/UniformRequests";
import Curriculum from "./pages/admin/Curriculum";
import Finances from "./pages/admin/Finances";
import NotFound from "./pages/NotFound";

// Church Dashboard imports
import ChurchLayout from "./pages/church/ChurchLayout";
import ChurchLogin from "./pages/church/ChurchLogin";
import ChurchDashboard from "./pages/church/ChurchDashboard";
import ChurchMembers from "./pages/church/ChurchMembers";
import AddEditMember from "./pages/church/AddEditMember";
import ChurchYouth from "./pages/church/ChurchYouth";
import ChurchApplications from "./pages/church/ChurchApplications";
import ChurchSettings from "./pages/church/ChurchSettings";

const queryClient = new QueryClient();

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChurchAuthProvider, useChurchAuth } from "@/context/ChurchAuthContext";
import { UserAuthProvider, useUserAuth } from "@/context/UserAuthContext";
import Login from "./pages/admin/Login";
import UserLogin from "./pages/user/UserLogin";
import UserDashboard from "./pages/user/UserDashboard";

const AuthLoading = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-xs">
    <div className="h-9 w-9 rounded-full border-3 border-primary border-t-transparent animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const ChurchProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useChurchAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/church/login" replace />;
  }

  return <>{children}</>;
};

const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useUserAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/registration-success" element={<PageTransition><RegistrationSuccess /></PageTransition>} />
        <Route path="/uniform-request" element={<PageTransition><UniformRequestPage /></PageTransition>} />
        <Route path="/uniform-request/success" element={<PageTransition><UniformRequestSuccess /></PageTransition>} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<PageTransition><Login /></PageTransition>} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="finances" element={<Finances />} />
          <Route path="churches" element={<Churches />} />
          <Route path="reports" element={<Reports />} />
          <Route path="uniform-requests" element={<AdminUniformRequests />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Church Auth */}
        <Route path="/church/login" element={<PageTransition><ChurchLogin /></PageTransition>} />

        {/* Protected Church Routes */}
        <Route path="/church" element={
          <ChurchProtectedRoute>
            <ChurchLayout />
          </ChurchProtectedRoute>
        }>
          <Route index element={<ChurchDashboard />} />
          <Route path="members" element={<ChurchMembers />} />
          <Route path="members/add" element={<AddEditMember />} />
          <Route path="members/edit/:memberId" element={<AddEditMember />} />
          <Route path="youth" element={<ChurchYouth />} />
          <Route path="applications" element={<ChurchApplications />} />
          <Route path="settings" element={<ChurchSettings />} />
        </Route>

        {/* Member / User Portal */}
        <Route path="/portal/login" element={<PageTransition><UserLogin /></PageTransition>} />
        <Route path="/user/login" element={<Navigate to="/portal/login" replace />} />
        <Route path="/portal" element={
          <UserProtectedRoute>
            <UserDashboard />
          </UserProtectedRoute>
        } />
        <Route path="/user" element={<Navigate to="/portal" replace />} />
        <Route path="/user/dashboard" element={<Navigate to="/portal" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    const initialPreloader = document.getElementById('initial-preloader');
    if (initialPreloader) {
      const timer = setTimeout(() => {
        initialPreloader.style.opacity = '0';
        initialPreloader.style.transform = 'scale(1.05)';
        initialPreloader.style.pointerEvents = 'none';
        const cleanup = setTimeout(() => {
          initialPreloader.remove();
        }, 450);
        return () => clearTimeout(cleanup);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AuthProvider>
      <ChurchAuthProvider>
        <UserAuthProvider>
          <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
        </UserAuthProvider>
      </ChurchAuthProvider>
    </AuthProvider>
  );
};

export default App;
