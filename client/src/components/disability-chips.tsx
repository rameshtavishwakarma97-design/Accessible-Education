import { Badge } from "@/components/ui/badge";
import { FRIENDLY_CHIP_LABELS, type DisabilityType } from "@/lib/types";
import {
  Eye,
  EyeOff,
  Ear,
  EarOff,
  MicOff,
  Brain,
  BookOpen,
  Hand,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const DISABILITY_ICONS: Record<DisabilityType, typeof Eye> = {
  blind: EyeOff,
  low_vision: Eye,
  deaf: EarOff,
  hard_of_hearing: Ear,
  mute: MicOff,
  speech_impaired: MicOff,
  adhd: Brain,
  dyslexia: BookOpen,
  autism: Sparkles,
  cognitive: Brain,
  motor: Hand,
  other: HelpCircle,
};

export function DisabilityChips({
  disabilities,
  size = "default",
}: {
  disabilities: DisabilityType[];
  size?: "default" | "small";
}) {
  const unique = [...new Set(disabilities.map((d) => FRIENDLY_CHIP_LABELS[d]))];

  return (
    <div className="flex flex-wrap gap-1">
      {unique.map((label) => {
        const disability = disabilities.find(
          (d) => FRIENDLY_CHIP_LABELS[d] === label
        )!;
        const Icon = DISABILITY_ICONS[disability];
        return (
          <Badge
            key={label}
            variant="secondary"
            className={`no-default-active-elevate font-normal ${size === "small" ? "text-[11px] px-1.5 py-0" : "text-xs"
              }`}
            data-testid={`chip-disability-${disability}`}
          >
            <Icon className={size === "small" ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1"} />
            {label}
          </Badge>
        );
      })}
    </div>
  );
}

export function FormatChips({
  formats,
  size = "default",
  statuses = {},
}: {
  formats: string[];
  size?: "default" | "small";
  statuses?: Record<string, string>;
}) {
  const allFormats = [
    { key: "transcript",    label: "Transcript",   short: "Trans" },
    { key: "simplified",    label: "Simplified",   short: "Simp"  },
    { key: "audio",         label: "Audio",        short: "Audio" },
    { key: "high_contrast", label: "High Contrast",short: "HC"    },
    { key: "braille",       label: "Braille",      short: "Braille"},
  ];

  const getChipStyle = (key: string) => {
    const status = statuses[key];
    if (status === 'COMPLETED' || status === 'APPROVED')
      return 'border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-400 opacity-100';
    if (status === 'READYFORREVIEW')
      return 'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-400 opacity-100';
    if (status === 'FAILED')
      return 'border-destructive/60 bg-destructive/10 text-destructive opacity-100';
    if (status === 'IN_PROGRESS' || status === 'CONVERTING')
      return 'border-blue-500/60 bg-blue-500/10 text-blue-700 dark:text-blue-400 opacity-100';
    // PENDING or not in formats array
    return formats.includes(key)
      ? 'opacity-100'
      : 'opacity-30 line-through';
  };

  const getStatusDot = (key: string) => {
    const status = statuses[key];
    if (status === 'COMPLETED' || status === 'APPROVED')
      return <span className="mr-0.5">✓</span>;
    if (status === 'READYFORREVIEW')
      return <span className="mr-0.5">👁</span>;
    if (status === 'FAILED')
      return <span className="mr-0.5">✗</span>;
    if (status === 'IN_PROGRESS' || status === 'CONVERTING')
      return (
        <svg className="inline h-2.5 w-2.5 animate-spin mr-0.5"
             fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      );
    return null;
  };

  return (
    <div className="flex flex-wrap gap-1">
      {allFormats.map((f) => (
        <Badge
          key={f.key}
          variant="outline"
          title={statuses[f.key] || 'Pending'}
          className={`no-default-active-elevate font-normal transition-colors
            ${size === "small"
              ? "text-[10px] px-1 py-0"
              : "text-[11px] px-1.5 py-0"}
            ${getChipStyle(f.key)}`}
          data-testid={`chip-format-${f.key}`}
        >
          {getStatusDot(f.key)}
          {size === "small" ? f.short : f.label}
        </Badge>
      ))}
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    published: { label: "Published", className: "bg-[#E8F5E9] text-[#2E8B6E] border-[#2E8B6E]/20" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    converting: { label: "Converting", className: "bg-[#FFF3E0] text-[#C07B1A] border-[#C07B1A]/20" },
    review_required: { label: "Review Required", className: "bg-[#EBF4FB] text-[#355872] border-[#355872]/20" },
    soft_deleted: { label: "Deleted", className: "bg-destructive/10 text-destructive" },
    upcoming: { label: "Upcoming", className: "bg-[#EBF4FB] text-[#355872]" },
    in_progress: { label: "In Progress", className: "bg-[#FFF3E0] text-[#C07B1A]" },
    completed: { label: "Completed", className: "bg-[#E8F5E9] text-[#2E8B6E]" },
    graded: { label: "Graded", className: "bg-[#E8F5E9] text-[#2E8B6E]" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
    ready_for_review: { label: "Ready for Review", className: "bg-[#EBF4FB] text-[#355872]" },
    active: { label: "Active", className: "bg-[#E8F5E9] text-[#2E8B6E]" },
    inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  };

  const config = configs[status] || { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <Badge
      variant="outline"
      className={`no-default-active-elevate font-normal text-[11px] ${config.className}`}
      data-testid={`chip-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
