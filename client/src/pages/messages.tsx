import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");

  const { data: threadsData, isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetchWithAuth("/api/threads"),
    enabled: !!user,
  });

  const threads: any[] = threadsData ?? [];

  // Auto-select first thread
  const activeThread = selectedThread || threads[0]?.id || "";

  const { data: messagesData } = useQuery({
    queryKey: ["thread-messages", activeThread],
    queryFn: () => fetchWithAuth(`/api/threads/${activeThread}/messages`),
    enabled: !!user && !!activeThread,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/threads/${activeThread}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, type: "text" }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread-messages", activeThread] });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      setNewMessage("");
    },
    onError: (err: Error) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  const thread = threads.find((t: any) => t.id === activeThread);
  const threadMessages: any[] = messagesData ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Messages" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Messages" />
      <main id="main-content" className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full" style={{ maxHeight: "calc(100vh - 130px)" }}>
            <div className="md:col-span-1 space-y-2 overflow-auto">
              <h2 className="font-serif text-sm font-semibold mb-2">Conversations</h2>
              {threads.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedThread(t.id)}
                  className={`w-full text-left rounded-md border p-3 space-y-1 transition-colors ${activeThread === t.id ? "border-primary bg-accent" : "border-border"
                    }`}
                  data-testid={`thread-${t.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{t.courseName || t.title || "Thread"}</span>
                    {(t.unreadCount || 0) > 0 && (
                      <Badge className="no-default-active-elevate text-[10px] bg-[#9CD5FF] text-[#355872]">{t.unreadCount}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                  <p className="text-[11px] text-muted-foreground">{t.lastMessageTime ? formatTimeAgo(t.lastMessageTime) : ""}</p>
                </button>
              ))}
              {threads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No conversations</p>}
            </div>

            <div className="md:col-span-2 flex flex-col rounded-md border bg-card">
              {thread ? (
                <>
                  <div className="border-b p-3">
                    <h3 className="text-sm font-semibold">{thread.courseName || thread.title || "Thread"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {(thread.participants || []).map((p: any) => p.name || p).join(", ")}
                    </p>
                  </div>
                  <div className="flex-1 overflow-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Messages">
                    {threadMessages.map((m: any) => {
                      const isOwn = m.senderId === user?.id;
                      return (
                        <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`} data-testid={`message-${m.id}`}>
                          <div className={`max-w-[75%] rounded-md p-3 ${isOwn ? "bg-[#EBF4FB]" : "bg-accent"}`}>
                            <p className="text-xs font-medium mb-1">{m.senderName}</p>
                            <p className="text-sm">{m.content}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{formatTimeAgo(m.createdAt || m.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {threadMessages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>}
                  </div>
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="min-h-[40px] resize-none"
                        aria-label="Type a message"
                        data-testid="textarea-message"
                      />
                      <Button
                        size="icon"
                        disabled={!newMessage.trim() || sendMutation.isPending}
                        onClick={() => sendMutation.mutate(newMessage.trim())}
                        data-testid="button-send-message"
                      >
                        {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
