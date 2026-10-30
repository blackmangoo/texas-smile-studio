import { z } from "zod";

export const SERVICE_IDS = [
  "implants",
  "aligners",
  "cosmetic-veneers",
  "gentle-root-canal",
  "optical-whitening",
  "pediatric-family",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export const TIME_SLOTS = [
  "08:30 AM — Morning Sanctuary",
  "10:30 AM — Mid-Morning Suite",
  "01:30 PM — Early Afternoon",
  "03:30 PM — Late Afternoon",
  "05:00 PM — Executive Evening",
] as const;

/**
 * HIPAA-Safe Appointment Request Contract.
 * Collects scheduling preferences & contact coordinates only — never clinical history or SSN.
 */
export const BookingRequestSchema = z.object({
  serviceId: z.enum(SERVICE_IDS, {
    errorMap: () => ({ message: "Please select a treatment or visit focus." }),
  }),
  patientType: z.enum(["new-patient", "returning-patient", "pediatric-visit"]),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please pick a valid preferred date (YYYY-MM-DD)."),
  preferredSlot: z.enum(TIME_SLOTS, {
    errorMap: () => ({ message: "Please select a preferred studio time window." }),
  }),
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address for your confirmation."),
  phone: z
    .string()
    .trim()
    .regex(
      /^[+()\-\s0-9]{10,20}$/,
      "Please enter a valid 10-digit US phone number."
    ),
  comfortPreference: z
    .enum([
      "standard-calm",
      "noise-canceling-headphones",
      "extra-time-explanation",
      "sedation-consultation",
    ])
    .default("standard-calm"),
  insuranceType: z
    .enum(["ppo-insurance", "membership-plan", "self-pay-financing"])
    .default("ppo-insurance"),
  // Anti-spam honeypot: must remain empty
  websiteUrlHoneypot: z.string().max(0, "Bot submission rejected.").optional().default(""),
});

export type BookingRequestInput = z.infer<typeof BookingRequestSchema>;

export interface BookingConfirmation {
  ok: true;
  referenceCode: string;
  createdAt: string;
  deliveryMode: "supabase+resend" | "supabase" | "resend" | "local-ledger";
  summary: {
    fullName: string;
    serviceId: ServiceId;
    preferredDate: string;
    preferredSlot: string;
    comfortPreference: string;
  };
}
