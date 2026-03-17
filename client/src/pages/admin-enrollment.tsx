import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Users, Upload, UserPlus, Loader2, Info } from "lucide-react";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export default function AdminEnrollment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("core");

  // ─── Bulk enroll modal state ────────────────────────────────────────────────
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollOfferingId, setEnrollOfferingId] = useState("");

  const { data: offeringsData, isLoading, error } = useQuery({
    queryKey: ["admin-course-offerings"],
    queryFn: () => fetchWithAuth("/api/course-offerings"),
    enabled: !!user,
  });

  const bulkEnrollMutation = useMutation({
    mutationFn: async (courseOfferingId: string) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/enrollment/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ courseOfferingId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Enrollment failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-offerings"] });
      toast({ title: "Cohort enrolled", description: `${data.enrolledCount} students enrolled successfully.` });
      setEnrollModalOpen(false);
      setEnrollOfferingId("");
    },
    onError: (err: Error) => {
      toast({ title: "Enrollment failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Enrollment Management" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Enrollment Management" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        </main>
      </div>
    );
  }

  const offerings: any[] = offeringsData ?? [];
  const coreOfferings = offerings.filter((co: any) => co.enrollmentType === "admin_assigned");
  const electiveOfferings = offerings.filter((co: any) => co.enrollmentType === "student_selected");
  // If none have enrollmentType set, show all in core
  const displayCore = coreOfferings.length > 0 ? coreOfferings : offerings;
  const displayElective = electiveOfferings;

  const waitlistData = [
    { student: "Neha Verma", course: "CS305 AI", position: 1, status: "waitlisted" },
    { student: "Amit Sharma", course: "CS305 AI", position: 2, status: "waitlisted" },
    { student: "Deepak Jain", course: "CS304 Software Eng.", position: 3, status: "waitlisted" },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Enrollment Management" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList data-testid="tabs-enrollment">
              <TabsTrigger value="core" data-testid="tab-core">Core Enrollments</TabsTrigger>
              <TabsTrigger value="elective" data-testid="tab-elective">Elective Enrollments</TabsTrigger>
              <TabsTrigger value="waitlists" data-testid="tab-waitlists">Waitlists</TabsTrigger>
              <TabsTrigger value="bulk" data-testid="tab-bulk">Bulk Import</TabsTrigger>
            </TabsList>

            {/* ─── Core Enrollments ──────────────────────────────────────── */}
            <TabsContent value="core" className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground">Core courses assigned by administration</p>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => setEnrollModalOpen(true)}
                  data-testid="button-bulk-enroll"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Bulk Enroll Cohort
                </Button>
              </div>
              {displayCore.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                    <p>No core course offerings found.</p>
                    <p className="text-xs mt-2">Use "Bulk Enroll Cohort" to assign students to courses.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full" aria-label="Core enrollments">
                    <thead>
                      <tr className="border-b bg-primary text-primary-foreground">
                        <th scope="col" className="text-left text-xs font-medium p-3">Course Offering</th>
                        <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Term</th>
                        <th scope="col" className="text-left text-xs font-medium p-3">Enrolled</th>
                        <th scope="col" className="text-left text-xs font-medium p-3">Capacity</th>
                        <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">% Filled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCore.map((co: any, i: number) => {
                        const pct = co.capacity ? Math.round((co.studentCount / co.capacity) * 100) : 0;
                        return (
                          <tr key={co.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-enrollment-${co.id}`}>
                            <td className="p-3">
                              <div>
                                <p className="text-sm font-medium">{co.course?.code} {co.course?.name}</p>
                                <p className="text-xs text-muted-foreground">Div {(co.divisions || []).join(", ")}</p>
                              </div>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">Spring {co.year || new Date().getFullYear()}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{co.studentCount}</span></div>
                            </td>
                            <td className="p-3 text-sm">{co.capacity}</td>
                            <td className="p-3 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className={`h-1.5 w-20 ${pct > 90 ? "[&>div]:bg-destructive" : ""}`} />
                                <span className={`text-xs ${pct > 90 ? "text-destructive font-medium" : "text-muted-foreground"}`}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ─── Elective Enrollments ──────────────────────────────────── */}
            <TabsContent value="elective" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Student-selected elective courses</p>
              {displayElective.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                    No elective enrollments found.
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full" aria-label="Elective enrollments">
                    <thead>
                      <tr className="border-b bg-primary text-primary-foreground">
                        <th scope="col" className="text-left text-xs font-medium p-3">Course</th>
                        <th scope="col" className="text-left text-xs font-medium p-3">Enrolled</th>
                        <th scope="col" className="text-left text-xs font-medium p-3">Capacity</th>
                        <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayElective.map((co: any, i: number) => {
                        const pct = co.capacity ? Math.round((co.studentCount / co.capacity) * 100) : 0;
                        return (
                          <tr key={co.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}>
                            <td className="p-3">
                              <p className="text-sm font-medium">{co.course?.code} {co.course?.name}</p>
                            </td>
                            <td className="p-3 text-sm">{co.studentCount}</td>
                            <td className="p-3 text-sm">{co.capacity}</td>
                            <td className="p-3 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="h-1.5 w-20" />
                                <span className="text-xs text-muted-foreground">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ─── Waitlists ────────────────────────────────────────────── */}
            <TabsContent value="waitlists" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Students waiting for enrollment in capacity-limited courses</p>
              <div className="rounded-md border">
                <table className="w-full" aria-label="Waitlists">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">#</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Student</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Course</th>
                      <th scope="col" className="text-right text-xs font-medium p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistData.map((w, i) => (
                      <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}>
                        <td className="p-3 text-sm font-mono">{w.position}</td>
                        <td className="p-3 text-sm">{w.student}</td>
                        <td className="p-3 text-sm">{w.course}</td>
                        <td className="p-3 text-right">
                          <Button variant="secondary" size="sm" className="text-xs" data-testid={`button-promote-${i}`}>Promote</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* ─── Bulk Import (Coming Soon) ─────────────────────────────── */}
            <TabsContent value="bulk" className="mt-4">
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-serif text-lg font-semibold">Bulk Import Enrollment</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Upload a CSV file with enrollment data from your SIS/ERP system.
                      The file will be validated before processing.
                    </p>
                    <Button
                      className="gap-1 opacity-60 cursor-not-allowed"
                      disabled
                      title="Bulk CSV import coming in v2.1"
                      aria-label="Upload CSV — coming soon in v2.1"
                      data-testid="button-upload-csv"
                    >
                      <Upload className="h-4 w-4" /> Upload CSV
                      <Badge variant="outline" className="no-default-active-elevate text-[9px] ml-1">v2.1</Badge>
                    </Button>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" /> CSV import is coming in v2.1. Use "Bulk Enroll Cohort" for now.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ─── Bulk Enroll Modal ──────────────────────────────────────────────── */}
      <Dialog open={enrollModalOpen} onOpenChange={(v) => { if (!v) { setEnrollOfferingId(""); } setEnrollModalOpen(v); }}>
        <DialogContent className="sm:max-w-[480px]" role="dialog" aria-labelledby="bulk-enroll-title">
          <DialogHeader>
            <DialogTitle id="bulk-enroll-title" className="font-serif text-lg">Bulk Enroll Cohort</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Select a course offering. All students assigned to the offering's divisions
              will be enrolled automatically.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="enroll-offering">Course Offering *</Label>
              <Select value={enrollOfferingId} onValueChange={setEnrollOfferingId}>
                <SelectTrigger id="enroll-offering" data-testid="select-enroll-offering">
                  <SelectValue placeholder="Select a course offering..." />
                </SelectTrigger>
                <SelectContent>
                  {offerings.map((co: any) => (
                    <SelectItem key={co.id} value={co.id}>
                      {co.course?.code} {co.course?.name} — Div {(co.divisions || []).join(", ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => { setEnrollOfferingId(""); setEnrollModalOpen(false); }}
              data-testid="button-cancel-enroll"
            >
              Cancel
            </Button>
            <Button
              onClick={() => bulkEnrollMutation.mutate(enrollOfferingId)}
              disabled={!enrollOfferingId || bulkEnrollMutation.isPending}
              data-testid="button-submit-enroll"
            >
              {bulkEnrollMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enrolling...</> : <><UserPlus className="h-4 w-4 mr-2" /> Enroll Cohort</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
