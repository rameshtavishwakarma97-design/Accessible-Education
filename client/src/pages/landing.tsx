import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Upload,
  Wand2,
  GraduationCap,
  FileText,
  Brain,
  Sliders,
  Building2,
  Mic,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  ShieldCheck,
  Accessibility,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
 *  Design Tokens (from Stitch "Academic Atelier" DS)
 * ───────────────────────────────────────────────────────── */
const T = {
  primary: "#113049",
  primaryContainer: "#2A4660",
  accent: "#7AAACE",
  highlight: "#9CD5FF",
  surface: "#FAFAF9",
  surfaceLow: "#F3F4F3",
  surfaceLowest: "#FFFFFF",
  surfaceContainer: "#EEEEED",
  text: "#1D1D1F",
  textMuted: "#6E7781",
  textOnPrimary: "#FFFFFF",
  border: "#E5E5E7",
  success: "#2E8B6E",
  ghostBorder: "rgba(195, 199, 206, 0.15)",
  ambientShadow: "0px 4px 30px rgba(29, 29, 31, 0.03)",
  whisperShadow: "0px 12px 80px rgba(29, 29, 31, 0.04)",
  mono: "var(--font-mono)",
  sans: "var(--font-sans)",
} as const;

/* ─────────────────────────────────────────────────────────
 *  NavBar
 * ───────────────────────────────────────────────────────── */
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For You", href: "#stakeholders" },
    { label: "Contact", href: "#cta" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(250,250,249,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.ghostBorder}` : "none",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: T.primaryContainer,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Accessibility size={20} color={T.textOnPrimary} strokeWidth={1.5} />
          </div>
          <span
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: T.text,
              letterSpacing: "-0.02em",
            }}
          >
            AccessEd
          </span>
        </a>

        {/* Desktop links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
          className="landing-nav-desktop"
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: T.textMuted,
                textDecoration: "none",
                transition: "color 0.2s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
            >
              {l.label}
            </a>
          ))}
          <Link href="/login">
            <button
              style={{
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: T.primaryContainer,
                background: "transparent",
                border: `1.5px solid ${T.primaryContainer}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.primaryContainer;
                e.currentTarget.style.color = T.textOnPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = T.primaryContainer;
              }}
            >
              Sign In
            </button>
          </Link>
          <a href="#cta">
            <button
              style={{
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: T.textOnPrimary,
                background: T.primaryContainer,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.01em",
              }}
            >
              Get Started
            </button>
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="landing-nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X size={24} color={T.text} />
          ) : (
            <Menu size={24} color={T.text} />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="landing-nav-mobile-menu"
          style={{
            background: T.surfaceLowest,
            borderTop: `1px solid ${T.border}`,
            padding: "16px 24px",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                fontSize: 15,
                fontWeight: 500,
                color: T.text,
                textDecoration: "none",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Link href="/login">
              <button
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.primaryContainer,
                  background: "transparent",
                  border: `1.5px solid ${T.primaryContainer}`,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </Link>
            <a href="#cta" style={{ flex: 1 }}>
              <button
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.textOnPrimary,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.primaryContainer})`,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Get Started
              </button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Hero Section
 * ───────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      style={{
        background: T.surface,
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
        className="landing-hero-grid"
      >
        {/* Left — Copy */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 9999,
              background: T.surfaceLow,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: T.success,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.textMuted,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Now available for institutions
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
              fontWeight: 700,
              color: T.primaryContainer,
              lineHeight: 1.1,
              letterSpacing: "-0.022em",
              marginBottom: 20,
            }}
          >
            Education
            <br />
            Without Barriers
          </h1>

          <p
            style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: T.textMuted,
              maxWidth: 480,
              marginBottom: 32,
            }}
          >
            The only LMS that automatically transforms every document into
            accessible formats — Braille, Audio, Simplified Text, and High
            Contrast — so every student can learn their way.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/login">
              <button
                style={{
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: T.textOnPrimary,
                  background: T.primaryContainer,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(17,48,73,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Try It Free Now
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </Link>
          </div>

          {/* Trust */}
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `hsl(${210 + i * 15}, 30%, ${70 - i * 5}%)`,
                    border: `2px solid ${T.surfaceLowest}`,
                    marginLeft: i > 0 ? -10 : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.surfaceLowest,
                  }}
                >
                  {["IIT", "NIT", "VIT", "MIT"][i]}
                </div>
              ))}
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.text,
                  lineHeight: 1.3,
                }}
              >
                Trusted by 50+ Universities
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: T.textMuted,
                  lineHeight: 1.3,
                }}
              >
                Across 8 countries worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Right — Product Preview */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: T.surfaceLowest,
              borderRadius: 16,
              boxShadow: T.whisperShadow,
              overflow: "hidden",
              border: `1px solid ${T.ghostBorder}`,
            }}
          >
            {/* Mock browser chrome */}
            <div
              style={{
                background: T.surfaceLow,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
              </div>
              <div
                style={{
                  flex: 1,
                  background: T.surfaceContainer,
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 11,
                  color: T.textMuted,
                  textAlign: "center",
                }}
              >
                app.accessed.io/dashboard
              </div>
            </div>

            {/* Mock dashboard */}
            <div style={{ padding: 20 }}>
              {/* Top nav */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: `linear-gradient(135deg, ${T.primary}, ${T.primaryContainer})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Accessibility size={14} color={T.textOnPrimary} strokeWidth={1.5} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                    Content Viewer
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {["Original", "Audio", "Simplified", "Braille", "High Contrast"].map(
                    (f, i) => (
                      <span
                        key={f}
                        style={{
                          padding: "3px 8px",
                          fontSize: 10,
                          fontWeight: 500,
                          borderRadius: 9999,
                          background: i === 2 ? T.primaryContainer : T.surfaceLow,
                          color: i === 2 ? T.textOnPrimary : T.textMuted,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {f}
                      </span>
                    ),
                  )}
                </div>
              </div>

              {/* Content preview */}
              <div
                style={{
                  background: T.surfaceLow,
                  borderRadius: 10,
                  padding: 16,
                  minHeight: 180,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: T.text,
                    marginBottom: 8,
                  }}
                >
                  📄 Quantum Mechanics — Chapter 3
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: T.textMuted,
                    lineHeight: 1.7,
                    maxWidth: 400,
                  }}
                >
                  <span style={{ fontWeight: 600, color: T.accent }}>
                    Simplified Version:
                  </span>{" "}
                  Quantum mechanics studies very small things, like atoms and
                  particles. These tiny objects behave differently than what we
                  see in everyday life. They can exist in multiple states at
                  once…
                </div>
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      padding: "4px 10px",
                      fontSize: 10,
                      borderRadius: 6,
                      background: "rgba(46,139,110,0.1)",
                      color: T.success,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <CheckCircle2 size={10} /> All formats ready
                  </div>
                  <div
                    style={{
                      padding: "4px 10px",
                      fontSize: 10,
                      borderRadius: 6,
                      background: "rgba(122,170,206,0.15)",
                      color: T.accent,
                      fontWeight: 600,
                    }}
                  >
                    Grade 6 reading level
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              background: T.surfaceLowest,
              borderRadius: 12,
              padding: "12px 16px",
              boxShadow: T.ambientShadow,
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${T.ghostBorder}`,
            }}
            className="landing-floating-badge"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(46,139,110,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wand2 size={18} color={T.success} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                5 Formats Auto-Generated
              </p>
              <p style={{ fontSize: 11, color: T.textMuted }}>
                From a single PDF upload
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  How It Works
 * ───────────────────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload",
    desc: "Teacher uploads a standard PDF or Word document. That's it — no special formatting required.",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Auto-Convert",
    desc: "Our AI engine generates 5 accessible formats automatically — Braille, Audio, Simplified Text, High Contrast, and the Original.",
  },
  {
    num: "03",
    icon: GraduationCap,
    title: "Learn",
    desc: "Students instantly access content in their preferred format. The platform adapts to each learner's needs.",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        background: T.surfaceLow,
        padding: "80px 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.accent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 12,
            }}
          >
            How it works
          </span>
          <h2
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 600,
              color: T.text,
              letterSpacing: "-0.022em",
            }}
          >
            Three Steps to Inclusive Education
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
          }}
          className="landing-steps-grid"
        >
          {steps.map((step, i) => (
            <div key={step.num} style={{ position: "relative" }}>
              <div
                style={{
                  background: T.surfaceLowest,
                  borderRadius: 12,
                  padding: 32,
                  boxShadow: T.ambientShadow,
                  height: "100%",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0px 8px 32px rgba(29,29,31,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = T.ambientShadow;
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background:
                        i === 0
                          ? "rgba(42,70,96,0.08)"
                          : i === 1
                          ? "rgba(122,170,206,0.15)"
                          : "rgba(46,139,110,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <step.icon
                      size={22}
                      color={
                        i === 0 ? T.primaryContainer : i === 1 ? T.accent : T.success
                      }
                      strokeWidth={1.5}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 28,
                      fontWeight: 700,
                      color: T.surfaceContainer,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: T.text,
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: T.textMuted,
                  }}
                >
                  {step.desc}
                </p>
              </div>
              {/* Connector */}
              {i < 2 && (
                <div
                  className="landing-step-connector"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: -20,
                    transform: "translateY(-50%)",
                    color: T.surfaceContainer,
                  }}
                >
                  <ChevronRight size={24} strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Features Bento Grid
 * ───────────────────────────────────────────────────────── */
const features = [
  {
    icon: FileText,
    title: "Automated Accessibility Pipeline",
    desc: "Upload once, get 5 formats automatically. Braille (.brf), Audio, Simplified Text, High Contrast PDF, and the Original — all generated in minutes.",
    span: false,
  },
  {
    icon: Brain,
    title: "AI-Powered Simplification",
    desc: "Google Gemini Pro rewrites complex academic text to a Grade 6-8 reading level while preserving all factual information.",
    span: false,
  },
  {
    icon: Sliders,
    title: "Deep Personalization",
    desc: "Each student's profile saves font size, TTS reading speed, contrast modes, and extended time multipliers. The platform adapts on login.",
    span: false,
  },
  {
    icon: Building2,
    title: "Institutional Hierarchy",
    desc: "Built for scale. Data organizes across Institute → School → Department → Program → Division. Perfect for state boards and large NGOs.",
    span: false,
  },
  {
    icon: Mic,
    title: "Voice Commands",
    desc: "Hands-free navigation for motor-impaired students. Browse courses, switch formats, and control playback with natural speech.",
    span: false,
  },
  {
    icon: BarChart3,
    title: "Enterprise Analytics",
    desc: "Track accessibility coverage, conversion success rates, disability distribution, and format usage across your institution in real-time.",
    span: false,
  },
];

function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        background: T.surface,
        padding: "80px 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.accent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 12,
            }}
          >
            Platform capabilities
          </span>
          <h2
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 600,
              color: T.text,
              letterSpacing: "-0.022em",
              marginBottom: 12,
            }}
          >
            Built for Accessibility at Scale
          </h2>
          <p
            style={{
              fontSize: 16,
              color: T.textMuted,
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Every feature is designed to eliminate barriers between students and
            their learning materials.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="landing-features-grid"
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: T.surfaceLowest,
                borderRadius: 12,
                padding: 28,
                boxShadow: T.ambientShadow,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0px 8px 32px rgba(29,29,31,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = T.ambientShadow;
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "rgba(42,70,96,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <f.icon size={20} color={T.primaryContainer} strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: T.textMuted,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Stakeholder Cards
 * ───────────────────────────────────────────────────────── */
const stakeholders = [
  {
    icon: GraduationCap,
    role: "Students",
    tagline: "Learn in the format that works for you.",
    points: [
      "Toggle between 5 accessible formats instantly",
      "Personalized reading settings saved to your profile",
      "Voice commands for hands-free navigation",
      "Built-in TTS with adjustable speed",
    ],
    color: T.accent,
    bg: "rgba(122,170,206,0.08)",
  },
  {
    icon: FileText,
    role: "Teachers",
    tagline: "Upload once. Every student is covered.",
    points: [
      "Upload a standard PDF — formats generate automatically",
      "Review AI-simplified text before publishing",
      "Track conversion status across your content",
      "Zero accessibility formatting required",
    ],
    color: T.primaryContainer,
    bg: "rgba(42,70,96,0.06)",
  },
  {
    icon: ShieldCheck,
    role: "Administrators",
    tagline: "Full visibility across your institution.",
    points: [
      "Institute-wide hierarchy management",
      "Real-time analytics & conversion dashboards",
      "Disability distribution & coverage reports",
      "API keys for third-party integration",
    ],
    color: T.success,
    bg: "rgba(46,139,110,0.08)",
  },
];

function StakeholderSection() {
  return (
    <section
      id="stakeholders"
      style={{
        background: T.surfaceLow,
        padding: "80px 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.accent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 12,
            }}
          >
            For every stakeholder
          </span>
          <h2
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 600,
              color: T.text,
              letterSpacing: "-0.022em",
            }}
          >
            Designed for Your Role
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
          className="landing-stakeholder-grid"
        >
          {stakeholders.map((s) => (
            <div
              key={s.role}
              style={{
                background: T.surfaceLowest,
                borderRadius: 12,
                padding: 32,
                boxShadow: T.ambientShadow,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0px 8px 32px rgba(29,29,31,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = T.ambientShadow;
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <s.icon size={22} color={s.color} strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: T.text,
                  letterSpacing: "-0.01em",
                  marginBottom: 6,
                }}
              >
                {s.role}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: T.textMuted,
                  fontStyle: "italic",
                  marginBottom: 20,
                }}
              >
                "{s.tagline}"
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                {s.points.map((p) => (
                  <li
                    key={p}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 12,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: T.text,
                    }}
                  >
                    <CheckCircle2
                      size={14}
                      color={s.color}
                      strokeWidth={1.5}
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Stats Banner
 * ───────────────────────────────────────────────────────── */
const stats = [
  { value: "5", label: "Accessible Formats" },
  { value: "50+", label: "Universities" },
  { value: "42/42", label: "Test Pass Rate" },
  { value: "99.9%", label: "Uptime" },
];

function StatsBanner() {
  return (
    <section
      style={{
        background: T.surfaceLow,
        padding: "64px 0",
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 32,
          textAlign: "center",
        }}
        className="landing-stats-grid"
      >
        {stats.map((s) => (
          <div key={s.label}>
            <p
              style={{
                fontFamily: T.mono,
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 700,
                color: T.primaryContainer,
                letterSpacing: "-0.03em",
                marginBottom: 4,
              }}
            >
              {s.value}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: T.textMuted,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  CTA Section
 * ───────────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section
      id="cta"
      style={{
        background: T.surface,
        padding: "80px 0",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 600,
            color: T.text,
            letterSpacing: "-0.022em",
            marginBottom: 16,
          }}
        >
          Ready to Make Education Accessible?
        </h2>
        <p
          style={{
            fontSize: 16,
            color: T.textMuted,
            lineHeight: 1.65,
            marginBottom: 32,
            maxWidth: 520,
            margin: "0 auto 32px",
          }}
        >
          Join 50+ universities already using AccessEd to transform their
          educational content into accessible formats for every student.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href="/login">
            <button
              style={{
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 600,
                color: T.textOnPrimary,
                background: T.primaryContainer,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(17,48,73,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Try It Free Now
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Footer
 * ───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        background: T.surfaceLow,
        padding: "48px 0 32px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
        }}
        className="landing-footer-grid"
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: T.primaryContainer,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Accessibility size={16} color={T.textOnPrimary} strokeWidth={1.5} />
            </div>
            <span
              style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 18,
                fontWeight: 600,
                color: T.text,
              }}
            >
              AccessEd
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: T.textMuted,
              lineHeight: 1.65,
              maxWidth: 300,
            }}
          >
            Making education accessible for every student, at every institution.
            Built with care by a team that believes learning is a fundamental right.
          </p>
        </div>

        {[
          {
            title: "Product",
            links: ["Features", "How It Works", "Pricing", "Documentation"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy Policy", "Terms of Service", "Accessibility Statement"],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {col.title}
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
              {col.links.map((link) => (
                <li key={link} style={{ marginBottom: 10 }}>
                  <a
                    href="#"
                    style={{
                      fontSize: 13,
                      color: T.textMuted,
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "32px auto 0",
          padding: "24px 24px 0",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <p style={{ fontSize: 12, color: T.textMuted }}>
          © 2026 AccessEd. All rights reserved.
        </p>
        <p style={{ fontSize: 12, color: T.textMuted }}>
          WCAG 2.1 AA Compliant • SOC 2 Type II
        </p>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Main Landing Page
 * ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div
      style={{
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
        color: T.text,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <NavBar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StakeholderSection />
      <StatsBanner />
      <CtaSection />
      <Footer />

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .landing-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .landing-steps-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-step-connector {
            display: none !important;
          }
          .landing-features-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-stakeholder-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
          .landing-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .landing-nav-desktop {
            display: none !important;
          }
          .landing-nav-mobile-toggle {
            display: block !important;
          }
          .landing-floating-badge {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .landing-nav-mobile-toggle {
            display: none !important;
          }
          .landing-nav-mobile-menu {
            display: none !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .landing-hero-grid {
            gap: 32px !important;
          }
          .landing-features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .landing-stakeholder-grid {
            grid-template-columns: 1fr !important;
          }
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
