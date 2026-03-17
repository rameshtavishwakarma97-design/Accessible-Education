import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Plus, Edit, Archive, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  children: HierarchyNode[];
  studentCount: number;
}

function TreeNode({ node, depth = 0, onSelect, selectedId }: { node: HierarchyNode; depth?: number; onSelect: (n: HierarchyNode) => void; selectedId: string | null }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <button
        className={`flex items-center gap-2 w-full text-left py-2 px-2 rounded-md text-sm transition-colors ${isSelected ? "bg-accent border border-primary/20" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => { if (hasChildren) setExpanded(!expanded); onSelect(node); }}
        data-testid={`tree-node-${node.id}`}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : <span className="w-3.5" />}
        <span className="flex-1 font-medium">{node.name}</span>
        <Badge variant="outline" className="no-default-active-elevate text-[10px] ml-2">{node.type}</Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-0.5 ml-1"><Users className="h-3 w-3" /> {node.studentCount}</span>
      </button>
      {expanded && hasChildren && (
        <div>{node.children.map((c) => <TreeNode key={c.id} node={c} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />)}</div>
      )}
    </div>
  );
}

// Map parent type → child type and creation endpoint
const CHILD_CONFIG: Record<string, { childType: string; endpoint: string }> = {
  institute: { childType: "School", endpoint: "institutes" },
  school: { childType: "Department", endpoint: "schools" },
  department: { childType: "Program", endpoint: "departments" },
  program: { childType: "Year", endpoint: "programs" },
  year: { childType: "Division", endpoint: "years" },
};

export default function AdminHierarchy() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<HierarchyNode | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Edit modal state
  const [editingNode, setEditingNode] = useState<{ id: string; name: string; type: string } | null>(null);
  const [editName, setEditName] = useState('');

  // Add node state
  const [addingNode, setAddingNode] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");

  const { data: hierarchyData, isLoading } = useQuery({
    queryKey: ["hierarchy", user?.instituteId],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/institutes/${user!.instituteId}/hierarchy`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("Failed to load hierarchy");
      return res.json();
    },
    enabled: !!user?.instituteId,
  });

  /** Re-fetch the hierarchy tree and clear selection */
  function refetchHierarchy() {
    queryClient.invalidateQueries({ queryKey: ["hierarchy", user?.instituteId] });
    setSelected(null);
  }

  /** Authenticated fetch helper */
  async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Institute Hierarchy" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  const hierarchyTree: HierarchyNode | null = hierarchyData || null;
  const childConfig = selected ? CHILD_CONFIG[selected.type.toLowerCase()] : null;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Institute Hierarchy" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="font-serif text-sm font-semibold">Hierarchy Tree</h2>
                    <Button 
                      size="sm" 
                      className="gap-1" 
                      data-testid="button-add-node"
                      onClick={() => { setAddingNode(true); setNewNodeName(""); }}
                      disabled={!selected}
                      title={!selected ? "Select a node first" : `Add child under ${selected?.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Node
                    </Button>
                  </div>
                  <div className="space-y-0.5">
                    {hierarchyTree ? (
                      <TreeNode node={hierarchyTree} onSelect={setSelected} selectedId={selected?.id || null} />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No hierarchy data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              {selected ? (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-serif text-sm font-semibold">Node Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-1"><label className="text-xs text-muted-foreground">Name</label><Input defaultValue={selected.name} readOnly /></div>
                      <div className="space-y-1"><label className="text-xs text-muted-foreground">Type</label><Badge variant="outline" className="no-default-active-elevate capitalize">{selected.type}</Badge></div>
                      <div className="space-y-1"><label className="text-xs text-muted-foreground">Students</label><p className="text-sm font-medium">{selected.studentCount}</p></div>
                      <div className="space-y-1"><label className="text-xs text-muted-foreground">Children</label><p className="text-sm font-medium">{selected.children?.length || 0} nodes</p></div>
                    </div>
                    <div className="flex gap-2">
                      {/* ─── EDIT BUTTON ─── */}
                      <Button
                        variant="secondary"
                        className="flex-1 gap-1"
                        onClick={() => {
                          setEditingNode({ id: selected.id, name: selected.name, type: selected.type });
                          setEditName(selected.name);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>

                      {/* ─── ADD CHILD BUTTON ─── */}
                      {childConfig && (
                        <Button
                          variant="secondary"
                          className="flex-1 gap-1"
                          onClick={async () => {
                            const childName = window.prompt(`Enter name for new ${childConfig.childType}:`);
                            if (!childName?.trim()) return;

                            try {
                              const res = await authFetch(
                                `/api/${childConfig.endpoint}/${selected.id}/${childConfig.childType.toLowerCase()}s`,
                                {
                                  method: 'POST',
                                  body: JSON.stringify({ name: childName.trim(), label: childName.trim() }),
                                }
                              );
                              if (!res.ok) throw new Error("Failed");
                              toast({ title: `${childConfig.childType} created successfully` });
                              refetchHierarchy();
                            } catch {
                              toast({ title: "Failed to add child node", variant: "destructive" });
                            }
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add {childConfig.childType}
                        </Button>
                      )}
                    </div>

                    {/* ─── RETIRE NODE BUTTON ─── */}
                    {selected.type.toLowerCase() !== 'institute' && (
                      <Button
                        variant="ghost"
                        className="w-full gap-1 text-muted-foreground"
                        data-testid="button-retire-node"
                        onClick={async () => {
                          const confirmed = window.confirm(
                            `Retire "${selected.name}"? This hides it from active use but preserves all historical data.`
                          );
                          if (!confirmed) return;

                          try {
                            const res = await authFetch(
                              `/api/hierarchy/${selected.type.toLowerCase()}/${selected.id}`,
                              { method: 'DELETE' }
                            );
                            if (!res.ok) throw new Error("Failed");
                            toast({ title: `${selected.name} retired successfully` });
                            refetchHierarchy();
                          } catch {
                            toast({ title: "Failed to retire node", variant: "destructive" });
                          }
                        }}
                      >
                        <Archive className="h-3.5 w-3.5" /> Retire Node
                      </Button>
                    )}

                    {addingNode && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Add child under {selected.name}
                        </p>
                        <Input
                          value={newNodeName}
                          onChange={(e) => setNewNodeName(e.target.value)}
                          placeholder="New node name..."
                          data-testid="input-new-node-name"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={!newNodeName.trim()}
                            onClick={async () => {
                              try {
                                const config = CHILD_CONFIG[selected.type.toLowerCase()];
                                if (!config) {
                                  toast({ title: "Cannot add children to this node type", variant: "destructive" });
                                  return;
                                }
                                const res = await authFetch(
                                  `/api/${config.endpoint}/${selected.id}/${config.childType.toLowerCase()}s`,
                                  {
                                    method: "POST",
                                    body: JSON.stringify({ name: newNodeName.trim(), label: newNodeName.trim() }),
                                  }
                                );
                                if (!res.ok) throw new Error("Failed to create node");
                                toast({ title: `${config.childType} created successfully` });
                                setAddingNode(false);
                                setNewNodeName("");
                                refetchHierarchy();
                              } catch {
                                toast({ title: "Failed to create node", variant: "destructive" });
                              }
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Create
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => { setAddingNode(false); setNewNodeName(""); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    Select a node to view and edit its details
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── EDIT MODAL ─── */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingNode(null)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-serif text-sm font-semibold" id="edit-node-title">
                Edit {editingNode.type}
              </h3>
              <div className="space-y-2">
                <label htmlFor="edit-node-name" className="text-xs text-muted-foreground">Name</label>
                <Input
                  id="edit-node-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setEditingNode(null)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    try {
                      const body: Record<string, string> = { name: editName.trim() };
                      // Years use 'label' not 'name'
                      if (editingNode.type.toLowerCase() === 'year') {
                        body.label = editName.trim();
                      }
                      const res = await authFetch(
                        `/api/hierarchy/${editingNode.type.toLowerCase()}/${editingNode.id}`,
                        {
                          method: 'PATCH',
                          body: JSON.stringify(body),
                        }
                      );
                      if (!res.ok) throw new Error("Failed");
                      toast({ title: `${editingNode.type} updated successfully` });
                      setEditingNode(null);
                      refetchHierarchy();
                    } catch {
                      toast({ title: "Update failed", variant: "destructive" });
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
