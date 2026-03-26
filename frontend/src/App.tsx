import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LoginSignup from "./pages/LoginSignup";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/StudentDashboard";
import MyApplications from "./pages/MyApplications";
import { Interviews } from "./pages/Interviews";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Students from "./pages/Students";
import Companies from "./pages/Companies";
import DataManagement from "./pages/DataManagement";
import Reports from "./pages/Reports";
import Pipelined from "./pages/Pipelined";
import SkillGapTrainings from "./pages/SkillGapTrainings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/*
        Providers order:
          AuthProvider  → manages JWT tokens & user
          RoleProvider  → reads user.role and exposes setRole for UI overrides
      */}
      <AuthProvider>
        <BrowserRouter>
          <RoleProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LoginSignup />} />
              <Route path="/login" element={<LoginSignup />} />

              {/* Protected: any authenticated user */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><Index /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><StudentDashboard /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipelined"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <DashboardLayout><Pipelined /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <DashboardLayout><MyApplications /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews"
                element={
                  <ProtectedRoute allowedRoles={["student", "faculty"]}>
                    <DashboardLayout><Interviews /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><Projects /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Faculty + Admin + Management */}
              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={["faculty", "admin", "management"]}>
                    <DashboardLayout><Students /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <ProtectedRoute allowedRoles={["faculty", "admin", "management", "company"]}>
                    <DashboardLayout><Companies /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={["faculty", "admin", "management"]}>
                    <DashboardLayout><Analytics /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skill-gap"
                element={
                  <ProtectedRoute allowedRoles={["management", "admin"]}>
                    <DashboardLayout><SkillGapTrainings /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={["faculty", "admin", "management"]}>
                    <DashboardLayout><Reports /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin only */}
              <Route
                path="/data-management"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout><DataManagement /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoleProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
