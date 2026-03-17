import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Eye, EyeOff, Copy, AlertTriangle, Shield, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const costData = [
  { program: "B.Tech CS", ttsChars: 245000, videoMin: 128, braillePages: 340, cost: "$124.50" },
  { program: "MBA", ttsChars: 180000, videoMin: 96, braillePages: 210, cost: "$89.30" },
  { program: "M.Tech CS", ttsChars: 120000, videoMin: 64, braillePages: 180, cost: "$62.10" },
  { program: "PGDM", ttsChars: 95000, videoMin: 48, braillePages: 120, cost: "$45.80" },
];

const costChart = [
  { month: "Sep", cost: 280 },
  { month: "Oct", cost: 320 },
  { month: "Nov", cost: 290 },
  { month: "Dec", cost: 250 },
  { month: "Jan", cost: 340 },
  { month: "Feb", cost: 310 },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [tab, setTab] = useState("institution");
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Platform Settings" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1000px] space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap" data-testid="tabs-settings">
              <TabsTrigger value="institution">Institution</TabsTrigger>
              <TabsTrigger value="academic">Academic Structure</TabsTrigger>
              <TabsTrigger value="api">API & Integrations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="costs">Cost Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="institution" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-serif text-sm font-semibold">Institution Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inst-name">Institution Name</Label>
                      <Input id="inst-name" defaultValue="National Institute of Technology" data-testid="input-inst-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-domain">Primary Domain</Label>
                      <Input id="inst-domain" defaultValue="nit.edu" data-testid="input-inst-domain" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-lang">Default Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="inst-lang" data-testid="select-inst-lang"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst-year-start">Academic Year Start</Label>
                      <Select defaultValue="july">
                        <SelectTrigger id="inst-year-start" data-testid="select-year-start"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="january">January</SelectItem>
                          <SelectItem value="april">April</SelectItem>
                          <SelectItem value="july">July</SelectItem>
                          <SelectItem value="september">September</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Institution Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-36 items-center justify-center rounded-md border-2 border-dashed">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Button variant="secondary" size="sm" data-testid="button-upload-logo">Upload Logo</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand-color">Brand Color</Label>
                    <div className="flex items-center gap-3">
                      <Input id="brand-color" defaultValue="#355872" className="w-32 font-mono" data-testid="input-brand-color" />
                      <div className="h-9 w-9 rounded-md" style={{ backgroundColor: "#355872" }} />
                      <Badge variant="outline" className="no-default-active-elevate text-xs bg-[#E8F5E9] text-[#2E8B6E]">
                        WCAG AA Pass (8.1:1)
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={() => toast({ title: "Settings saved", description: "Institution settings updated successfully." })} data-testid="button-save-institution">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-serif text-sm font-semibold">Hierarchy Levels</h3>
                  <div className="space-y-3">
                    {["Institute", "School/College", "Department", "Program", "Year", "Division/Section"].map((level, i) => (
                      <div key={level} className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground">L{i + 1}</span>
                          <Input defaultValue={level} className="w-48 text-sm" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`required-${i}`} className="text-xs">Required</Label>
                            <Switch id={`required-${i}`} defaultChecked={i < 4} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`enabled-${i}`} className="text-xs">Enabled</Label>
                            <Switch id={`enabled-${i}`} defaultChecked />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3 className="font-serif text-sm font-semibold pt-4">Enrollment Policies</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="self-enroll">Allow student self-enrollment for electives</Label>
                      <Switch id="self-enroll" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Elective selection deadline</Label>
                      <Input id="deadline" type="date" defaultValue="2026-03-15" className="w-48" />
                    </div>
                  </div>
                  <Button onClick={() => toast({ title: "Settings saved" })} data-testid="button-save-academic">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="mt-4 space-y-4">
              <div className="rounded-md bg-[#FFF3E0]/50 border border-[#C07B1A]/30 p-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#C07B1A] shrink-0" />
                <p className="text-sm text-[#C07B1A]">API keys are environment-managed and read-only in this build. Contact your system administrator to update them.</p>
              </div>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-sm font-semibold">API Keys</h3>
                    <Badge variant="outline" className="no-default-active-elevate text-[10px] text-muted-foreground">
                      Environment-managed · Read-only
                    </Badge>
                  </div>
                  {[
                    { label: "TTS API Key", value: "sk-••••••••7f3a" },
                    { label: "LMS Integration Token", value: "lms-••••••••4b2c" },
                    { label: "SSO OAuth Secret", value: "sso-••••••••9e1d" },
                  ].map((key) => (
                    <div key={key.label} className="space-y-2">
                      <Label>{key.label}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={showApiKey ? "sk-abcdef1234567890abcdef7f3a" : key.value}
                          readOnly
                          disabled
                          title="This value is managed via environment variables and cannot be edited here."
                          className="font-mono text-sm bg-muted cursor-not-allowed"
                        />
                        <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)} aria-label={showApiKey ? "Hide key" : "Show key"}>
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toast({ title: "Copied to clipboard" })} aria-label="Copy key">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label>Braille Conversion Library</Label>
                    <div className="flex items-center gap-2">
                      <Input value="liblouis v3.28.0" readOnly disabled title="Environment-managed" className="bg-muted cursor-not-allowed" />
                      <Badge variant="outline" className="no-default-active-elevate text-xs bg-[#E8F5E9] text-[#2E8B6E]">Latest</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-serif text-sm font-semibold">Email Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="smtp-host">SMTP Host</Label><Input id="smtp-host" defaultValue="smtp.university.edu" /></div>
                    <div className="space-y-2"><Label htmlFor="smtp-port">SMTP Port</Label><Input id="smtp-port" defaultValue="587" /></div>
                  </div>
                  <h3 className="font-serif text-sm font-semibold pt-4">Default Notification Preferences</h3>
                  <div className="space-y-3">
                    {["Content published", "Assessment due", "Conversion completed", "Enrollment changes"].map((pref) => (
                      <div key={pref} className="flex items-center justify-between">
                        <span className="text-sm">{pref}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2"><Label className="text-xs">Email</Label><Switch defaultChecked /></div>
                          <div className="flex items-center gap-2"><Label className="text-xs">In-app</Label><Switch defaultChecked /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => toast({ title: "Notification settings saved" })}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-serif text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> Security Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input id="session-timeout" type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-password">Min Password Length</Label>
                      <Input id="min-password" type="number" defaultValue="12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
                      <Input id="audit-retention" type="number" defaultValue="365" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Require uppercase + number + special char</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Two-factor authentication</Label>
                      <Switch />
                    </div>
                  </div>
                  <Button onClick={() => toast({ title: "Security settings saved" })}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4" /> API Usage — Current Billing Period</h3>
                    <Button variant="secondary" size="sm" className="gap-1" data-testid="button-export-costs"><Copy className="h-3.5 w-3.5" /> Export CSV</Button>
                  </div>
                  <div className="rounded-md border">
                    <table className="w-full" aria-label="Cost breakdown">
                      <thead>
                        <tr className="border-b bg-primary text-primary-foreground">
                          <th scope="col" className="text-left text-xs font-medium p-3">Program</th>
                          <th scope="col" className="text-right text-xs font-medium p-3">TTS Characters</th>
                          <th scope="col" className="text-right text-xs font-medium p-3 hidden sm:table-cell">Video Minutes</th>
                          <th scope="col" className="text-right text-xs font-medium p-3 hidden md:table-cell">Braille Pages</th>
                          <th scope="col" className="text-right text-xs font-medium p-3">Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costData.map((d, i) => (
                          <tr key={d.program} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}>
                            <td className="p-3 text-sm font-medium">{d.program}</td>
                            <td className="p-3 text-sm text-right font-mono">{d.ttsChars.toLocaleString()}</td>
                            <td className="p-3 text-sm text-right font-mono hidden sm:table-cell">{d.videoMin}</td>
                            <td className="p-3 text-sm text-right font-mono hidden md:table-cell">{d.braillePages}</td>
                            <td className="p-3 text-sm text-right font-medium">{d.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Monthly Cost Trend</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={costChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => `$${v}`} />
                        <Bar dataKey="cost" fill="#7AAACE" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
