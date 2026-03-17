import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Megaphone, Loader2 } from "lucide-react";

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

export default function AnnouncementsPage() {
  const { user } = useAuth();

  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/announcements", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load announcements");
      return res.json();
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Announcements" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Announcements" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        </main>
      </div>
    );
  }

  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    urgent: false 
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setFormData({ title: '', content: '', urgent: false });
      setShowForm(false);
    },
  });

  const items: any[] = announcements ?? [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Announcements" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[800px] space-y-4">
          {(user?.role === "teacher" || user?.role === "admin") && (
            <div className="mb-4">
              {!showForm ? (
                <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
                  + New Announcement
                </Button>
              ) : (
                <Card className="mb-4">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm">New Announcement</h3>
                    <div className="space-y-1">
                      <Label htmlFor="ann-title">Title</Label>
                      <Input
                        id="ann-title"
                        value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                        placeholder="Announcement title"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ann-content">Message</Label>
                      <Textarea
                        id="ann-content"
                        value={formData.content}
                        onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                        placeholder="Write your announcement..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="ann-urgent"
                        checked={formData.urgent}
                        onCheckedChange={(v) => setFormData(p => ({ ...p, urgent: v }))}
                      />
                      <Label htmlFor="ann-urgent">Mark as urgent</Label>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={() => createMutation.mutate(formData)}
                        disabled={!formData.title.trim() || !formData.content.trim() || createMutation.isPending}
                        size="sm"
                      >
                        {createMutation.isPending ? "Sending..." : "Send"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </div>
                    {createMutation.isError && (
                      <p className="text-xs text-destructive">Failed to send. Please try again.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {items.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No announcements yet
              </CardContent>
            </Card>
          )}
          {items.map((a: any) => (
            <Card
              key={a.id}
              className={a.urgent ? "border-l-2 border-l-[#C07B1A]" : ""}
              data-testid={`card-announcement-${a.id}`}
            >
              <CardContent className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {a.urgent ? (
                      <AlertTriangle className="h-4 w-4 text-[#C07B1A] shrink-0" />
                    ) : (
                      <Megaphone className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    {a.urgent && (
                      <Badge variant="outline" className="no-default-active-elevate text-[10px] text-[#C07B1A] border-[#C07B1A]/30">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                  <span>{a.senderName} · {a.senderRole}</span>
                  <div className="flex items-center gap-2">
                    {a.courseName && <Badge variant="outline" className="no-default-active-elevate text-[10px]">{a.courseName}</Badge>}
                    <span>{formatTimeAgo(a.publishedAt || a.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
