import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to load data`);
  return res.json();
}

async function postWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Action failed");
  }
  return res.json();
}

function getProgressValue(status: string): number {
  switch (status) {
    case 'pending':     return 10;
    case 'processing':  return 55;
    case 'ready_for_review': return 85;
    case 'completed':
    case 'approved':    return 100;
    case 'failed':      return 100;
    default:            return 0;
  }
}

function getProgressColor(status: string): string {
  if (status === 'failed')  return 'bg-destructive';
  if (status === 'approved' || status === 'completed') 
    return 'bg-green-500';
  return 'bg-primary';
}

export default function TeacherConversions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "braille" | "simplified" | "audio" | "captions">("all");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ["teacher-conversions"],
    queryFn: () => fetchWithAuth("/api/conversions/my-queue"),
    enabled: !!user,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      const jobs = data?.jobs ?? data ?? [];
      const hasActive = Array.isArray(jobs) && jobs.some(
        (j: any) => j.status === 'pending' || j.status === 'processing'
      );
      return hasActive ? 4000 : false;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (jobId: string) => postWithAuth(`/api/conversions/${jobId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
      setSelectedJob(null);
      toast({ title: "Conversion approved", description: "Format published to students." });
    },
    onError: (err: Error) => {
      toast({ title: "Approval failed", description: err.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (jobId: string) => postWithAuth(`/api/conversions/${jobId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
      setSelectedJob(null);
      toast({ title: "Conversion rejected", description: "The conversion will be re-queued." });
    },
    onError: (err: Error) => {
      toast({ title: "Rejection failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Conversion Queue" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading conversion queue…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Conversion Queue" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive font-medium">Could not load conversion queue</p>
            <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        </main>
      </div>
    );
  }

  const allJobs: any[] = jobsData ?? [];
  const filtered = filter === "all" ? allJobs : allJobs.filter((j: any) => j.formatType === filter);
  const selected = allJobs.find((j: any) => j.id === selectedJob);
  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Conversion Queue" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {Array.isArray(jobsData?.jobs ?? jobsData) && 
             (jobsData?.jobs ?? jobsData).some(
               (j: any) => j.status === 'pending' || j.status === 'processing'
             ) && (
              <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Processing
              </span>
            )}
            {(["all", "braille", "simplified", "audio", "captions"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "secondary"} size="sm" onClick={() => setFilter(f)} data-testid={`button-filter-${f}`}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-md border">
                <table className="w-full" aria-label="Conversion jobs">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Content</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Course</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Format</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Status</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Updated</th>
                      <th scope="col" className="text-right text-xs font-medium p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((j: any, i: number) => (
                      <tr
                        key={j.id}
                        className={`border-b cursor-pointer ${selectedJob === j.id ? "bg-accent" : i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}
                        onClick={() => setSelectedJob(j.id)}
                        data-testid={`row-job-${j.id}`}
                      >
                        <td className="p-3 text-sm font-medium">{j.contentTitle}</td>
                        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{j.courseName}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="no-default-active-elevate text-[11px] capitalize">{(j.formatType || "").replace("_", " ")}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <StatusChip status={j.status} />
                            <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${getProgressColor(j.status)}`}
                                style={{ width: `${getProgressValue(j.status)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{formatTimeAgo(j.updatedAt || j.createdAt)}</td>
                        <td className="p-3 text-right">
                          {j.status === "ready_for_review" && (
                            <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-review-${j.id}`}>Review</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No conversion jobs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              {selected ? (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm capitalize">{(selected.formatType || "").replace("_", " ")} Preview</h3>
                    <div className="rounded-md bg-accent p-4 text-sm">
                      {selected.formatType === "braille" ? (
                        <div className="font-mono text-base leading-relaxed">
                          ⠠⠊⠝⠞⠗⠕⠙⠥⠉⠞⠊⠕⠝ ⠞⠕ ⠠⠝⠑⠥⠗⠁⠇ ⠠⠝⠑⠞⠺⠕⠗⠅⠎
                        </div>
                      ) : selected.formatType === "simplified" ? (
                        <div className="leading-relaxed">
                          <p className="font-medium">Simplified Version:</p>
                          <p className="mt-2">A neural network is a computer system that learns from data. It works like the human brain. It has layers of connected parts called nodes.</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Preview not available for this format type.</p>
                      )}
                    </div>
                    {selected.status === "failed" && selected.errorMessage && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {selected.errorMessage}
                      </div>
                    )}
                    {selected.status === "ready_for_review" && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          className="flex-1 gap-1"
                          disabled={isMutating}
                          onClick={() => rejectMutation.mutate(selected.id)}
                          data-testid="button-reject"
                        >
                          {rejectMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                          {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                        </Button>
                        <Button
                          className="flex-1 gap-1"
                          disabled={isMutating}
                          onClick={() => approveMutation.mutate(selected.id)}
                          data-testid="button-approve"
                        >
                          {approveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          {approveMutation.isPending ? "Approving..." : "Approve"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    Click a row to preview the conversion
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
