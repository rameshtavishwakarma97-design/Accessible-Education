/** Shared types and constants — extracted from mock-data.ts so nothing needs to import that file. */

export type UserRole = "student" | "teacher" | "admin";

export type DisabilityType =
    | "blind"
    | "low_vision"
    | "deaf"
    | "hard_of_hearing"
    | "mute"
    | "speech_impaired"
    | "adhd"
    | "dyslexia"
    | "autism"
    | "cognitive"
    | "motor"
    | "other";

export const DISABILITY_LABELS: Record<DisabilityType, string> = {
    blind: "Blind",
    low_vision: "Low Vision",
    deaf: "Deaf",
    hard_of_hearing: "Hard of Hearing",
    mute: "Mute",
    speech_impaired: "Speech Impaired",
    adhd: "ADHD",
    dyslexia: "Dyslexia",
    autism: "Autism",
    cognitive: "Cognitive",
    motor: "Motor / Physical",
    other: "Other",
};

export const FRIENDLY_CHIP_LABELS: Record<DisabilityType, string> = {
    blind: "Screen Reader User",
    low_vision: "Large Text",
    deaf: "Captions Needed",
    hard_of_hearing: "Captions Needed",
    mute: "Text-Based Communication",
    speech_impaired: "Text-Based Communication",
    adhd: "Extended Time",
    dyslexia: "Dyslexia Support",
    autism: "Simplified UI",
    cognitive: "Simplified Content",
    motor: "Keyboard Navigation",
    other: "Accessibility Support",
};

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    disabilities: DisabilityType[];
    program?: string;
    year?: number;
    division?: string;
    instituteId?: string;
    status: "active" | "inactive";
    profileCompleted: boolean;
    preferences: {
        fontSize: number;
        ttsSpeed: number;
        extendedTimeMultiplier: number;
        contrastMode: boolean;
        screenReader?: string;
        brailleDisplay?: string;
        voiceEnabled?: boolean;
    };
}
