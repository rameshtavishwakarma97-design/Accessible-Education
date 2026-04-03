import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
  Users,
  Building2,
  GraduationCap,
  RefreshCw,
  BarChart3,
  Settings,
  Megaphone,
  Accessibility,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const studentNav = [
  { title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard },
  { title: "Courses", url: "/student/courses", icon: BookOpen },
  { title: "Assessments", url: "/student/assessments", icon: ClipboardList },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
];

const teacherNav = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
  { title: "My Courses", url: "/teacher/courses", icon: BookOpen },
  { title: "Content Library", url: "/teacher/content", icon: FileText },
  { title: "Conversion Queue", url: "/teacher/conversions", icon: RefreshCw },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
];

const adminNav = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Hierarchy", url: "/admin/hierarchy", icon: Building2 },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Courses", url: "/admin/courses", icon: BookOpen },
  { title: "Enrollment", url: "/admin/enrollment", icon: GraduationCap },
  { title: "Conversions", url: "/admin/conversions", icon: RefreshCw },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { role, user, logout } = useAuth();
  const [location] = useLocation();
  const [, navigate] = useLocation();

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["messages-unread"],
    queryFn: () =>
      fetch("/api/messages/unread-count", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }).then((r) => r.json()),
    refetchInterval: 30_000,
  });
  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      await logout();
      navigate("/login");
    }
  };

  const navItems = role === "student" ? studentNav : role === "teacher" ? teacherNav : adminNav;
  const roleLabel = role === "student" ? "Student" : role === "teacher" ? "Teacher" : "Administrator";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md" style={{ background: "linear-gradient(135deg, #113049, #2A4660)" }}>
            <Accessibility className="h-5 w-5" style={{ color: "#FFFFFF" }} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight" style={{ fontFamily: "'Lora', Georgia, serif", letterSpacing: "-0.02em" }} data-testid="text-app-name">
              AccessEd
            </span>
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <Link
                        href={item.url}
                        aria-current={isActive ? "page" : undefined}
                        data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.title}</span>
                        {item.title === "Messages" && unreadCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs no-default-active-elevate"
                            aria-label={`${unreadCount} unread messages`}
                          >
                            <span aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
          aria-label="Sign out"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
        <Link href="/profile" data-testid="link-profile">
          <div className="flex items-center gap-3 rounded-md p-2 hover-elevate">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {(user?.name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">{user?.name ?? ""}</span>
              <span className="text-xs text-muted-foreground">{user?.email ?? ""}</span>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
