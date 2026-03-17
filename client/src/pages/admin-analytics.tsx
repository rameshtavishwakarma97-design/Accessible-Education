import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#355872", "#7AAACE", "#9CD5FF", "#5C7A99", "#2E8B6E"];

const engagementData = [
  { week: "W1", views: 420, unique: 280 },
  { week: "W2", views: 510, unique: 310 },
  { week: "W3", views: 480, unique: 290 },
  { week: "W4", views: 560, unique: 340 },
  { week: "W5", views: 620, unique: 380 },
  { week: "W6", views: 590, unique: 360 },
  { week: "W7", views: 640, unique: 400 },
  { week: "W8", views: 710, unique: 420 },
];

const formatPreference = [
  { name: "Original", value: 45 },
  { name: "Audio", value: 22 },
  { name: "Captions", value: 18 },
  { name: "Simplified", value: 10 },
  { name: "Braille", value: 5 },
];

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export default function AdminAnalytics() {
  const { user } = useAuth();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => fetchWithAuth("/api/admin/dashboard/stats"),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Analytics" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      </div>
    );
  }

  const adminStats = statsData || {};
  const monthlyConversions = adminStats.monthlyConversions || [
    { month: "Sep", successful: 45, failed: 3 },
    { month: "Oct", successful: 62, failed: 5 },
    { month: "Nov", successful: 58, failed: 2 },
    { month: "Dec", successful: 71, failed: 4 },
    { month: "Jan", successful: 85, failed: 6 },
    { month: "Feb", successful: 92, failed: 3 },
  ];
  const formatUsage = adminStats.formatUsage || [
    { format: "Audio", usage: 78 },
    { format: "Captions", usage: 65 },
    { format: "Simplified", usage: 52 },
    { format: "Braille", usage: 24 },
    { format: "High Contrast", usage: 18 },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Analytics" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Content Engagement — Weekly</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="views" stroke="#7AAACE" fill="#9CD5FF" fillOpacity={0.3} strokeWidth={2} />
                    <Area type="monotone" dataKey="unique" stroke="#355872" fill="#355872" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Format Preference Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={formatPreference} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}%`} labelLine>
                      {formatPreference.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Monthly Conversion Volume</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyConversions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="successful" fill="#7AAACE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#C0392B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Format Usage Rates (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={formatUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="format" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#355872" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
