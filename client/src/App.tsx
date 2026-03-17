import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { ProfileSetupModal } from "@/components/profile-setup-modal";
import VoiceCommandEngine from "@/components/voice-command-engine";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import type { ReactNode } from "react";

import LoginPage from "@/pages/login";
import PreLoginAccessibilityPage from "@/pages/pre-login-accessibility";
import StudentDashboard from "@/pages/student-dashboard";
import StudentCourses from "@/pages/student-courses";
import StudentCourseDetail from "@/pages/student-course-detail";
import StudentAssessments from "@/pages/student-assessments";
import ContentViewer from "@/pages/content-viewer";
import AssessmentTaking from "@/pages/assessment-taking";
import MessagesPage from "@/pages/messages";
import AnnouncementsPage from "@/pages/announcements";
import TeacherDashboard from "@/pages/teacher-dashboard";
import TeacherCourseDetail from "@/pages/teacher-course-detail";
import TeacherConversions from "@/pages/teacher-conversions";
import TeacherContentLibrary from "@/pages/teacher-content-library";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminHierarchy from "@/pages/admin-hierarchy";
import AdminUsers from "@/pages/admin-users";
import AdminCourses from "@/pages/admin-courses";
import AdminEnrollment from "@/pages/admin-enrollment";
import AdminConversions from "@/pages/admin-conversions";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminSettings from "@/pages/admin-settings";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * RoleGuard — while auth is hydrating (token being validated), shows a
 * Skeleton loader instead of redirecting. Once hydrated, checks the user's
 * role and either renders children or redirects to /login.
 */
function RoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: ReactNode }) {
  const { user, isHydrated } = useAuth();

  // Auth not yet hydrated — show skeleton instead of flashing a redirect
  if (!isHydrated) {
    return (
      <div className="flex-1 flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg mt-2" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const [location] = useLocation();
  const isAuth = location === "/login" || location === "/pre-login-accessibility" || location === "/";

  if (isAuth) {
    return (
      <Switch>
        <Route path="/" component={() => <Redirect to="/login" />} />
        <Route path="/login" component={LoginPage} />
        <Route path="/pre-login-accessibility" component={PreLoginAccessibilityPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full" data-testid="app-layout">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Switch>
            {/* ─── Student routes ─── */}
            <Route path="/student/dashboard" component={() => <RoleGuard allowedRoles={["student"]}><StudentDashboard /></RoleGuard>} />
            <Route path="/student/courses" component={() => <RoleGuard allowedRoles={["student"]}><StudentCourses /></RoleGuard>} />
            <Route path="/student/courses/:id" component={() => <RoleGuard allowedRoles={["student"]}><StudentCourseDetail /></RoleGuard>} />
            <Route path="/student/assessments" component={() => <RoleGuard allowedRoles={["student"]}><StudentAssessments /></RoleGuard>} />
            <Route path="/student/assessments/:id" component={() => <RoleGuard allowedRoles={["student"]}><AssessmentTaking /></RoleGuard>} />
            <Route path="/student/content/:id" component={() => <RoleGuard allowedRoles={["student", "teacher", "admin"]}><ContentViewer /></RoleGuard>} />

            {/* ─── Shared routes (any logged-in user) ─── */}
            <Route path="/messages" component={() => <RoleGuard allowedRoles={["student", "teacher", "admin"]}><MessagesPage /></RoleGuard>} />
            <Route path="/announcements" component={() => <RoleGuard allowedRoles={["student", "teacher", "admin"]}><AnnouncementsPage /></RoleGuard>} />

            {/* ─── Teacher routes ─── */}
            <Route path="/teacher/dashboard" component={() => <RoleGuard allowedRoles={["teacher"]}><TeacherDashboard /></RoleGuard>} />
            <Route path="/teacher/courses/:id" component={() => <RoleGuard allowedRoles={["teacher"]}><TeacherCourseDetail /></RoleGuard>} />
            <Route path="/teacher/courses" component={() => <Redirect to="/teacher/dashboard" />} />
            <Route path="/teacher/content" component={() => <RoleGuard allowedRoles={["teacher"]}><TeacherContentLibrary /></RoleGuard>} />
            <Route path="/teacher/conversions" component={() => <RoleGuard allowedRoles={["teacher"]}><TeacherConversions /></RoleGuard>} />

            {/* ─── Admin routes ─── */}
            <Route path="/admin/dashboard" component={() => <RoleGuard allowedRoles={["admin"]}><AdminDashboard /></RoleGuard>} />
            <Route path="/admin/hierarchy" component={() => <RoleGuard allowedRoles={["admin"]}><AdminHierarchy /></RoleGuard>} />
            <Route path="/admin/users" component={() => <RoleGuard allowedRoles={["admin"]}><AdminUsers /></RoleGuard>} />
            <Route path="/admin/courses" component={() => <RoleGuard allowedRoles={["admin"]}><AdminCourses /></RoleGuard>} />
            <Route path="/admin/enrollment" component={() => <RoleGuard allowedRoles={["admin"]}><AdminEnrollment /></RoleGuard>} />
            <Route path="/admin/conversions" component={() => <RoleGuard allowedRoles={["admin"]}><AdminConversions /></RoleGuard>} />
            <Route path="/admin/analytics" component={() => <RoleGuard allowedRoles={["admin"]}><AdminAnalytics /></RoleGuard>} />
            <Route path="/admin/settings" component={() => <RoleGuard allowedRoles={["admin"]}><AdminSettings /></RoleGuard>} />

            {/* ─── Profile (any logged-in user) ─── */}
            <Route path="/profile" component={() => {
              const { user } = useAuth();
              if (user?.role === 'teacher')
                return <Redirect to="/teacher/dashboard" />;
              if (user?.role === 'admin')
                return <Redirect to="/admin/dashboard" />;
              return (
                <RoleGuard allowedRoles={["student"]}>
                  <StudentDashboard />
                </RoleGuard>
              );
            }} />

            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
      <ProfileSetupModal />
      <VoiceGlobalMount />
    </SidebarProvider>
  );
}

function VoiceGlobalMount() {
  const { user, setShowProfileSetup } = useAuth();
  const voiceEnabled = (user as any)?.preferences?.voiceEnabled ?? false;
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <VoiceCommandEngine
        defaultEnabled={voiceEnabled}
        onOpenProfile={() => setShowProfileSetup(true)}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
