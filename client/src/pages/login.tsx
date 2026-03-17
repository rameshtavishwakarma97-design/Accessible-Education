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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[500px] w-[500px] rounded-full bg-[#9CD5FF]/10 blur-[100px]" />
      </div>

      <Card className="relative w-full max-w-[440px]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Accessibility className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl font-semibold" data-testid="text-login-title">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Accessible Education, Unified
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
            <p className="text-xs text-muted-foreground text-center">
              <strong>Test Accounts:</strong> All passwords are <code className="bg-muted px-1 rounded">password123</code>
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                className="rounded bg-muted px-2 py-1 hover:bg-muted/80 transition-colors"
                onClick={() => { setEmail("priya.patel@university.edu"); setPassword("password123"); }}
              >
                👩‍💼 Admin
              </button>
              <button
                type="button"
                className="rounded bg-muted px-2 py-1 hover:bg-muted/80 transition-colors"
                onClick={() => { setEmail("anand.rao@university.edu"); setPassword("password123"); }}
              >
                👨‍🏫 Teacher
              </button>
              <button
                type="button"
                className="rounded bg-muted px-2 py-1 hover:bg-muted/80 transition-colors"
                onClick={() => { setEmail("maya.sharma@university.edu"); setPassword("password123"); }}
              >
                👩‍🎓 Student
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
