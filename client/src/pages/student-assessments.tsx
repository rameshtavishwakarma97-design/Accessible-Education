import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight, Loader2 } from "lucide-react";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export default function StudentAssessments() {
  const { user } = useAuth();

  const { data: myCourses } = useQuery({
    queryKey: ["student-courses"],
    queryFn: () => fetchWithAuth("/api/me/courses"),
    enabled: !!user,
  });

  // Fetch assessments for all enrolled courses
  const courseIds = (myCourses || []).map((c: any) => c.id);
  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ["student-assessments", courseIds],
    queryFn: async () => {
      const all = await Promise.all(
        courseIds.map((coId: string) =>
          fetchWithAuth(`/api/assessments?courseOfferingId=${coId}`).catch(() => [])
        )
      );
      return all.flat();
    },
    enabled: !!user && courseIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Assessments" breadcrumb="B.Tech CS > Year 3 > Spring 2026" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  const assessments: any[] = assessmentsData ?? [];
  const courses: any[] = myCourses ?? [];
  const upcoming = assessments.filter((a: any) => a.status === "upcoming" || a.status === "in_progress");
  const past = assessments.filter((a: any) => a.status === "completed" || a.status === "graded");

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Assessments" breadcrumb="B.Tech CS > Year 3 > Spring 2026" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[900px] space-y-6">
          <section>
            <h2 className="font-serif text-lg font-semibold mb-4">Upcoming & In Progress</h2>
            <div className="space-y-3">
              {upcoming.map((a: any) => {
                const co = courses.find((c: any) => c.id === a.courseOfferingId);
                const days = getDaysUntil(a.dueDate);
                return (
                  <Link key={a.id} href={`/student/assessments/${a.id}`}>
                    <Card className="hover-elevate" data-testid={`card-assessment-${a.id}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">{co?.course?.code}</Badge>
                            <h3 className="text-sm font-medium">{a.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {a.type} · {a.questionCount} questions · {a.durationMinutes} min (x2.0 = {a.durationMinutes * 2} min)
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusChip status={a.status} />
                          <Badge
                            variant="outline"
                            className={`no-default-active-elevate text-[11px] ${days <= 2 ? "text-destructive border-destructive/30" : ""}`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {days <= 0 ? "Due today" : `${days}d left`}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming assessments</p>}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold mb-4">Completed</h2>
            <div className="space-y-3">
              {past.map((a: any) => {
                const co = courses.find((c: any) => c.id === a.courseOfferingId);
                return (
                  <Card key={a.id} data-testid={`card-assessment-${a.id}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">{co?.course?.code}</Badge>
                          <h3 className="text-sm font-medium">{a.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{a.type} · {a.questionCount} questions</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusChip status={a.status} />
                        {a.score !== undefined && (
                          <Badge variant="outline" className="no-default-active-elevate text-xs font-medium">
                            {a.score}/{a.maxScore}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {past.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No completed assessments</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
