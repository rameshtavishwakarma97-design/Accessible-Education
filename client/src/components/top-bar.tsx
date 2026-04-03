import { useAuth } from "@/lib/auth-context";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  title?: string;
  breadcrumb?: string;
  unreadCount?: number;
}

export function TopBar({ title, breadcrumb, unreadCount = 0 }: TopBarProps) {
  const { role, user, setShowProfileSetup } = useAuth();

  const roleLabel = role === "student" ? "Student" : role === "teacher" ? "Teacher" : "Admin";

  return (
    <header
      className="flex h-14 items-center justify-between gap-4 px-4"
      style={{ 
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(195, 199, 206, 0.15)",
      }}
      role="banner"
      data-testid="top-bar"
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="flex flex-col">
          {title && <h1 className="text-sm font-semibold leading-tight" style={{ color: "#1D1D1F", letterSpacing: "-0.01em" }}>{title}</h1>}
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className="hidden sm:block">
              <span className="text-xs" style={{ color: "#6E7781" }}>{breadcrumb}</span>
            </nav>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="no-default-active-elevate text-xs capitalize" style={{ borderColor: "rgba(195, 199, 206, 0.3)", color: "#6E7781" }}>
          {roleLabel} View
        </Badge>
        {role === "student" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProfileSetup(true)}
            data-testid="button-profile-setup"
            className="text-xs"
          >
            Profile Setup
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"}
          data-testid="button-notifications"
        >
          <div className="relative">
            <Bell className="h-4 w-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </Button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
          style={{ background: "linear-gradient(135deg, #113049, #2A4660)", color: "#FFFFFF" }}
          data-testid="avatar-user"
          role="img"
          aria-label={user?.name ? `${user.name} — profile avatar` : "User avatar"}
        >
          <span aria-hidden="true">
            {(user?.name ?? "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
        </div>
      </div>
    </header>
  );
}
