import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { CoursesProvider } from "@/contexts/courses/CoursesContext";
import { CourseContentProvider } from "@/contexts/CourseContentContext";
import { SemesterPlanProvider } from "@/contexts/SemesterPlanContext";
import { GmailAuthProvider } from "@/contexts/GmailAuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { UnitsProvider } from "@/contexts/units/UnitsContext";
import { StudentsProvider } from "@/contexts/students/StudentsContext";
import { UsersProvider } from "@/contexts/users/UsersContext";
import { GradeVaultProvider } from "@/contexts/GradeVaultContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SupabaseLogin from "./pages/SupabaseLogin";
import SupabaseSignup from "./pages/SupabaseSignup";
import CreateAdminPage from "./pages/CreateAdminPage";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import Notifications from "./pages/Notifications";
import SupabaseMigrationTest from "./pages/SupabaseMigrationTest";
import DataMigrationTest from "./pages/DataMigrationTest";
import MigrationTestSuite from "./pages/MigrationTestSuite";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CoursesProvider>
            <CourseContentProvider>
              <SemesterPlanProvider>
                <GmailAuthProvider>
                <StudentsProvider>
                  <UsersProvider>
                    <UnitsProvider>
                      <GradeVaultProvider>
                        <NotificationProvider>
                        <Toaster />
                        <Sonner />
                      <Routes>
                    {/* Legacy Firebase routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* New Supabase-only routes */}
                    <Route path="/supabase-login" element={<SupabaseLogin />} />
                    <Route path="/supabase-signup" element={<SupabaseSignup />} />
                    <Route path="/create-admin" element={<CreateAdminPage />} />
                    
                    {/* Migration and testing routes */}
                    <Route path="/test-supabase" element={<SupabaseMigrationTest />} />
                    <Route path="/migrate-data" element={<DataMigrationTest />} />
                    <Route path="/migration-test-suite" element={<MigrationTestSuite />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/api-keys" element={
                      <ProtectedRoute>
                        {/* TODO: Add content for /api-keys route */}
                        <div>API Keys Page (Coming Soon)</div>
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                      </NotificationProvider>
                    </GradeVaultProvider>
                  </UnitsProvider>
                </UsersProvider>
              </StudentsProvider>
            </GmailAuthProvider>
            </SemesterPlanProvider>
          </CourseContentProvider>
        </CoursesProvider>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
  </QueryClientProvider>
);

export default App;
