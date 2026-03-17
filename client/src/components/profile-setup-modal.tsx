import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { DISABILITY_LABELS, type DisabilityType } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DISABILITIES: DisabilityType[] = [
  "blind", "low_vision", "deaf", "hard_of_hearing",
  "mute", "speech_impaired", "adhd", "dyslexia",
  "autism", "cognitive", "motor", "other",
];

export function ProfileSetupModal() {
  const { showProfileSetup, setShowProfileSetup, user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<DisabilityType[]>(
    (user?.disabilities as DisabilityType[]) ?? []
  );
  const [fontSize, setFontSize] = useState([1.0]);
  const [ttsSpeed, setTtsSpeed] = useState([1.0]);
  const [extendedTime, setExtendedTime] = useState([1.0]);
  const [contrastMode, setContrastMode] = useState(false);
  const [screenReader, setScreenReader] = useState("");
  const [brailleDisplay, setBrailleDisplay] = useState("");
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.disabilities) {
      setSelected(user.disabilities as DisabilityType[]);
    }
    if (user?.preferences) {
      const prefs = user.preferences as any;
      setFontSize([prefs.fontSize ?? 1.0]);
      setTtsSpeed([prefs.ttsSpeed ?? 1.0]);
      setExtendedTime([prefs.extendedTimeMultiplier ?? 1.0]);
      setContrastMode(prefs.contrastMode ?? false);
      setScreenReader(prefs.screenReader ?? "");
      setBrailleDisplay(prefs.brailleDisplay ?? "");
    }
  }, [user]);

  const toggleDisability = (d: DisabilityType) => {
    setSelected((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  // Disabilities that auto-enable voice
  const VOICE_AUTO_ENABLE_DISABILITIES: DisabilityType[] = [
    "motor",
    "dyslexia",
    "adhd",
  ];
  const voiceEnabled = selected.some((d) =>
    VOICE_AUTO_ENABLE_DISABILITIES.includes(d)
  );

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/users/${user.id}/accessibility-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          disabilities: selected,
          preferences: {
            fontSize: fontSize[0],
            ttsSpeed: ttsSpeed[0],
            extendedTimeMultiplier: extendedTime[0],
            contrastMode,
            screenReader,
            brailleDisplay,
            voiceEnabled,
          },
          activeModules: [],
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setComplete(true);
      setTimeout(() => {
        setShowProfileSetup(false);
        setComplete(false);
        setStep(1);
        setSaving(false);
        toast({
          title: "Profile saved",
          description: `Your profile is set up. ${getModuleCount()} accessibility modules are now active.`,
        });
        // Reload to pick up new preferences
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setSaving(false);
      toast({
        title: "Save failed",
        description: error.message || "Could not save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getModuleCount = () => {
    let count = 0;
    if (selected.some((d) => ["blind", "low_vision"].includes(d))) count++;
    if (selected.some((d) => ["deaf", "hard_of_hearing"].includes(d))) count++;
    if (selected.some((d) => ["mute", "speech_impaired"].includes(d))) count++;
    if (selected.some((d) => ["adhd", "dyslexia", "autism", "cognitive"].includes(d))) count++;
    if (selected.length > 0) count++;
    return count;
  };

  if (!showProfileSetup) return null;

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-[600px] [&>button]:hidden"
        aria-labelledby="profile-setup-title"
        aria-modal="true"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {complete ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2E8B6E] text-white animate-in zoom-in duration-300">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-xl font-semibold" role="alert">
              Profile Complete
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {getModuleCount()} accessibility modules are now active.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle id="profile-setup-title" className="font-serif text-xl">
                Set Up Your Accessibility Profile
              </DialogTitle>
              <p className="text-sm text-muted-foreground" aria-label={`Step ${step} of 3`}>
                Step {step} of 3
              </p>
            </DialogHeader>

            <div className="flex items-center gap-2 py-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"
                    }`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm font-medium">
                  What describes your experience? (Select all that apply)
                </p>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="listbox"
                  aria-multiselectable="true"
                  aria-label="Disability selection"
                >
                  {DISABILITIES.map((d) => (
                    <button
                      key={d}
                      role="option"
                      aria-selected={selected.includes(d)}
                      onClick={() => toggleDisability(d)}
                      className={`flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors ${selected.includes(d)
                          ? "border-primary bg-accent"
                          : "border-border"
                        }`}
                      data-testid={`option-disability-${d}`}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${selected.includes(d)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted"
                          }`}
                      >
                        {selected.includes(d) && <Check className="h-3 w-3" />}
                      </div>
                      {DISABILITY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <p className="text-sm font-medium">Configure your preferences</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size: {fontSize[0].toFixed(1)}x</Label>
                    <Slider
                      id="font-size"
                      min={0.5}
                      max={3.0}
                      step={0.1}
                      value={fontSize}
                      onValueChange={setFontSize}
                      aria-valuetext={`Font size: ${fontSize[0].toFixed(1)}x`}
                      data-testid="slider-font-size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tts-speed">Text-to-Speech Speed: {ttsSpeed[0].toFixed(1)}x</Label>
                    <Slider
                      id="tts-speed"
                      min={0.5}
                      max={2.0}
                      step={0.25}
                      value={ttsSpeed}
                      onValueChange={setTtsSpeed}
                      aria-valuetext={`TTS speed: ${ttsSpeed[0].toFixed(1)}x`}
                      data-testid="slider-tts-speed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extended-time">Extended Time Multiplier: {extendedTime[0].toFixed(1)}x</Label>
                    <Slider
                      id="extended-time"
                      min={1.0}
                      max={3.0}
                      step={0.25}
                      value={extendedTime}
                      onValueChange={setExtendedTime}
                      aria-valuetext={`Extended time: ${extendedTime[0].toFixed(1)}x`}
                      data-testid="slider-extended-time"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contrast-mode">High Contrast Mode</Label>
                    <Switch
                      id="contrast-mode"
                      checked={contrastMode}
                      onCheckedChange={setContrastMode}
                      data-testid="switch-contrast-mode"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <p className="text-sm font-medium">Register your assistive devices</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="screen-reader">Screen Reader</Label>
                    <Select value={screenReader} onValueChange={setScreenReader}>
                      <SelectTrigger id="screen-reader" data-testid="select-screen-reader">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nvda">NVDA</SelectItem>
                        <SelectItem value="jaws">JAWS</SelectItem>
                        <SelectItem value="voiceover">VoiceOver</SelectItem>
                        <SelectItem value="talkback">TalkBack</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="braille-display">Braille Display</Label>
                    <Select value={brailleDisplay} onValueChange={setBrailleDisplay}>
                      <SelectTrigger id="braille-display" data-testid="select-braille-display">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="focus-40">Focus 40</SelectItem>
                        <SelectItem value="focus-80">Focus 80</SelectItem>
                        <SelectItem value="brailliant-bi40">Brailliant BI 40</SelectItem>
                        <SelectItem value="refreshabraille-18">Refreshabraille 18</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aac-device">AAC Device (optional)</Label>
                    <Select defaultValue="none">
                      <SelectTrigger id="aac-device" data-testid="select-aac-device">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="tobii">Tobii Dynavox</SelectItem>
                        <SelectItem value="prc">PRC Accent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="secondary"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                data-testid="button-profile-back"
              >
                Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 1 && selected.length === 0}
                  data-testid="button-profile-next"
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving} data-testid="button-profile-save">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Profile"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
