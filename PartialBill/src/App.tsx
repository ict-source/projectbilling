import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ChatbotWidget } from "./components/ChatbotWidget";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegister from "./pages/patient/PatientRegister";
import PatientDashboard from "./pages/patient/PatientDashboard";
import BillingLogin from "./pages/billing/BillingLogin";
import BillingDashboard from "./pages/billing/BillingDashboard";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import AIFAQSearch from "./pages/AIFAQSearch";
import HelpCenter from "./pages/HelpCenter";
import ContactForm from "./pages/ContactForm";
import DepartmentView from "./pages/departments/DepartmentView";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/patient/login" replace />;
  }

  if (user.role !== 'patient') {
    return <Navigate to="/billing/login" replace />;
  }

  return <>{children}</>;
};

// Billing Protected Route Component
const BillingProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/billing/login" replace />;
  }

  if (user.role !== 'staff') {
    return <Navigate to="/patient/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/patient/login" element={<PatientLogin />} />
    <Route path="/patient/register" element={<PatientRegister />} />
    <Route
      path="/patient/dashboard"
      element={
        <ProtectedRoute>
          <PatientDashboard />
        </ProtectedRoute>
      }
    />
    <Route path="/billing/login" element={<BillingLogin />} />
    <Route
      path="/billing/dashboard"
      element={
        <BillingProtectedRoute>
          <BillingDashboard />
        </BillingProtectedRoute>
      }
    />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/verify-email" element={<EmailVerification />} />
    {/* AI Help Center Routes */}
    <Route path="/faq-search" element={<AIFAQSearch />} />
    <Route path="/help-center" element={<HelpCenter />} />
    <Route path="/contact" element={<ContactForm />} />
    <Route path="/departments/:type" element={<DepartmentView />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const { user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
              {/* Show Chatbot Widget only when user is logged in */}
              {user && <ChatbotWidget />}
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
