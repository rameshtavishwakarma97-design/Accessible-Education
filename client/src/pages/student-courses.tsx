import { useState } from "react";
import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export default function StudentCourses() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "core" | "elective">("all");

  const { data: myCourses, isLoading, error } = useQuery({
    queryKey: ["student-courses"],
    queryFn: () => fetchWithAuth("/api/me/courses"),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="My Courses" breadcrumb="B.Tech CS > Year 3 > Spring 2026" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  const enrolled: any[] = myCourses ?? [];
  const filtered = enrolled.filter((co: any) => {
    if (filter === "core") return co.enrollmentType === "admin_assigned";
    if (filter === "elective") return co.enrollmentType === "student_selected";
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="My Courses" breadcrumb="B.Tech CS > Year 3 > Spring 2026" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center gap-2">
            {(["all", "core", "elective"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "secondary"} size="sm" onClick={() => setFilter(f)} data-testid={`button-filter-${f}`}>
                {f === "all" ? "All Courses" : f === "core" ? "Core" : "Elective"}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((co: any) => (
              <Link key={co.id} href={`/student/courses/${co.id}`}>
                <Card className="hover-elevate h-full" data-testid={`card-course-${co.id}`}>
                  <CardContent className="p-5 space-y-3 h-full flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">
                        {co.course?.code}
                      </Badge>
                      {co.enrollmentType === "admin_assigned" ? (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#EEF5FB] text-[#355872]">Core</Badge>
                      ) : (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#F0F9F4] text-[#2E8B6E]">Elective</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">{co.course?.name}</h3>
                    <p className="text-xs text-muted-foreground flex-1">{co.course?.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Spring {co.year || new Date().getFullYear()} · Div {(co.divisions || []).join(", ")} · {co.teachers?.[0]?.name}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{co.progress || 0}%</span>
                      </div>
                      <Progress value={co.progress || 0} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">No courses found</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
