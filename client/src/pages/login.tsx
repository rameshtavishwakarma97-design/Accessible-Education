import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Accessibility, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      // After successful login, check the role from the user object
      // The auth context will have the user set, so we redirect based on role
      // We need a small delay for state to propagate, or just read from the response
      // For simplicity, we'll determine the dashboard from the email pattern
      // But actually we should check the user from context after login
      // The login function sets the user in context, and on next render
      // the App router should redirect. Let's just navigate to root.
      // The app's routing logic will handle showing the right dashboard.

      // Determine dashboard based on the user's actual role from the API response
      const token = localStorage.getItem("auth_token");
      if (token) {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          if (userData.role === "admin") {
            setLocation("/admin/dashboard");
          } else if (userData.role === "teacher") {
            setLocation("/teacher/dashboard");
          } else {
            setLocation("/student/dashboard");
          }
          return;
        }
      }
      // Fallback
      setLocation("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "#FAFAF9" }}>
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[600px] w-[600px] rounded-full blur-[120px]" style={{ background: "rgba(122,170,206,0.08)" }} />
      </div>

      <div className="relative w-full max-w-[440px]">
        {/* Back to home link */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#6E7781", textDecoration: "none" }}>
            <span>←</span> Back to Home
          </Link>
        </div>

        <Card className="relative" style={{ borderRadius: 12, boxShadow: "0px 4px 20px rgba(29, 29, 31, 0.06)", border: "1px solid rgba(195, 199, 206, 0.2)" }}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #113049, #2A4660)" }}>
                <Accessibility className="h-6 w-6" style={{ color: "#FFFFFF" }} />
              </div>
              <h2 className="text-2xl font-semibold" style={{ fontFamily: "'Lora', Georgia, serif", color: "#1D1D1F", letterSpacing: "-0.022em" }} data-testid="text-login-title">
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: "#6E7781" }}>
                Sign in to AccessEd
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={isLoading}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={isLoading}
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            {error && (
              <div id="login-error" role="alert" aria-live="assertive" className="text-sm text-destructive" data-testid="text-login-error">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-sign-in">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/pre-login-accessibility"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                data-testid="link-pre-login-accessibility"
              >
                Adjust accessibility before logging in
              </Link>
            </div>

            <div className="mt-4 rounded-md bg-accent p-3">
              <p className="text-xs text-center font-semibold" style={{ color: "#2A4660", marginBottom: 4 }}>
                👇 Click a role below to instantly log in & explore
              </p>
              <p className="text-xs text-muted-foreground text-center" style={{ marginBottom: 2 }}>
                No signup needed — credentials are auto-filled for you.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="rounded px-2 py-2 transition-all"
                  style={{ background: "rgba(42,70,96,0.08)", border: "1.5px solid rgba(42,70,96,0.15)", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(42,70,96,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(42,70,96,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  onClick={() => { setEmail("priya.patel@university.edu"); setPassword("password123"); }}
                >
                  👩‍💼 Admin
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-2 transition-all"
                  style={{ background: "rgba(122,170,206,0.12)", border: "1.5px solid rgba(122,170,206,0.2)", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(122,170,206,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(122,170,206,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  onClick={() => { setEmail("anand.rao@university.edu"); setPassword("password123"); }}
                >
                  👨‍🏫 Teacher
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-2 transition-all"
                  style={{ background: "rgba(46,139,110,0.08)", border: "1.5px solid rgba(46,139,110,0.15)", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(46,139,110,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(46,139,110,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  onClick={() => { setEmail("maya.sharma@university.edu"); setPassword("password123"); }}
                >
                  👩‍🎓 Student
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
