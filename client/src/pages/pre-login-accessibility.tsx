import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Volume2, Accessibility } from "lucide-react";

export default function PreLoginAccessibilityPage() {
  const [fontSize, setFontSize] = useState("16");
  const [contrastMode, setContrastMode] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-[640px] space-y-6">
        <Link href="/login" data-testid="link-back-to-login">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Accessibility className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-semibold" data-testid="text-pre-login-title">
            Accessibility Preferences
          </h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Set up your reading preferences before signing in. These will apply immediately
          and can be updated anytime from your profile.
        </p>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="font-size-select">Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger id="font-size-select" data-testid="select-font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">Small (12px)</SelectItem>
                  <SelectItem value="14">Medium Small (14px)</SelectItem>
                  <SelectItem value="16">Medium (16px) — Default</SelectItem>
                  <SelectItem value="18">Medium Large (18px)</SelectItem>
                  <SelectItem value="20">Large (20px)</SelectItem>
                  <SelectItem value="24">Extra Large (24px)</SelectItem>
                  <SelectItem value="28">Maximum (28px)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose a comfortable reading size. You can change this any time after logging in.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="contrast-toggle">High Contrast Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Increases text and border contrast for better visibility.
                </p>
              </div>
              <Switch
                id="contrast-toggle"
                checked={contrastMode}
                onCheckedChange={setContrastMode}
                data-testid="switch-contrast"
              />
            </div>

            <div className="space-y-3">
              <Label>Text-to-Speech Demo</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setPlaying(!playing)}
                  className="gap-2"
                  data-testid="button-tts-demo"
                >
                  <Volume2 className="h-4 w-4" />
                  {playing ? "Stop Sample" : "Play Sample Text"}
                </Button>
                {playing && (
                  <span className="text-sm text-muted-foreground animate-pulse" role="status">
                    Playing: "Welcome to the Accessible Education Platform..."
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Test how text-to-speech sounds. After logging in, you can adjust speed and voice.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md bg-accent p-4 text-center">
          <p className="text-sm text-muted-foreground">
            These settings are stored locally and will be applied when you log in.
            Your full accessibility profile can be configured after sign-in.
          </p>
        </div>
      </div>
    </div>
  );
}
