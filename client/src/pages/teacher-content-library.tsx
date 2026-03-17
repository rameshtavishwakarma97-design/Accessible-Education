import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { TopBar } from "@/components/top-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, AlertTriangle, Trash2, Loader2, Eye, Users, Link2, RotateCcw } from "lucide-react";
import { FormatChips, StatusChip } from "@/components/disability-chips";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

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

export default function TeacherContentLibrary() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [impact, setImpact] = useState<{ 
    viewCount: number; 
    progressCount: number; 
    linkedAssessments: string[] 
  } | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);

  const openDeleteModal = async (item: any) => {
    setDeleteTarget(item);
    setImpactLoading(true);
    setImpact(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/content/${item.id}/impact`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setImpact(data);
    } catch {
      setImpact({ viewCount: 0, progressCount: 0, linkedAssessments: [] });
    } finally {
      setImpactLoading(false);
    }
  };

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/content/${id}/soft-delete`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-all-content'] });
      toast({ title: '🗑️ Moved to Trash', description: 'Content removed from student view. You can restore it within 30 days.' });
      setDeleteTarget(null);
      setImpact(null);
    },
    onError: () => {
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' });
    },
  });

  const { data: contentData, isLoading } = useQuery({
    queryKey: ["teacher-all-content", user?.id],
    queryFn: () => fetchWithAuth(`/api/content?uploadedBy=${user!.id}`),
    enabled: !!user,
  });

  const allContent: any[] = contentData ?? [];
  const filtered = allContent.filter((ci) =>
    ci.title?.toLowerCase().includes(search.toLowerCase())
  );

  const { data: trashData } = useQuery({
    queryKey: ["teacher-trash-content", user?.id],
    queryFn: () => fetchWithAuth(`/api/content?uploadedBy=${user!.id}&publishStatus=soft_deleted`),
    enabled: !!user,
  });
  const trashItems: any[] = trashData ?? [];

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/content/${id}/restore`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to restore');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-all-content'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-trash-content'] });
      toast({ title: 'Restored', description: 'Content has been restored and is visible to students again.' });
    },
    onError: () => {
      toast({ title: 'Restore failed', description: 'Please try again.', variant: 'destructive' });
    },
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Content Library" breadcrumb="All uploaded content" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <Tabs defaultValue="library">
            <TabsList className="mb-2">
              <TabsTrigger value="library">
                Library
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {allContent.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="trash">
                Trash
                {trashItems.length > 0 && (
                  <span className="ml-1.5 text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full">
                    {trashItems.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── LIBRARY TAB ── */}
            <TabsContent value="library" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Loading content...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <span className="text-4xl">{search ? '🔍' : '📁'}</span>
                  <p className="text-sm font-medium text-foreground">
                    {search ? 'No results found' : 'No content uploaded yet'}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {search
                      ? `No content matches "${search}". Try a different keyword.`
                      : 'Upload a PDF or document to get started. Accessible formats will be generated automatically.'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left font-medium p-3">Title</th>
                        <th className="text-left font-medium p-3 hidden sm:table-cell">Course</th>
                        <th className="text-left font-medium p-3 hidden md:table-cell">Formats</th>
                        <th className="text-left font-medium p-3">Status</th>
                        <th className="text-left font-medium p-3 hidden md:table-cell">Uploaded</th>
                        <th className="text-left font-medium p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((ci: any, i: number) => (
                        <tr
                          key={ci.id}
                          className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""}`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="font-medium truncate max-w-[200px]">{ci.title}</span>
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">
                            {ci.courseName || "—"}
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <FormatChips
                              formats={ci.formats || []}
                              size="small"
                              statuses={{
                                transcript:    ci.transcriptStatus   || 'PENDING',
                                simplified:    ci.simplifiedStatus   || 'PENDING',
                                audio:         ci.audioStatus        || 'PENDING',
                                high_contrast: ci.highContrastStatus || 'PENDING',
                                braille:       ci.brailleStatus      || 'PENDING',
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <StatusChip status={ci.publishStatus} />
                          </td>
                          <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                            {formatTimeAgo(ci.createdAt)}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteModal(ci)}
                              aria-label={`Delete ${ci.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ── TRASH TAB ── */}
            <TabsContent value="trash">
              {trashItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <span className="text-4xl">🗑️</span>
                  <p className="text-sm font-medium">Trash is empty</p>
                  <p className="text-xs text-muted-foreground">
                    Deleted content appears here for 30 days before permanent removal.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trashItems.map((ci: any) => {
                    const daysLeft = ci.permanentDeleteScheduledAt
                      ? Math.max(0, Math.ceil(
                          (new Date(ci.permanentDeleteScheduledAt).getTime()
                           - Date.now()) / 86400000
                        ))
                      : 30;
                    return (
                      <div key={ci.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {ci.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Deleted {ci.deletedAt
                              ? formatTimeAgo(ci.deletedAt)
                              : 'recently'} ·{' '}
                            <span className={daysLeft <= 7
                              ? 'text-destructive font-medium' : ''}>
                              {daysLeft} days until permanent deletion
                            </span>
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-3 shrink-0"
                          disabled={restoreMutation.isPending}
                          onClick={() => restoreMutation.mutate(ci.id)}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Restore
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Impact Delete Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) { setDeleteTarget(null); setImpact(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Move to Trash?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              will be hidden from students immediately and
              permanently deleted after 30 days.
            </p>

            {impactLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking impact...
              </div>
            ) : impact && (
              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Impact Summary
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {impact.viewCount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Total views
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {impact.progressCount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      In progress
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {impact.linkedAssessments?.length ?? 0}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Assessments
                    </span>
                  </div>
                </div>
                {(impact.linkedAssessments?.length ?? 0) > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Linked assessments may break if this is deleted.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline"
              onClick={() => { setDeleteTarget(null); setImpact(null); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={softDeleteMutation.isPending || impactLoading}
              onClick={() => softDeleteMutation.mutate(deleteTarget.id)}
            >
              {softDeleteMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Moving...</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" />Move to Trash</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
