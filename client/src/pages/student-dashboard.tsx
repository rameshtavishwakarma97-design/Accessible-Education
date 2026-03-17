import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TopBar } from "@/components/top-bar";
import { DisabilityChips, FormatChips, StatusChip } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  Clock,
  ArrowRight,
  AlertTriangle,
  FileText,
  Video,
  Music,
  Presentation,
  Loader2,
  X,
  Lightbulb,
} from "lucide-react";

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  video: Video,
  audio: Music,
  document: FileText,
  presentation: Presentation,
};

// Helper: how many days from now until the given date string
function getDaysUntil(dateString: string): number {
  const now = new Date();
  const date = new Date(dateString);
  return Math.ceil((date.getTime() - now.getTime()) / 86400000);
}

// Helper: "2h ago" / "3d ago" style label
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

async function fetchStudentDashboard() {
  const token = localStorage.getItem("auth_token");
  const res = await fetch("/api/student/dashboard", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error("Failed to load dashboard data");
  }
  return res.json();
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: fetchStudentDashboard,
    enabled: !!user,
  });

  const [showHint, setShowHint] = useState(() => {
    return localStorage.getItem('student_onboarding_dismissed') !== 'true';
  });

  const dismissHint = () => {
    localStorage.setItem('student_onboarding_dismissed', 'true');
    setShowHint(false);
  };

  const enrolled = data?.courses ?? [];
  const recentContent = data?.recentContent ?? [];
  const upcomingAssessments = data?.upcomingAssessments ?? [];
  const recentAnnouncements = data?.announcements ?? [];

  const activeModules: string[] = [];
  if (user?.disabilities?.some((d: string) => ["blind", "low_vision"].includes(d))) activeModules.push("Visual");
  if (user?.disabilities?.some((d: string) => ["deaf", "hard_of_hearing"].includes(d))) activeModules.push("Auditory");
  if (user?.disabilities?.some((d: string) => ["mute", "speech_impaired"].includes(d))) activeModules.push("Communication");
  if (user?.disabilities?.some((d: string) => ["adhd", "dyslexia", "autism", "cognitive"].includes(d))) activeModules.push("Cognitive");
  if ((user?.disabilities?.length ?? 0) > 0) activeModules.push("Navigation");

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Dashboard" breadcrumb="Loading..." />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading your dashboard…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Dashboard" breadcrumb="" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive font-medium">Could not load dashboard data</p>
            <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Dashboard"
        breadcrumb={`${user?.program ?? ""} > Year ${user?.year ?? ""} > Div ${user?.division ?? ""} > Spring 2026`}
      />
      {showHint && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Welcome to AccessEd
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-0.5 list-disc list-inside">
              <li>Open any course material and choose your preferred format from the dropdown</li>
              <li>Formats include Audio, Simplified Text, High Contrast PDF, and Braille</li>
              <li>Use the TTS button to have content read aloud</li>
              <li>Your reading progress is saved automatically</li>
            </ul>
          </div>
          <button
            onClick={dismissHint}
            className="text-blue-400 hover:text-blue-600 dark:text-blue-500 shrink-0"
            aria-label="Dismiss hint"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section aria-labelledby="my-courses-heading">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 id="my-courses-heading" className="font-serif text-lg font-semibold">
                    My Courses This Term
                  </h2>
                  <Link href="/student/courses">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs" data-testid="link-view-all-courses">
                      View All <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(!enrolled || enrolled.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center text-muted-foreground">
                      <span className="text-3xl">📚</span>
                      <p className="text-sm font-medium">No courses yet</p>
                      <p className="text-xs">You haven't been enrolled in any courses. Check back soon.</p>
                    </div>
                  ) : (
                  enrolled.map((co: any) => (
                    <Link key={co.id} href={`/student/courses/${co.id}`}>
                      <article
                        className="group hover-elevate rounded-md border bg-card p-4 space-y-3"
                        aria-label={`${co.course?.code} ${co.course?.name}, Spring 2026, Division ${(co.divisions || []).join(", ")}`}
                        data-testid={`card-course-${co.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="no-default-active-elevate font-mono text-[11px]">
                                {co.course?.code}
                              </Badge>
                              {co.enrollmentType === "admin_assigned" ? (
                                <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#EEF5FB] text-[#355872]">Core</Badge>
                              ) : (
                                <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#F0F9F4] text-[#2E8B6E]">Elective</Badge>
                              )}
                            </div>
                            <h3 className="mt-1 text-sm font-semibold leading-tight">
                              {co.course?.name}
                            </h3>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Spring 2026 · Div {(co.divisions || []).join(", ")} · {co.teachers?.[0]?.name ?? ""}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">{co.progress ?? 0}%</span>
                          </div>
                          <Progress value={co.progress ?? 0} className="h-1" />
                        </div>
                      </article>
                    </Link>
                  ))
                  )}
                </div>
              </section>

              <section aria-labelledby="new-content-heading">
                <h2 id="new-content-heading" className="font-serif text-lg font-semibold mb-4">
                  New Content
                </h2>
                <div className="space-y-2">
                  {(!recentContent || recentContent.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                      <span className="text-3xl">📄</span>
                      <p className="text-sm font-medium">No recent content</p>
                      <p className="text-xs">Content shared by your teachers will appear here.</p>
                    </div>
                  ) : (
                  recentContent.map((ci: any) => {
                    const Icon = typeIcons[ci.type] || FileText;
                    // Find the course code from enrolled courses
                    const co = enrolled.find((c: any) => c.id === ci.courseOfferingId);
                    return (
                      <Link key={ci.id} href={`/student/content/${ci.id}`}>
                        <div
                          className="flex items-center gap-3 rounded-md border bg-card p-3 hover-elevate"
                          data-testid={`row-content-${ci.id}`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ci.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {co?.course?.code ?? ""} · {formatTimeAgo(ci.updatedAt || ci.createdAt)}
                            </p>
                          </div>
                          <FormatChips formats={ci.formats || []} size="small" />
                        </div>
                      </Link>
                    );
                  })
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section aria-labelledby="accessibility-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="accessibility-heading" className="font-serif text-sm font-semibold">
                      Accessibility Profile
                    </h2>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Active Modules</p>
                      <div className="flex flex-wrap gap-1">
                        {activeModules.map((m) => (
                          <Badge
                            key={m}
                            variant="secondary"
                            className="no-default-active-elevate text-xs"
                            data-testid={`chip-module-${m.toLowerCase()}`}
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DisabilityChips disabilities={user?.disabilities ?? []} size="small" />
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="text-xs w-full" data-testid="link-edit-profile">
                        Edit Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </section>

              <section aria-labelledby="assessments-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="assessments-heading" className="font-serif text-sm font-semibold">
                      Upcoming Assessments
                    </h2>
                    {(!upcomingAssessments || upcomingAssessments.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                        <span className="text-3xl">✅</span>
                        <p className="text-sm font-medium">All clear!</p>
                        <p className="text-xs">No upcoming assessments right now.</p>
                      </div>
                    ) : (
                    upcomingAssessments.map((a: any) => {
                      const co = enrolled.find((c: any) => c.id === a.courseOfferingId);
                      const days = getDaysUntil(a.dueDate);
                      return (
                        <Link key={a.id} href={`/student/assessments/${a.id}`}>
                          <div
                            className="flex items-center justify-between gap-2 rounded-md p-2 hover-elevate"
                            data-testid={`row-assessment-${a.id}`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{a.title}</p>
                              <p className="text-xs text-muted-foreground">{co?.course?.code ?? ""}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`no-default-active-elevate text-[11px] shrink-0 ${days <= 2 ? "text-destructive border-destructive/30" : ""
                                }`}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {days <= 0 ? "Due today" : `${days}d left`}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })
                    )}
                  </CardContent>
                </Card>
              </section>

              <section aria-labelledby="announcements-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="announcements-heading" className="font-serif text-sm font-semibold">
                      Announcements
                    </h2>
                    {(!recentAnnouncements || recentAnnouncements.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                        <span className="text-3xl">📢</span>
                        <p className="text-sm font-medium">No announcements</p>
                        <p className="text-xs">Your teachers haven't posted any announcements yet.</p>
                      </div>
                    ) : (
                    recentAnnouncements.map((a: any) => (
                      <div
                        key={a.id}
                        className={`rounded-md p-2 text-sm ${a.urgent ? "border-l-2 border-l-[#C07B1A] bg-[#FFF3E0]/30 pl-3" : ""}`}
                        role={a.urgent ? "alert" : "status"}
                        data-testid={`row-announcement-${a.id}`}
                      >
                        <div className="flex items-start gap-2">
                          {a.urgent && <AlertTriangle className="h-3.5 w-3.5 text-[#C07B1A] mt-0.5 shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-medium text-xs">{a.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {a.senderName} · {formatTimeAgo(a.publishedAt || a.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                    <Link href="/announcements">
                      <Button variant="ghost" size="sm" className="text-xs w-full" data-testid="link-view-announcements">
                        View All Announcements
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
