import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Users, FileText, CheckCircle, AlertCircle, Clock, Loader2, X, Lightbulb } from "lucide-react";

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

async function fetchTeacherDashboard() {
  const token = localStorage.getItem("auth_token");
  const res = await fetch("/api/teacher/dashboard", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load teacher dashboard");
  return res.json();
}

async function fetchMyContent() {
  const token = localStorage.getItem("auth_token");
  // First get the current user ID, then fetch their content
  const meRes = await fetch("/api/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!meRes.ok) throw new Error("Failed to load user");
  const me = await meRes.json();

  const res = await fetch(`/api/content?uploadedBy=${me.id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load content");
  return res.json();
}

async function fetchConversionJobs() {
  const token = localStorage.getItem("auth_token");
  const res = await fetch("/api/conversions/my-queue", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load conversions");
  return res.json();
}

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: dashData, isLoading: dashLoading, error: dashError } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: fetchTeacherDashboard,
    enabled: !!user,
  });

  const { data: contentData } = useQuery({
    queryKey: ["teacher-content"],
    queryFn: fetchMyContent,
    enabled: !!user,
  });

  const { data: conversionData } = useQuery({
    queryKey: ["teacher-conversions"],
    queryFn: fetchConversionJobs,
    enabled: !!user,
  });

  const [showHint, setShowHint] = useState(() => {
    return localStorage.getItem('teacher_onboarding_dismissed') !== 'true';
  });

  const dismissHint = () => {
    localStorage.setItem('teacher_onboarding_dismissed', 'true');
    setShowHint(false);
  };

  if (dashLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Teaching Overview" breadcrumb="Loading..." />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading your dashboard…</p>
          </div>
        </main>
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Teaching Overview" breadcrumb="" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive font-medium">Could not load dashboard data</p>
            <p className="text-xs text-muted-foreground">{(dashError as Error).message}</p>
          </div>
        </main>
      </div>
    );
  }

  const teacherOfferings = dashData?.courses ?? [];
  const allContent: any[] = contentData ?? [];
  const recentContent = allContent.slice(0, 5);

  // Conversion queue stats from the dedicated endpoint
  const conversionQueue: any[] = conversionData ?? [];
  const pendingReviews = conversionQueue.filter((j: any) => j.status === "ready_for_review");
  const inProgress = conversionQueue.filter((j: any) => j.status === "in_progress");
  const brailleCount = pendingReviews.filter((j: any) => j.formatType === "braille").length;
  const simplifiedCount = pendingReviews.filter((j: any) => j.formatType === "simplified").length;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Teaching Overview" breadcrumb="Spring 2026" />
      {showHint && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Getting started as a teacher
            </p>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5 list-disc list-inside">
              <li>Upload a PDF or document from your Course page</li>
              <li>Accessible formats (audio, simplified, high contrast) are generated automatically</li>
              <li>Review simplified text before it goes live to students</li>
              <li>Track conversion progress from the Conversions page</li>
            </ul>
          </div>
          <button
            onClick={dismissHint}
            className="text-amber-400 hover:text-amber-600 dark:text-amber-500 shrink-0"
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
                  <h2 id="my-courses-heading" className="font-serif text-lg font-semibold">My Courses</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(!teacherOfferings || teacherOfferings.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center text-muted-foreground">
                      <span className="text-3xl">🎓</span>
                      <p className="text-sm font-medium">No courses yet</p>
                      <p className="text-xs max-w-xs">
                        You haven't been assigned to any courses. 
                        Contact your admin to get started.
                      </p>
                    </div>
                  ) : (
                  teacherOfferings.map((co: any) => (
                    <Link key={co.id} href={`/teacher/courses/${co.id}`}>
                      <Card className="hover-elevate" data-testid={`card-course-${co.id}`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">{co.course?.code}</Badge>
                            <h3 className="text-sm font-semibold">{co.course?.name}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono tracking-tight"><Users className="h-3 w-3" /> {co.studentCount ?? 0} students</span>
                            <span className="font-mono">Div {(co.divisions || []).join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono tracking-tight"><FileText className="h-3 w-3" /> {co.contentCount ?? 0} content items</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                  )}
                </div>
              </section>

              <section aria-labelledby="recent-content-heading">
                <h2 id="recent-content-heading" className="font-serif text-lg font-semibold mb-4">Recent Content Activity</h2>
                <div className="space-y-2">
                  {(!recentContent || recentContent.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                      <span className="text-3xl">📂</span>
                      <p className="text-sm font-medium">No content uploaded yet</p>
                      <p className="text-xs">
                        Upload your first document from the Content Library.
                      </p>
                    </div>
                  ) : (
                  recentContent.map((ci: any) => {
                    const co = teacherOfferings.find((c: any) => c.id === ci.courseOfferingId);
                    const convProgress = ci.conversionProgress || {};
                    return (
                      <div key={ci.id} className="flex items-center justify-between gap-3 rounded-md border bg-card p-3" data-testid={`row-content-${ci.id}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{ci.title}</p>
                          <p className="text-xs text-muted-foreground">{co?.course?.code ?? ""} · Uploaded {formatTimeAgo(ci.uploadedAt || ci.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            {convProgress.tier1 === "completed" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#2E8B6E]"><CheckCircle className="h-3 w-3" /> T1</span>
                            ) : convProgress.tier1 === "in_progress" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#C07B1A]"><Loader2 className="h-3 w-3 animate-spin" /> T1</span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> T1</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {convProgress.tier2 === "completed" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#2E8B6E]"><CheckCircle className="h-3 w-3" /> T2</span>
                            ) : convProgress.tier2 === "ready_for_review" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#355872]"><Clock className="h-3 w-3" /> T2</span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-xs text-[#C07B1A]"><Loader2 className="h-3 w-3 animate-spin" /> T2</span>
                            )}
                          </div>
                          <StatusChip status={ci.publishStatus} />
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section aria-labelledby="conversion-queue-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="conversion-queue-heading" className="font-serif text-sm font-semibold">Conversion Queue</h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-md bg-accent text-sm">
                        <span>Braille</span>
                        <Badge className="no-default-active-elevate text-xs bg-[#9CD5FF] text-[#355872]">{brailleCount} pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-accent text-sm">
                        <span>Simplified Text</span>
                        <Badge className="no-default-active-elevate text-xs bg-[#9CD5FF] text-[#355872]">{simplifiedCount} pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-accent text-sm">
                        <span>In Progress</span>
                        <Badge variant="outline" className="no-default-active-elevate text-xs">{inProgress.length} jobs</Badge>
                      </div>
                    </div>
                    <Link href="/teacher/conversions">
                      <Button variant="ghost" size="sm" className="text-xs w-full gap-1" data-testid="link-review-queue">
                        Review Queue <ArrowRight className="h-3 w-3" />
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
