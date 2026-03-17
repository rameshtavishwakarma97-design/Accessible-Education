import { useState } from "react";
import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, Plus, UserPlus, UserMinus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export default function AdminCourses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedOffering, setSelectedOffering] = useState<any>(null);
  const [teacherSearch, setTeacherSearch] = useState("");

  const { data: offeringsData, isLoading } = useQuery({
    queryKey: ["admin-course-offerings"],
    queryFn: () => fetchWithAuth("/api/course-offerings"),
    enabled: !!user,
  });

  // Fetch all teachers for assignment modal
  const { data: allTeachers } = useQuery({
    queryKey: ["admin-all-teachers"],
    queryFn: () => fetchWithAuth("/api/admin/users?role=teacher"),
    enabled: !!selectedOffering,
  });

  // Assign teacher mutation
  const assignMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `/api/admin/courses/${selectedOffering.id}/teachers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ teacherId }),
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to assign teacher");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["admin-course-offerings"] 
      });
      // Optimistically update selectedOffering teachers list
      setSelectedOffering((prev: any) => {
        const teacher = (allTeachers as any[])?.find(
          (t: any) => assignMutation.variables === t.id
        );
        if (!teacher) return prev;
        return {
          ...prev,
          teachers: [...(prev.teachers || []), teacher],
        };
      });
      toast({ title: "\u2705 Teacher assigned successfully" });
    },
    onError: (e: any) => toast({ 
      title: "\u274c Failed", 
      description: e.message, 
      variant: "destructive" 
    }),
  });

  // Remove teacher mutation
  const removeMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `/api/admin/courses/${selectedOffering.id}/teachers/${teacherId}`,
        {
          method: "DELETE",
          headers: token 
            ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to remove teacher");
      }
    },
    onSuccess: (_, teacherId) => {
      queryClient.invalidateQueries({ 
        queryKey: ["admin-course-offerings"] 
      });
      setSelectedOffering((prev: any) => ({
        ...prev,
        teachers: (prev.teachers || []).filter(
          (t: any) => t.id !== teacherId
        ),
      }));
      toast({ title: "\u2705 Teacher removed" });
    },
    onError: (e: any) => toast({ 
      title: "\u274c Failed", 
      description: e.message, 
      variant: "destructive" 
    }),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Course Management" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  const courseOfferings: any[] = offeringsData ?? [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Course Management" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{courseOfferings.length} course offerings this term</p>
            <Button size="sm" className="gap-1" data-testid="button-add-course"><Plus className="h-3.5 w-3.5" /> Add Course</Button>
          </div>
          <div className="rounded-md border">
            <table className="w-full" aria-label="Course offerings">
              <thead>
                <tr className="border-b bg-primary text-primary-foreground">
                  <th scope="col" className="text-left text-xs font-medium p-3">Course</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Term</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Divisions</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Teachers</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Students</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden lg:table-cell">Type</th>
                  <th scope="col" className="text-right text-xs font-medium p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseOfferings.map((co: any, i: number) => (
                  <tr key={co.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-course-${co.id}`}>
                    <td className="p-3">
                      <p className="text-sm font-medium">{co.course?.code} {co.course?.name}</p>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">Spring {co.year || new Date().getFullYear()}</td>
                    <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{(co.divisions || []).join(", ")}</td>
                    <td className="p-3 text-xs">{(co.teachers || []).map((t: any) => t.name).join(", ")}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-sm"><Users className="h-3 w-3 text-muted-foreground" /> {co.studentCount}</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {co.enrollmentType === "admin_assigned" ? (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#EEF5FB] text-[#355872]">Core</Badge>
                      ) : (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#F0F9F4] text-[#2E8B6E]">Elective</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        data-testid={`button-manage-teachers-${co.id}`}
                        onClick={() => setSelectedOffering(co)}
                      >
                        <UserPlus className="h-3 w-3" />
                        Teachers
                        {(co.teachers || []).length > 0 && (
                          <span className="ml-1 rounded-full bg-primary/10 
                                         text-primary text-[10px] px-1.5">
                            {co.teachers.length}
                          </span>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {courseOfferings.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No course offerings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Teacher Assignment Modal ─────────────────── */}
      <Dialog
        open={!!selectedOffering}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOffering(null);
            setTeacherSearch("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Manage Teachers</DialogTitle>
            <DialogDescription>
              {selectedOffering?.course?.code}{" "}
              {selectedOffering?.course?.name}
              {" — "}Spring {selectedOffering?.year 
                || new Date().getFullYear()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">

            {/* Currently assigned */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground 
                            uppercase tracking-wide mb-2">
                Assigned ({(selectedOffering?.teachers || []).length})
              </p>
              {(selectedOffering?.teachers || []).length === 0 ? (
                <p className="text-sm text-muted-foreground 
                              italic py-2">
                  No teachers assigned yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {(selectedOffering?.teachers || []).map((t: any) => (
                    <div key={t.id}
                      className="flex items-center justify-between 
                                 rounded-lg border px-3 py-2 bg-muted/30"
                    >
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.email}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMutation.mutate(t.id)}
                        disabled={removeMutation.isPending}
                        className="p-1.5 rounded-md text-destructive 
                                   hover:bg-destructive/10 transition"
                        aria-label={`Remove ${t.name}`}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Add new teacher */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground 
                            uppercase tracking-wide mb-2">
                Add Teacher
              </p>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full rounded-md border bg-background 
                           px-3 py-2 text-sm mb-2 
                           focus:outline-none focus:ring-2 
                           focus:ring-primary/30"
                aria-label="Search teachers"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {((allTeachers as any[]) || [])
                  .filter((t: any) => {
                    // Hide already assigned
                    const assigned = (selectedOffering?.teachers || [])
                      .map((a: any) => a.id);
                    if (assigned.includes(t.id)) return false;
                    // Apply search filter
                    const q = teacherSearch.toLowerCase();
                    return !q
                      || t.name?.toLowerCase().includes(q)
                      || t.email?.toLowerCase().includes(q);
                  })
                  .map((t: any) => (
                    <div key={t.id}
                      className="flex items-center justify-between 
                                 rounded-lg border px-3 py-2 
                                 hover:bg-muted/40 transition"
                    >
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.email}
                        </p>
                      </div>
                      <button
                        onClick={() => assignMutation.mutate(t.id)}
                        disabled={assignMutation.isPending}
                        className="text-xs px-3 py-1 rounded-md 
                                   bg-primary text-primary-foreground 
                                   hover:bg-primary/90 transition
                                   disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                {((allTeachers as any[]) || []).filter((t: any) => {
                  const assigned = (selectedOffering?.teachers || [])
                    .map((a: any) => a.id);
                  return !assigned.includes(t.id);
                }).length === 0 && (
                  <p className="text-sm text-muted-foreground 
                                italic py-2 text-center">
                    All available teachers are assigned.
                  </p>
                )}
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
