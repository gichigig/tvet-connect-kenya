// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { StudentsProvider } from "@/contexts/students/StudentsContext";
import { CoursesProvider } from "@/contexts/courses/CoursesContext";
import { UsersProvider } from "@/contexts/users/UsersContext";
import { UnitsProvider } from "@/contexts/units/UnitsContext";
import { SemesterPlanProvider } from "@/contexts/SemesterPlanContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SimpleLogin from "./pages/SimpleLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CoursesProvider>
            <UnitsProvider>
              <UsersProvider>
                <StudentsProvider>
                  <SemesterPlanProvider>
                    {/* <Toaster /> */}
                    <Sonner />
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/simple-login" element={<SimpleLogin />} />
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Index />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </SemesterPlanProvider>
                </StudentsProvider>
              </UsersProvider>
            </UnitsProvider>
          </CoursesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
