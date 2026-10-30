"use client";

import React, { useState, useEffect } from "react";
import { DENTAL_SERVICES } from "@/data/clinicData";
import {
  BookingRequestSchema,
  TIME_SLOTS,
  type ServiceId,
  type BookingConfirmation,
} from "@/lib/bookingSchema";
import { ServiceIcon, ArrowUpRightIcon } from "@/components/icons/DentalIcons";
import { smoothScrollTo } from "@/lib/scrollBus";

interface BookingAndFooterSectionProps {
  selectedService: ServiceId;
  onChangeService: (serviceId: ServiceId) => void;
}

function getDefaultTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

export function BookingAndFooterSection({
  selectedService,
  onChangeService,
}: BookingAndFooterSectionProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [patientType, setPatientType] = useState<
    "new-patient" | "returning-patient" | "pediatric-visit"
  >("new-patient");
  const [preferredDate, setPreferredDate] = useState<string>("2026-11-04");
  const [preferredSlot, setPreferredSlot] = useState<(typeof TIME_SLOTS)[number]>(
    TIME_SLOTS[1]
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comfortPreference, setComfortPreference] = useState<
    | "standard-calm"
    | "noise-canceling-headphones"
    | "extra-time-explanation"
    | "sedation-consultation"
  >("standard-calm");
  const [insuranceType, setInsuranceType] = useState<
    "ppo-insurance" | "membership-plan" | "self-pay-financing"
  >("ppo-insurance");
  const [websiteUrlHoneypot, setWebsiteUrlHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null
  );

  useEffect(() => {
    setPreferredDate(getDefaultTomorrowIso());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = {
      serviceId: selectedService,
      patientType,
      preferredDate,
      preferredSlot,
      fullName,
      email,
      phone,
      comfortPreference,
      insuranceType,
      websiteUrlHoneypot,
    };

    const parsed = BookingRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setErrorMessage(firstIssue?.message ?? "Please verify your booking details.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(
          data.error ?? "Could not complete booking request. Please call (214) 555-0192."
        );
      } else {
        setConfirmation(data as BookingConfirmation);
      }
    } catch {
      setErrorMessage(
        "Network connection interrupted. Please try again or call (214) 555-0192."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Golden-Hour Booking Section */}
      <section
        id="booking"
        aria-labelledby="booking-heading"
        className="py-24 sm:py-32 text-[#13232C]"
        style={{
          background:
            "linear-gradient(165deg, #F7E4D8 0%, #F6F3EE 52%, #DCEFEC 100%)",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Studio Sanctuary Promise & Location Info */}
            <div className="lg:col-span-5">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-3">
                Reserve Your Suite · Uptown Dallas
              </span>
              <h2
                id="booking-heading"
                className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#13232C] leading-[1.08]"
              >
                Your visit,
                <br />
                <span className="text-[#0F5F6E]">unhurried.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#4B5D66]">
                Select your treatment focus, preferred Dallas studio window, and
                comfort preferences. For your privacy (HIPAA), this scheduler
                collects contact and timing details only — never medical history.
              </p>

              {/* Studio Coordinates Card */}
              <div className="mt-8 rounded-[24px] border border-[#E6E0D6] bg-[#FFFDFA] p-6 sm:p-7 shadow-[0_24px_50px_-35px_rgba(15,95,110,0.2)] space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#8A6631]">
                    Dallas Flagship Studio
                  </div>
                  <div className="mt-1 font-serif text-xl text-[#13232C]">
                    3811 Turtle Creek Blvd, Suite 400
                  </div>
                  <div className="text-sm text-[#4B5D66]">
                    Dallas, TX 75219 · Complimentary Ground-Level Valet
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E6E0D6] text-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#4B5D66]">
                      Studio Hours
                    </div>
                    <div className="mt-1 font-medium text-[#13232C]">
                      Mon–Thu: 8:00 AM – 5:30 PM
                    </div>
                    <div className="text-[#4B5D66]">Fri: 8:00 AM – 2:00 PM</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#4B5D66]">
                      Direct Concierge
                    </div>
                    <a
                      href="tel:+12145550192"
                      className="mt-1 block font-semibold text-[#0F5F6E] hover:underline"
                    >
                      (214) 555-0192
                    </a>
                    <div className="text-[#4B5D66]">Same-day emergency slots</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3-Step Booking Card */}
            <div className="lg:col-span-7">
              <div className="rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-6 sm:p-10 shadow-[0_30px_60px_-30px_rgba(15,95,110,0.25)]">
                {confirmation ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="py-6 text-center sm:text-left"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEFEC] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F5F6E]">
                      <span>Suite Request Confirmed</span>
                      <span>· Ref #{confirmation.referenceCode}</span>
                    </div>
                    <h3 className="mt-4 font-serif text-3xl text-[#13232C]">
                      Thank you, {confirmation.summary.fullName}.
                    </h3>
                    <p className="mt-2 text-base text-[#4B5D66]">
                      Our Uptown Dallas concierge has reserved your provisional
                      suite window and will reach out shortly to finalize your
                      benefit breakdown.
                    </p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-[#F6F3EE] p-5 text-left text-sm border border-[#E6E0D6]">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#8A6631] font-semibold">
                          Requested Focus
                        </span>
                        <div className="mt-0.5 font-semibold text-[#13232C] capitalize">
                          {confirmation.summary.serviceId.replace(/-/g, " ")}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#8A6631] font-semibold">
                          Preferred Window
                        </span>
                        <div className="mt-0.5 font-semibold text-[#13232C]">
                          {confirmation.summary.preferredDate} ·{" "}
                          {confirmation.summary.preferredSlot}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#8A6631] font-semibold">
                          Comfort Protocol
                        </span>
                        <div className="mt-0.5 font-medium text-[#13232C] capitalize">
                          {confirmation.summary.comfortPreference.replace(/-/g, " ")}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#8A6631] font-semibold">
                          Confirmation Code
                        </span>
                        <div className="mt-0.5 font-mono font-semibold text-[#0F5F6E]">
                          {confirmation.referenceCode}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setConfirmation(null);
                        setStep(1);
                      }}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-[#13232C]/25 px-6 text-xs font-semibold uppercase tracking-wider text-[#13232C] hover:bg-[#F6F3EE] cursor-pointer"
                    >
                      Schedule Another Family Member
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Step Indicator + Champagne Progress Line */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[#4B5D66] mb-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className={`cursor-pointer ${
                            step >= 1 ? "text-[#0F5F6E]" : ""
                          }`}
                        >
                          01. Treatment Focus
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className={`cursor-pointer ${
                            step >= 2 ? "text-[#0F5F6E]" : ""
                          }`}
                        >
                          02. Date & Suite Window
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className={`cursor-pointer ${
                            step === 3 ? "text-[#0F5F6E]" : ""
                          }`}
                        >
                          03. Your Details
                        </button>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F6F3EE]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%",
                            background:
                              "linear-gradient(90deg, #8A6631 0%, #C8A26B 50%, #0F5F6E 100%)",
                          }}
                        />
                      </div>
                    </div>

                    {/* STEP 1: Service & Patient Type */}
                    {step === 1 && (
                      <div>
                        <h3 className="font-serif text-2xl text-[#13232C] mb-4">
                          What brings you to Texas Smile Studio?
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {DENTAL_SERVICES.map((srv) => {
                            const active = selectedService === srv.id;
                            return (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() => onChangeService(srv.id)}
                                className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                                  active
                                    ? "border-[#0F5F6E] bg-[#DCEFEC]/45 shadow-sm"
                                    : "border-[#E6E0D6] bg-[#F6F3EE]/60 hover:bg-[#F6F3EE]"
                                }`}
                              >
                                <span
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                    active
                                      ? "bg-[#0F5F6E] text-[#FFFDFA]"
                                      : "bg-[#FFFDFA] text-[#0F5F6E]"
                                  }`}
                                >
                                  <ServiceIcon serviceId={srv.id} className="w-5 h-5" />
                                </span>
                                <div>
                                  <div className="font-serif text-base font-medium text-[#13232C]">
                                    {srv.title}
                                  </div>
                                  <div className="text-xs text-[#4B5D66] mt-0.5">
                                    {srv.duration}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-2">
                            Visit Type
                          </label>
                          <div className="grid grid-cols-3 gap-2.5">
                            {(
                              [
                                ["new-patient", "New Adult Patient"],
                                ["returning-patient", "Returning Patient"],
                                ["pediatric-visit", "Child / Family Visit"],
                              ] as const
                            ).map(([val, label]) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPatientType(val)}
                                className={`h-11 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                                  patientType === val
                                    ? "border-[#0F5F6E] bg-[#0F5F6E] text-[#FFFDFA]"
                                    : "border-[#E6E0D6] bg-[#F6F3EE] text-[#13232C]"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-7 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0F5F6E] px-7 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-[#0B3A45] cursor-pointer"
                          >
                            <span>Continue to Date & Time</span>
                            <ArrowUpRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Date & Time Window + Comfort Menu */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <h3 className="font-serif text-2xl text-[#13232C]">
                          Choose your preferred date & comfort suite
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="booking-date"
                              className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-2"
                            >
                              Preferred Date
                            </label>
                            <input
                              id="booking-date"
                              type="date"
                              value={preferredDate}
                              onChange={(e) => setPreferredDate(e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#E6E0D6] bg-[#F6F3EE] px-4 text-sm font-medium text-[#13232C]"
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="booking-comfort"
                              className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-2"
                            >
                              Complimentary Comfort Menu
                            </label>
                            <select
                              id="booking-comfort"
                              value={comfortPreference}
                              onChange={(e) =>
                                setComfortPreference(
                                  e.target.value as typeof comfortPreference
                                )
                              }
                              className="h-12 w-full rounded-xl border border-[#E6E0D6] bg-[#F6F3EE] px-4 text-sm font-medium text-[#13232C]"
                            >
                              <option value="standard-calm">
                                Standard Unhurried Suite
                              </option>
                              <option value="noise-canceling-headphones">
                                Bose Noise-Canceling Audio + Warm Blanket
                              </option>
                              <option value="extra-time-explanation">
                                High-Anxiety Protocol (Step-by-Step Pauses)
                              </option>
                              <option value="sedation-consultation">
                                Request Oral or IV Sedation Discussion
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <span className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-2">
                            Preferred Dallas Studio Time Window
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {TIME_SLOTS.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setPreferredSlot(slot)}
                                className={`h-11 rounded-xl border px-4 text-left text-xs font-semibold transition-colors cursor-pointer ${
                                  preferredSlot === slot
                                    ? "border-[#0F5F6E] bg-[#0F5F6E] text-[#FFFDFA]"
                                    : "border-[#E6E0D6] bg-[#F6F3EE] text-[#13232C] hover:bg-[#DCEFEC]/40"
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="h-11 rounded-full border border-[#13232C]/25 px-5 text-xs font-semibold uppercase tracking-wider text-[#13232C] cursor-pointer"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0F5F6E] px-7 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-[#0B3A45] cursor-pointer"
                          >
                            <span>Continue to Contact Details</span>
                            <ArrowUpRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Patient Coordinates & Submit */}
                    {step === 3 && (
                      <div className="space-y-5">
                        <h3 className="font-serif text-2xl text-[#13232C]">
                          Where should we send your confirmation?
                        </h3>

                        <div>
                          <label
                            htmlFor="booking-name"
                            className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-1.5"
                          >
                            Full Name
                          </label>
                          <input
                            id="booking-name"
                            type="text"
                            autoComplete="name"
                            placeholder="e.g. Jordan Mercer"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-12 w-full rounded-xl border border-[#E6E0D6] bg-[#F6F3EE] px-4 text-base text-[#13232C]"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="booking-email"
                              className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-1.5"
                            >
                              Email Address
                            </label>
                            <input
                              id="booking-email"
                              type="email"
                              autoComplete="email"
                              placeholder="jordan@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#E6E0D6] bg-[#F6F3EE] px-4 text-base text-[#13232C]"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="booking-phone"
                              className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-1.5"
                            >
                              Mobile Phone
                            </label>
                            <input
                              id="booking-phone"
                              type="tel"
                              autoComplete="tel"
                              placeholder="(214) 555-0199"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="h-12 w-full rounded-xl border border-[#E6E0D6] bg-[#F6F3EE] px-4 text-base text-[#13232C]"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <span className="block text-xs font-semibold uppercase tracking-wider text-[#4B5D66] mb-2">
                            Coverage Preference
                          </span>
                          <div className="grid grid-cols-3 gap-2.5">
                            {(
                              [
                                ["ppo-insurance", "PPO Insurance"],
                                ["membership-plan", "$39/mo Membership"],
                                ["self-pay-financing", "Self-Pay / 0% APR"],
                              ] as const
                            ).map(([val, label]) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setInsuranceType(val)}
                                className={`h-11 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                                  insuranceType === val
                                    ? "border-[#0F5F6E] bg-[#0F5F6E] text-[#FFFDFA]"
                                    : "border-[#E6E0D6] bg-[#F6F3EE] text-[#13232C]"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Hidden Honeypot Input */}
                        <div className="hidden" aria-hidden="true">
                          <label htmlFor="booking-website-hp">Website</label>
                          <input
                            id="booking-website-hp"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={websiteUrlHoneypot}
                            onChange={(e) => setWebsiteUrlHoneypot(e.target.value)}
                          />
                        </div>

                        {errorMessage && (
                          <div
                            role="alert"
                            className="rounded-xl border border-[#A84A33]/40 bg-[#F7E4D8] px-4 py-3 text-sm font-medium text-[#A84A33]"
                          >
                            {errorMessage}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="h-11 rounded-full border border-[#13232C]/25 px-5 text-xs font-semibold uppercase tracking-wider text-[#13232C] cursor-pointer"
                          >
                            ← Back
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0F5F6E] px-8 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-[#0B3A45] disabled:opacity-60 cursor-pointer"
                          >
                            <span>
                              {submitting
                                ? "Reserving Suite..."
                                : "Confirm Appointment Request"}
                            </span>
                            <ArrowUpRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Midnight Footer (#0A1C24) */}
      <footer
        aria-label="Site Footer"
        className="bg-[#0A1C24] text-[#EAF7FA] py-20 border-t border-white/10"
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4">
                <img
                  src="/brand/logo-crest.webp"
                  alt="Texas Smile Studio — Dallas Architectural Dentistry Crest"
                  width={72}
                  height={72}
                  loading="lazy"
                  className="h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 rounded-full object-cover shadow-lg"
                />
                <div>
                  <span className="block font-serif text-2xl text-[#FFFDFA]">
                    Texas Smile Studio
                  </span>
                  <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#C8A26B] mt-0.5">
                    Dallas Architectural Dentistry
                  </span>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#9FB7BE]">
                Calm, precise restorative, orthodontic, cosmetic, and family
                dentistry in the heart of Uptown Dallas. Engineered around
                patient comfort and long-term oral health.
              </p>
              <p className="mt-4 text-xs text-[#C8A26B]">
                3811 Turtle Creek Blvd, Suite 400 · Dallas, TX 75219
              </p>
            </div>

            <div className="lg:col-span-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A26B] mb-4">
                Specialties
              </div>
              <ul className="space-y-2.5 text-sm text-[#9FB7BE]">
                {DENTAL_SERVICES.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeService(s.id);
                        smoothScrollTo("#services");
                      }}
                      className="hover:text-[#EAF7FA] transition-colors cursor-pointer"
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A26B] mb-4">
                3D Interactive Chapters
              </div>
              <ul className="space-y-2.5 text-sm text-[#9FB7BE]">
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("#hero-stage")}
                    className="hover:text-[#63E6D9] transition-colors cursor-pointer"
                  >
                    01 · Full-Arch Restorative Articulation
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("#craftsmanship")}
                    className="hover:text-[#63E6D9] transition-colors cursor-pointer"
                  >
                    02 · Titanium Implant & 18k Gold Abutment
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("#technology")}
                    className="hover:text-[#63E6D9] transition-colors cursor-pointer"
                  >
                    03 · 60-Second Optical Scan & B1 Whitening
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("#transformations")}
                    className="hover:text-[#63E6D9] transition-colors cursor-pointer"
                  >
                    04 · Before / After Optical Comparator
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#9FB7BE]">
            <p>
              © {new Date().getFullYear()} Texas Smile Studio PLLC · Dallas,
              Texas. All rights reserved.
            </p>
            <p>
              HIPAA-Safe Online Scheduling · Accessibility WCAG 2.2 AA
              Compliant
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
