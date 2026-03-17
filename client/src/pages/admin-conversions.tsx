import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Loader2 } from "lucide-react";

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
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export default function AdminConversions() {
  const { user } = useAuth();

  const { data: conversionsData, isLoading } = useQuery({
    queryKey: ["admin-conversions"],
    queryFn: () => fetchWithAuth("/api/admin/conversions"),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="System Conversions" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  const rawList: any[] = conversionsData ?? [];
  const conversionJobs: any[] = rawList;
  const byStatus = {
    ready_for_review: rawList.filter((j) => j.status === 'ready_for_review' || j.status === 'READYFORREVIEW'),
    in_progress:      rawList.filter((j) => j.status === 'in_progress'      || j.status === 'IN_PROGRESS' || j.status === 'converting'),
    completed:        rawList.filter((j) => j.status === 'completed'         || j.status === 'COMPLETED'),
    failed:           rawList.filter((j) => j.status === 'failed'            || j.status === 'FAILED'),
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="System Conversions" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {([
              { label: "Pending Review", count: byStatus.ready_for_review.length, color: "text-[#355872] bg-[#EBF4FB]" },
              { label: "In Progress", count: byStatus.in_progress.length, color: "text-[#C07B1A] bg-[#FFF3E0]" },
              { label: "Completed", count: byStatus.completed.length, color: "text-[#2E8B6E] bg-[#E8F5E9]" },
              { label: "Failed", count: byStatus.failed.length, color: "text-destructive bg-destructive/10" },
            ]).map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold font-serif mt-1 ${s.color.split(" ")[0]}`}>{s.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-md border">
            <table className="w-full" aria-label="All conversion jobs">
              <thead>
                <tr className="border-b bg-primary text-primary-foreground">
                  <th scope="col" className="text-left text-xs font-medium p-3">Content</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Course</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Format</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Teacher</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Status</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Updated</th>
                  <th scope="col" className="text-right text-xs font-medium p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {conversionJobs.map((j: any, i: number) => (
                  <tr key={j.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-conv-${j.id}`}>
                    <td className="p-3 text-sm font-medium">{j.contentTitle}</td>
                    <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{j.courseName}</td>
                    <td className="p-3"><Badge variant="outline" className="no-default-active-elevate text-[11px] capitalize">{(j.formatType || "").replace("_", " ")}</Badge></td>
                    <td className="p-3 text-xs">{j.teacherName}</td>
                    <td className="p-3"><StatusChip status={j.status} /></td>
                    <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{formatTimeAgo(j.updatedAt || j.createdAt)}</td>
                    <td className="p-3 text-right">
                      {j.status === "failed" && (
                        <Button variant="ghost" size="sm" className="text-xs gap-1" data-testid={`button-retry-${j.id}`}>
                          <RefreshCw className="h-3 w-3" /> Retry
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {conversionJobs.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No conversion jobs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
