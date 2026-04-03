import React, { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FormatChips, StatusChip } from "@/components/disability-chips";
import { DisabilityChips } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import type { DisabilityType } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Upload, Trash2, Eye, Edit, FileText, Video, Music, Presentation, AlertTriangle, Users, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, typeof FileText> = { pdf: FileText, video: Video, audio: Music, document: FileText, presentation: Presentation };

// ── Conversion Progress Panel ────────────────────────────────
function ConversionProgressPanel({ 
  contentId, onDone 
}: { 
  contentId: string; 
  onDone: () => void; 
}) {
  const [statuses, setStatuses] = React.useState<Record<string, string>>({
    transcript:   'PENDING',
    simplified:   'PENDING',
    highContrast: 'PENDING',
    braille:      'PENDING',
  });
  const [allDone, setAllDone] = React.useState(false);
  const intervalRef = React.useRef<any>(null);

  const FORMATS = [
    { key: 'transcript',   label: 'Transcript',      icon: '📄' },
    { key: 'simplified',   label: 'Simplified Text', icon: '✏️' },
    { key: 'highContrast', label: 'High Contrast',   icon: '🔲' },
    { key: 'braille',      label: 'Braille',         icon: '⠿'  },
  ];

  React.useEffect(() => {
    const poll = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/content/${contentId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const item = await res.json();

        const newStatuses = {
          transcript:   item.transcriptStatus   || 'PENDING',
          simplified:   item.simplifiedStatus   || 'PENDING',
          highContrast: item.highContrastStatus  || 'PENDING',
          braille:      item.brailleStatus       || 'PENDING',
        };
        setStatuses(newStatuses);

        const done = Object.values(newStatuses).every(
          s => s === 'COMPLETED' || s === 'READYFORREVIEW' 
            || s === 'FAILED' || s === 'APPROVED'
        );
        if (done) {
          setAllDone(true);
          clearInterval(intervalRef.current);
        }
      } catch {}
    };

    poll(); // immediate first call
    intervalRef.current = setInterval(poll, 2500);
    return () => clearInterval(intervalRef.current);
  }, [contentId]);

  const getIcon = (status: string) => {
    if (status === 'COMPLETED' || status === 'READYFORREVIEW' 
        || status === 'APPROVED')
      return <span className="text-green-500">✅</span>;
    if (status === 'FAILED')
      return <span className="text-destructive">❌</span>;
    return (
      <svg className="h-4 w-4 animate-spin text-primary" 
           fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    );
  };

  const getLabel = (status: string) => {
    if (status === 'COMPLETED' || status === 'APPROVED') 
      return 'Ready';
    if (status === 'READYFORREVIEW') 
      return 'Awaiting review';
    if (status === 'FAILED')  
      return 'Failed';
    return 'Generating...';
  };

  return (
    <div className="space-y-4 py-2">
      <div className="text-center space-y-1">
        {allDone ? (
          <>
            <p className="text-lg font-semibold">
              🎉 Conversion Complete!
            </p>
            <p className="text-sm text-muted-foreground">
              All accessible formats have been generated.
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-medium">
              Generating accessible formats...
            </p>
            <p className="text-sm text-muted-foreground">
              This usually takes 15–30 seconds.
            </p>
          </>
        )}
      </div>

      <div className="space-y-2">
        {FORMATS.map(({ key, label, icon }) => (
          <div key={key}
            className="flex items-center justify-between
                       rounded-lg border px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {getLabel(statuses[key])}
              </span>
              {getIcon(statuses[key])}
            </div>
          </div>
        ))}
      </div>

      {allDone && (
        <button
          onClick={onDone}
          className="w-full rounded-lg bg-primary px-4 py-2.5 
                     text-sm font-medium text-primary-foreground
                     hover:bg-primary/90 transition"
        >
          Done — View Content Library
        </button>
      )}
    </div>
  );
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

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export default function TeacherCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("content");
  const [showUpload, setShowUpload] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadedContentId, setUploadedContentId] = useState<string | null>(null);
  const [conversionPoll, setConversionPoll] = useState<any>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("pdf");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: co, isLoading: coLoading } = useQuery({
    queryKey: ["course-offering", id],
    queryFn: () => fetchWithAuth(`/api/course-offerings/${id}`),
    enabled: !!user && !!id,
  });

  const { data: contentData } = useQuery({
    queryKey: ["course-content", id],
    queryFn: () => fetchWithAuth(`/api/content?courseOfferingId=${id}`),
    enabled: !!user && !!id,
    // Poll every 4s while any item is still converting/draft; stop when all done
    refetchInterval: (query) => {
      const items: any[] = query.state.data ?? [];
      const hasConverting = items.some(
        (ci: any) => ci.publishStatus === "converting" || ci.publishStatus === "draft"
      );
      return hasConverting ? 4000 : false;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/content/${contentId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to publish");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-content", id] });
      toast({ title: "Content approved", description: "Students can now access this content." });
    },
    onError: () => {
      toast({ title: "Approval failed", variant: "destructive" });
    },
  });

  const { data: enrollmentData } = useQuery({
    queryKey: ["course-enrollments", id],
    queryFn: async () => {
      const enrollments = await fetchWithAuth(`/api/enrollments?courseOfferingId=${id}`);
      // Fetch user details for each enrollment
      const enriched = await Promise.all(
        enrollments.map(async (e: any) => {
          try {
            const student = await fetchWithAuth(`/api/users/${e.studentId}`).catch(() => null);
            return { ...e, student };
          } catch {
            return { ...e, student: null };
          }
        })
      );
      return enriched;
    },
    enabled: !!user && !!id,
  });

  // TODO (DEFERRED — #33/#34 edge cases):
  // - File upload retry on network failure
  // - Duplicate title check before upload
  // - File size validation (max 50 MB) with user-facing error
  // - Rich text sanitization for description field
  // - Assessment creation: date range validation, duplicate name check
  // - Announcement creation: scheduled publish validation, recipient scope verification
  // Known limitation: happy path works, exhaustive edge-case validation deferred to v2.1

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("title", uploadTitle);
      formData.append("courseOfferingId", id!);
      formData.append("description", uploadDesc);
      formData.append("type", uploadType);
      if (uploadFile) formData.append("file", uploadFile);

      const res = await fetch("/api/content", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-content", id] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
      setShowUpload(false);
      setUploadTitle("");
      setUploadDesc("");
      setUploadType("pdf");
      setUploadFile(null);
      setUploadStep(1);
      setUploadedContentId(null);
      toast({ 
        title: "Content Uploaded", 
        description: "Conversion has started. You can track progress in the content list below." 
      });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message || "Something went wrong. Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/content/${contentId}/soft-delete`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Delete failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-content", id] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
      setShowDelete(null);
      toast({ title: "Moved to Trash", description: "Content moved to trash. Students will be notified." });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  if (coLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Loading..." breadcrumb="" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!co) return <div className="p-8 text-center text-muted-foreground">Course not found</div>;

  const courseContent: any[] = contentData ?? [];
  const courseStudents: any[] = (enrollmentData ?? []).filter((e: any) => e.student);
  const deleteItem = courseContent.find((ci: any) => ci.id === showDelete);

  return (
    <div className="flex flex-col h-full">
      <TopBar title={co.course.name} breadcrumb={`${co.course.code} > Spring ${co.year || new Date().getFullYear()} > Div ${(co.divisions || []).join(", ")}`} />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/teacher/dashboard">
                <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
              </Link>
              <Badge variant="outline" className="no-default-active-elevate font-mono">{co.course.code}</Badge>
              <h1 className="font-serif text-xl font-semibold">{co.course.name}</h1>
            </div>
            <Button onClick={() => { setShowUpload(true); setUploadStep(1); }} className="gap-1" data-testid="button-upload-content">
              <Plus className="h-4 w-4" /> Upload Content
            </Button>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
              <TabsTrigger value="students" data-testid="tab-students">Students</TabsTrigger>
              <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <div className="rounded-md border">
                <table className="w-full" aria-label="Content items">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Title</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Type</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Formats</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Status</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden lg:table-cell">Updated</th>
                      <th scope="col" className="text-right text-xs font-medium p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseContent.map((ci: any, i: number) => {
                      const Icon = typeIcons[ci.type] || FileText;
                      return (
                        <tr key={ci.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-content-${ci.id}`}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium">{ci.title}</span>
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground capitalize hidden sm:table-cell">{ci.type}</td>
                          <td className="p-3 hidden md:table-cell"><FormatChips formats={ci.formats || []} size="small" /></td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {(ci.publishStatus === "converting" || ci.publishStatus === "draft") && (
                                <Loader2 className="h-3 w-3 animate-spin text-[#C07B1A]" />
                              )}
                              <StatusChip status={ci.publishStatus} />
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{formatTimeAgo(ci.updatedAt || ci.createdAt)}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              {ci.publishStatus === "review_required" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[11px] gap-1 text-[#2E8B6E] border-[#2E8B6E]/40 hover:bg-[#2E8B6E]/10"
                                  onClick={() => approveMutation.mutate(ci.id)}
                                  disabled={approveMutation.isPending}
                                  aria-label={`Approve ${ci.title}`}
                                  data-testid={`button-approve-${ci.id}`}
                                >
                                  <CheckCircle className="h-3 w-3" /> Approve
                                </Button>
                              )}
                              <Link href={`/student/content/${ci.id}`}>
                                <Button variant="ghost" size="icon" aria-label={`Preview ${ci.title}`} data-testid={`button-preview-${ci.id}`}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" aria-label={`Edit ${ci.title}`} data-testid={`button-edit-${ci.id}`}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" aria-label={`Delete ${ci.title}`} onClick={() => setShowDelete(ci.id)} data-testid={`button-delete-${ci.id}`}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {courseContent.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No content uploaded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{co.studentCount ?? courseStudents.length} students enrolled</span>
              </div>
              <div className="rounded-md border">
                <table className="w-full" aria-label="Enrolled students">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Name</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Division</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Accessibility</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.map((e: any, i: number) => {
                      const s = e.student;
                      if (!s) return null;
                      const disabilities = (s.disabilities as DisabilityType[]) || [];
                      return (
                        <tr key={e.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-student-${s.id}`}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                {(s.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">Div {s.division || "A"}</td>
                          <td className="p-3">
                            {disabilities.length > 0 ? (
                              <DisabilityChips disabilities={disabilities} size="small" />
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </td>
                          <td className="p-3 hidden md:table-cell"><StatusChip status={e.status || s.status} /></td>
                        </tr>
                      );
                    })}
                    {courseStudents.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No students enrolled yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="mt-4">
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Assessment management will be available here. You can create quizzes, assignments, and exams for this course.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-serif">Upload Learning Material</DialogTitle>
            <DialogDescription>Supported formats: PDF, Word, TXT. Accessible versions are generated automatically.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= uploadStep ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          {uploadStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-title">Title</Label>
                <Input id="content-title" placeholder="Enter content title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} data-testid="input-content-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger id="content-type" data-testid="select-content-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-desc">Description</Label>
                <Textarea id="content-desc" placeholder="Brief description" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} data-testid="textarea-content-desc" />
              </div>
            </div>
          )}
          {uploadStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Course Offering</Label><Input value={`${co.course.code} – ${co.course.name}`} readOnly className="bg-muted" /></div>
              <div className="space-y-2">
                <Label>Sections</Label>
                <div className="flex gap-3">
                  {(co.divisions || []).map((d: string) => (
                    <div key={d} className="flex items-center gap-2">
                      <Checkbox id={`div-${d}`} defaultChecked data-testid={`checkbox-div-${d}`} />
                      <Label htmlFor={`div-${d}`} className="text-sm">Div {d}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {uploadStep === 3 && (
            <div className="space-y-4">
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              <div
                className="flex items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                  const file = e.dataTransfer.files?.[0];
                  if (file) setUploadFile(file);
                }}
              >
                <div className="text-center space-y-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  {uploadFile ? (
                    <p className="text-sm font-medium">{uploadFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Drop file here or click to browse</p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, MP4, MP3, JPG, PNG, URL...</p>
                    </>
                  )}
                  <Button variant="secondary" size="sm" data-testid="button-browse-file" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Files</Button>
                </div>
              </div>
            </div>
          )}
          {/* Removed step 4 (live conversion) in favor of automatic close + toast */}
          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setUploadStep(Math.max(1, uploadStep - 1))} 
              disabled={uploadStep === 1}>Back</Button>
            {uploadStep < 3 ? (
              <Button onClick={() => setUploadStep(uploadStep + 1)} disabled={uploadStep === 1 && !uploadTitle.trim()} data-testid="button-upload-next">Next</Button>
            ) : (
              <Button
                disabled={uploadMutation.isPending}
                onClick={() => uploadMutation.mutate()}
                data-testid="button-upload-convert"
              >
                {uploadMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Uploading...</> : "Upload & Convert"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete '{deleteItem?.title}'?
            </DialogTitle>
          </DialogHeader>
          {deleteItem && (
            <div className="space-y-4">
              <div className="rounded-md bg-[#FFF3E0]/50 border border-[#C07B1A]/20 p-4 space-y-2 text-sm">
                <p>This content item will be moved to trash.</p>
              </div>
              <p className="text-sm text-muted-foreground">Moving to Trash keeps it recoverable for 30 days. Students will be notified of removal.</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowDelete(null)} data-testid="button-cancel-delete">Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(deleteItem.id)}
                  data-testid="button-confirm-delete"
                >
                  {deleteMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Deleting...</> : "Move to Trash"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
