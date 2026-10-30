import React from "react";
import type { ServiceId } from "@/lib/bookingSchema";

interface IconProps {
  className?: string;
}

/**
 * Custom-authored 1.5px architectural line icons for Texas Smile Studio's 6 services.
 * Replaces generic stock/AI icons (no shields, sparkles, or neon ticks).
 */
export function ServiceIcon({
  serviceId,
  className = "w-7 h-7",
}: {
  serviceId: ServiceId;
  className?: string;
}) {
  switch (serviceId) {
    case "implants":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Porcelain Crown */}
          <path d="M9.5 11.5C9.5 7.8 11.8 5.5 14.3 6.2L16 6.8L17.7 6.2C20.2 5.5 22.5 7.8 22.5 11.5C22.5 13.7 21.1 15 19.2 15H12.8C10.9 15 9.5 13.7 9.5 11.5Z" />
          {/* 18k Gold Abutment Collar */}
          <path d="M13 15V17.8H19V15" />
          {/* Helical Titanium Fixture */}
          <path d="M13.5 17.8L14.2 26.5H17.8L18.5 17.8" />
          <path d="M12.8 20.2H19.2" />
          <path d="M13.1 22.8H18.9" />
          <path d="M13.6 25.2H18.4" />
        </svg>
      );
    case "aligners":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Dental Arch Curve */}
          <path d="M5.5 19.5C6.8 12.2 10.8 8.5 16 8.5C21.2 8.5 25.2 12.2 26.5 19.5" />
          {/* Outer Aligner Shell Offset */}
          <path
            d="M3.8 18.2C5.4 9.8 10.1 5.5 16 5.5C21.9 5.5 26.6 9.8 28.2 18.2"
            strokeDasharray="2.5 2.5"
          />
          {/* Individual Tooth Scallops */}
          <path d="M12.5 9V17.5" />
          <path d="M16 8.5V17" />
          <path d="M19.5 9V17.5" />
          <path d="M8.5 18.5C11 16.8 21 16.8 23.5 18.5" />
        </svg>
      );
    case "cosmetic-veneers":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Underlying Incisor */}
          <path d="M10.5 8.5C10.5 6.8 12.2 5.5 14.5 5.5H17.5C19.8 5.5 21.5 6.8 21.5 8.5L20.3 21.5C20.1 23.6 18.3 25 16 25C13.7 25 11.9 23.6 11.7 21.5L10.5 8.5Z" />
          {/* Floating 0.3mm Porcelain Veil Offset */}
          <path d="M13.5 8.5H20.5C22.4 8.5 23.8 9.8 23.6 11.5L22.5 22.8C22.3 24.8 20.6 26.2 18.5 26.2" />
          {/* Precision Bonding Axis */}
          <path d="M6.5 15.5H10" />
          <path d="M8.5 13.5L10.5 15.5L8.5 17.5" />
        </svg>
      );
    case "gentle-root-canal":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Outer Molar Silhouette */}
          <path d="M8.5 11C8.5 7.5 11.2 5.5 14 6.4L16 7.2L18 6.4C20.8 5.5 23.5 7.5 23.5 11C23.5 14 22 16.2 21.2 19.5L19.8 25.5C19.4 26.8 18 26.8 17.5 25.2L16 20.5L14.5 25.2C14 26.8 12.6 26.8 12.2 25.5L10.8 19.5C10 16.2 8.5 14 8.5 11Z" />
          {/* Calm Inner Light Pathway */}
          <path d="M13.5 12.5C14.2 14.5 14.2 18 13.4 22.5" />
          <path d="M18.5 12.5C17.8 14.5 17.8 18 18.6 22.5" />
          <circle cx="16" cy="12" r="1.6" />
        </svg>
      );
    case "optical-whitening":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Sculptural Crown */}
          <path d="M9.5 12C9.5 8.2 12 6 14.5 6.8L16 7.5L17.5 6.8C20 6 22.5 8.2 22.5 12C22.5 16.5 19.8 24.5 17.8 24.5C16.8 24.5 16.4 21.5 16 21.5C15.6 21.5 15.2 24.5 14.2 24.5C12.2 24.5 9.5 16.5 9.5 12Z" />
          {/* Diagonal Optical Sweep Wave */}
          <path d="M5.5 21.5C11.5 18.5 19.5 12.5 26.5 7.5" />
          <path d="M22.5 6.5H26.5V10.5" />
        </svg>
      );
    case "pediatric-family":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Rounded Little Primary Tooth */}
          <path d="M11 13.5C11 10.5 13 8.8 14.8 9.4L16 9.9L17.2 9.4C19 8.8 21 10.5 21 13.5C21 16.8 19.2 22.5 17.6 22.5C16.7 22.5 16.3 20.5 16 20.5C15.7 20.5 15.3 22.5 14.4 22.5C12.8 22.5 11 16.8 11 13.5Z" />
          {/* Protective Orbital Ring */}
          <ellipse cx="16" cy="16" rx="11.5" ry="5.2" transform="rotate(-18 16 16)" />
          <circle cx="25.5" cy="11.5" r="1.5" fill="currentColor" />
        </svg>
      );
  }
}

export function ArrowUpRightIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.5 11.5L11.5 4.5" />
      <path d="M5.5 4.5H11.5V10.5" />
    </svg>
  );
}
