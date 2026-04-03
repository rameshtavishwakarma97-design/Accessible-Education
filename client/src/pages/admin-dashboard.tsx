import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Users, Accessibility, BookOpen, BarChart3, AlertTriangle, XCircle, TrendingUp, TrendingDown, ChevronRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const CHART_COLORS = ["#355872", "#7AAACE", "#9CD5FF", "#5C7A99", "#2E8B6E"];

interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  children: HierarchyNode[];
  studentCount: number;
}

/* ───────────────────── Accessible Tree Node ───────────────────── */

interface TreeNodeProps {
  node: HierarchyNode;
  level: number;
  selectedId: string | null;
  onSelect: (node: HierarchyNode) => void;
}

function TreeNode({ node, level, selectedId, onSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;
  const isActive = selectedId === node.id;
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = useCallback(() => {
    onSelect(node);
    if (hasChildren) setIsExpanded(prev => !prev);
  }, [node, hasChildren, onSelect]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowRight":
        if (hasChildren && !isExpanded) { setIsExpanded(true); e.preventDefault(); }
        else if (hasChildren && isExpanded) {
          // Focus first child
          const next = btnRef.current?.parentElement?.querySelector<HTMLButtonElement>('[role="treeitem"] > button');
          next?.focus();
          e.preventDefault();
        }
        break;
      case "ArrowLeft":
        if (hasChildren && isExpanded) { setIsExpanded(false); e.preventDefault(); }
        else {
          // Focus parent node
          const parentItem = btnRef.current?.closest('[role="treeitem"]')?.parentElement?.closest('[role="treeitem"]');
          const parentBtn = parentItem?.querySelector<HTMLButtonElement>(":scope > button");
          parentBtn?.focus();
          e.preventDefault();
        }
        break;
      case "ArrowDown": {
        e.preventDefault();
        const all = Array.from(btnRef.current?.closest('[role="tree"]')?.querySelectorAll<HTMLButtonElement>('[role="treeitem"] > button') ?? []);
        const idx = all.indexOf(btnRef.current!);
        if (idx >= 0 && idx < all.length - 1) all[idx + 1].focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const all = Array.from(btnRef.current?.closest('[role="tree"]')?.querySelectorAll<HTMLButtonElement>('[role="treeitem"] > button') ?? []);
        const idx = all.indexOf(btnRef.current!);
        if (idx > 0) all[idx - 1].focus();
        break;
      }
      case "Enter":
      case " ":
        e.preventDefault();
        toggle();
        break;
    }
  }, [hasChildren, isExpanded, toggle]);

  const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isActive}
      aria-label={`${typeLabel}: ${node.name}${hasChildren ? `, ${node.children.length} children` : ""}`}
    >
      <button
        ref={btnRef}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        className={`
          flex items-center gap-1.5 w-full text-left py-1.5 pr-2 rounded text-sm transition-colors duration-150
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9CD5FF] focus-visible:outline-offset-[-2px]
          ${isActive
            ? "bg-[#2A4660] text-[#F7F8F0] border-l-[3px] border-l-[#9CD5FF]"
            : "hover:bg-[rgba(42,70,96,0.15)] text-foreground"
          }
        `}
        data-testid={`tree-node-${node.id}`}
        aria-label={`${typeLabel}: ${node.name}`}
      >
        {hasChildren ? (
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ease-out ${isExpanded ? "rotate-90" : ""}`}
          />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="truncate flex-1 text-[14px]">{node.name}</span>
        <span className={`text-[11px] shrink-0 tabular-nums ${isActive ? "text-[#9CD5FF]" : "text-muted-foreground"}`}>
          {node.studentCount}
        </span>
      </button>

      {isExpanded && hasChildren && (
        <div role="group">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Breadcrumb Builder ───────────────────── */

function buildBreadcrumb(tree: HierarchyNode | null, targetId: string): string[] {
  if (!tree) return [];
  if (tree.id === targetId) return [tree.name];
  for (const child of tree.children) {
    const path = buildBreadcrumb(child, targetId);
    if (path.length > 0) return [tree.name, ...path];
  }
  return [];
}

/* ───────────────────── Data Fetcher ───────────────────── */

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

/* ───────────────────── Admin Dashboard ───────────────────── */

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchWithAuth("/api/admin/dashboard/stats"),
    enabled: !!user,
  });

  const { data: hierarchyTree } = useQuery({
    queryKey: ["admin-hierarchy", user?.instituteId],
    queryFn: () => fetchWithAuth(`/api/institutes/${user!.instituteId}/hierarchy`),
    enabled: !!user?.instituteId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: alertsData } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: () => fetchWithAuth("/api/admin/dashboard/alerts"),
    enabled: !!user,
  });

  if (statsLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Admin Dashboard" breadcrumb="Loading..." />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading admin dashboard…</p>
          </div>
        </main>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Admin Dashboard" breadcrumb="" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive font-medium">Could not load dashboard data</p>
            <p className="text-xs text-muted-foreground">{(statsError as Error).message}</p>
          </div>
        </main>
      </div>
    );
  }

  const s = stats || {};
  const alerts: any[] = alertsData?.alerts ?? [];

  const statCards = [
    {
      label: "Total Students",
      value: (s.totalStudents ?? 0).toLocaleString(),
      icon: Users,
      trend: s.studentTrend ?? "—",
      up: !(s.studentTrend ?? "").startsWith("-"),
    },
    {
      label: "With Disabilities",
      value: (s.studentsWithDisabilities ?? 0).toLocaleString(),
      icon: Accessibility,
      trend: s.disabledTrend ?? "—",
      up: !(s.disabledTrend ?? "").startsWith("-"),
    },
    {
      label: "Teachers",
      value: (s.totalTeachers ?? 0).toString(),
      icon: BookOpen,
      trend: s.teacherTrend ?? "—",
      up: !(s.teacherTrend ?? "").startsWith("-"),
    },
    {
      label: "Content Items",
      value: (s.contentItems ?? 0).toLocaleString(),
      icon: BarChart3,
      trend: s.contentTrend ?? "—",
      up: !(s.contentTrend ?? "").startsWith("-"),
    },
    {
      label: "Coverage",
      value: `${s.accessibilityCoverage ?? 0}%`,
      icon: BarChart3,
      trend: s.accessibilityCoverage > 80 ? "Good" : "Needs work",
      up: (s.accessibilityCoverage ?? 0) > 80,
    },
    {
      label: "Failure Rate",
      value: `${s.conversionFailureRate ?? 0}%`,
      icon: AlertTriangle,
      trend: s.conversionFailureRate < 5 ? "Healthy" : "High",
      up: (s.conversionFailureRate ?? 0) < 5,
    },
  ];

  const disabilityBreakdown = s.disabilityBreakdown ?? [];
  const formatUsage = s.formatUsage ?? [];
  const monthlyConversions = s.monthlyConversions ?? [];

  const breadcrumb = selectedNode
    ? buildBreadcrumb(hierarchyTree, selectedNode.id)
    : [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Admin Dashboard" breadcrumb={hierarchyTree?.name ?? "Loading..."} />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((stat) => (
              <Card key={stat.label} data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-mono tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.up ? <TrendingUp className="h-3 w-3 text-[#2E8B6E]" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                    <span className={`text-[11px] font-mono ${stat.up ? "text-[#2E8B6E]" : "text-destructive"}`}>{stat.trend}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* ─── Hierarchy Panel ─── */}
            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-3">Hierarchy</h3>

                {/* Filtering breadcrumb */}
                {selectedNode && (
                  <div className="mb-2 p-2 rounded-md bg-accent text-xs space-y-1">
                    <p className="font-medium text-muted-foreground">
                      Filtering by: {breadcrumb.join(" › ")}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs p-0 h-auto"
                      onClick={() => setSelectedNode(null)}
                      data-testid="button-clear-hierarchy-filter"
                    >
                      Clear filter
                    </Button>
                  </div>
                )}

                <div className="max-h-[400px] overflow-auto" role="tree" aria-label="Institute hierarchy">
                  {hierarchyTree ? (
                    <TreeNode
                      node={hierarchyTree}
                      level={0}
                      selectedId={selectedNode?.id ?? null}
                      onSelect={setSelectedNode}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">No hierarchy data</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ─── Charts Panel ─── */}
            <Card className="lg:col-span-2">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-serif text-sm font-semibold">Accessibility Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Disability Distribution</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={disabilityBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percentage }: any) => `${percentage}%`} labelLine={false}>
                          {disabilityBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {disabilityBreakdown.map((d: any, i: number) => (
                        <div key={d.name} className="flex items-center gap-1 text-[11px]">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Format Usage (%)</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={formatUsage} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="format" tick={{ fontSize: 11 }} width={70} />
                        <Tooltip />
                        <Bar dataKey="usage" fill="#7AAACE" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Monthly Conversions</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={monthlyConversions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="successful" stroke="#7AAACE" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="failed" stroke="#C0392B" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ─── Alerts Panel ─── */}
            <Card className="lg:col-span-1">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-serif text-sm font-semibold">Alerts</h3>
                <div className="space-y-2">
                  {alerts.length > 0 ? (
                    alerts.map((alert: any, i: number) => (
                      <div key={alert.jobId || i} className="rounded-md border-l-2 border-l-destructive bg-destructive/5 p-2">
                        <p className="text-xs font-medium flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> {alert.message}</p>
                        {alert.errorMessage && <p className="text-[11px] text-muted-foreground mt-0.5">{alert.errorMessage}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No active alerts</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-xs w-full" data-testid="link-view-all-alerts">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
