import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DisabilityChips, StatusChip } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, Upload, Plus, Download, Loader2 } from "lucide-react";

type UserRole = "student" | "teacher" | "admin";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

const PROGRAMS = ["B.Tech Computer Science", "B.Tech IT", "B.Tech ECE", "B.Tech Mechanical", "B.Tech Civil"];
const YEARS = [1, 2, 3, 4];
const DIVISIONS = ["A", "B", "C", "D"];

function AddUserModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("student");
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("auth_token");
      const body: Record<string, any> = { name, email, password, role };
      if (role === "student") {
        if (program) body.program = program;
        if (year) body.year = parseInt(year);
        if (division) body.division = division;
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to create user" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User created", description: `${data.name} has been added as ${data.role}.` });
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create user", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("student");
    setProgram("");
    setYear("");
    setDivision("");
  };

  const canSubmit = name.trim() && email.trim() && password.trim() && role;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[480px]" role="dialog" aria-labelledby="add-user-title">
        <DialogHeader>
          <DialogTitle id="add-user-title" className="font-serif text-lg">Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-user-name">Full Name *</Label>
              <Input
                id="add-user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                data-testid="input-add-user-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-user-email">Email *</Label>
              <Input
                id="add-user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@university.edu"
                data-testid="input-add-user-email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-user-password">Password *</Label>
              <Input
                id="add-user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-add-user-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-user-role">Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="add-user-role" data-testid="select-add-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="ta">Teaching Assistant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {role === "student" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-user-program">Program</Label>
                <Select value={program} onValueChange={setProgram}>
                  <SelectTrigger id="add-user-program" data-testid="select-add-user-program">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-user-year">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="add-user-year" data-testid="select-add-user-year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-user-division">Division</Label>
                <Select value={division} onValueChange={setDivision}>
                  <SelectTrigger id="add-user-division" data-testid="select-add-user-division">
                    <SelectValue placeholder="Div" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map((d) => (
                      <SelectItem key={d} value={d}>Div {d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => { resetForm(); onOpenChange(false); }} data-testid="button-cancel-add-user">
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canSubmit || createMutation.isPending}
            data-testid="button-submit-add-user"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchWithAuth("/api/admin/users"),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="User Management" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  const allUsers: any[] = usersData ?? [];
  const filtered = allUsers.filter((u: any) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery && !u.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="User Management" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "student", "teacher", "admin"] as const).map((r) => (
                <Button key={r} variant={roleFilter === r ? "default" : "secondary"} size="sm" onClick={() => setRoleFilter(r)} data-testid={`button-filter-${r}`}>
                  {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                  {r !== "all" && (
                    <Badge variant="outline" className="ml-1 no-default-active-elevate text-[10px]">
                      {allUsers.filter((u: any) => u.role === r).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="gap-1 opacity-60 cursor-not-allowed" disabled title="Bulk CSV import is coming in v2.1" aria-label="Import CSV — coming soon in v2.1" data-testid="button-bulk-import">
                <Upload className="h-3.5 w-3.5" /> Import CSV
                <Badge variant="outline" className="no-default-active-elevate text-[9px] ml-1">v2.1</Badge>
              </Button>
              <Button size="sm" className="gap-1" onClick={() => setAddModalOpen(true)} data-testid="button-add-user"><Plus className="h-3.5 w-3.5" /> Add User</Button>
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-export"><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="pl-9" data-testid="input-search-users" />
          </div>

          <div className="rounded-md border">
            <table className="w-full" aria-label="Users">
              <thead>
                <tr className="border-b bg-primary text-primary-foreground">
                  <th scope="col" className="text-left text-xs font-medium p-3">Name</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Email</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Role</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Program / Year / Div</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden lg:table-cell">Status</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden xl:table-cell">Accessibility</th>
                  <th scope="col" className="text-right text-xs font-medium p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: any, i: number) => (
                  <tr key={u.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-user-${u.id}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                          {(u.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{u.email}</td>
                    <td className="p-3"><Badge variant="outline" className="no-default-active-elevate text-[11px] capitalize">{u.role}</Badge></td>
                    <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                      {u.program ? `${u.program} / Y${u.year} / ${u.division || "-"}` : "-"}
                    </td>
                    <td className="p-3 hidden lg:table-cell"><StatusChip status={u.status} /></td>
                    <td className="p-3 hidden xl:table-cell">
                      {(u.disabilities || []).length > 0 ? (
                        <DisabilityChips disabilities={u.disabilities} size="small" />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-edit-user-${u.id}`}>Edit</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AddUserModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
