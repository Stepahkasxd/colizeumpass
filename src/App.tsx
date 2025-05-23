
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Index from "./pages/Index";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Error500 from "./pages/Error500";
import AdminDashboard from "./pages/admin/Dashboard";
import Dashboard from "./pages/dashboard/Dashboard";
import Instructions from "./pages/passes/Instructions";
import PassDetails from "./pages/passes/[id]";
import UserDetails from "./pages/admin/UserDetails";
import ApiDocs from "./pages/api/ApiDocs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-background via-black/90 to-black/95 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,204,0,0.05)_0%,transparent_50%)] pointer-events-none" />
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/support" element={<Support />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users/:userId" element={<UserDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/passes/instructions" element={<Instructions />} />
              <Route path="/passes/:id" element={<PassDetails />} />
              <Route path="/api/docs" element={<ApiDocs />} />
              <Route path="/500" element={<Error500 />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
