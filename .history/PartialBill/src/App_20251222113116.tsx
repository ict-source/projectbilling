import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PatientLogin from "./pages/patient/PatientLogin";
import PatientRegister from "./pages/patient/PatientRegister";
import PatientDashboard from "./pages/patient/PatientDashboard";
import BillingLogin from "./pages/billing/BillingLogin";
import BillingDashboard from "./pages/billing/BillingDashboard";

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

  return user ? <>{children}</> : <Navigate to="/patient/login" replace />;
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
    <Route path="/billing/dashboard" element={<BillingDashboard />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
