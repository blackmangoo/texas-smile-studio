import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { FAQ_ITEMS } from "@/data/clinicData";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#135865",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://texassmilestudio.com"
  ),
  title: {
    default: "Texas Smile Studio | Calm, Precise Dentistry in Uptown Dallas",
    template: "%s | Texas Smile Studio Dallas",
  },
  description:
    "Architectural restorative, cosmetic, orthodontic, and family dentistry in Uptown Dallas. 60-second 3D optical scans, 3D-guided dental implants, clear aligners, 0.3mm porcelain veneers, and unhurried comfort.",
  keywords: [
    "Dallas dentist",
    "Uptown Dallas dental studio",
    "dental implants Dallas",
    "clear aligners Dallas",
    "porcelain veneers Dallas",
    "gentle root canal Dallas",
    "pediatric family dentist Dallas",
    "Texas Smile Studio",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://texassmilestudio.com",
    siteName: "Texas Smile Studio",
    title: "Texas Smile Studio | Calm, Precise Dentistry in Dallas",
    description:
      "Discover 60-second 3D optical scans, guided titanium implants, clear aligners, 0.3mm porcelain veneers, and fear-free family dentistry in Uptown Dallas.",
    images: [
      {
        url: "/frames/scene-01-hero/poster-desktop.webp",
        width: 1920,
        height: 1080,
        alt: "Texas Smile Studio — Architectural Dental Care in Dallas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Texas Smile Studio | Calm, Precise Dentistry in Dallas",
    description:
      "60-second 3D optical scans, guided implants, clear aligners, and 0.3mm veneers in Uptown Dallas.",
    images: ["/frames/scene-01-hero/poster-desktop.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dentistJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: "Texas Smile Studio",
    description:
      "Calm, precise restorative, cosmetic, orthodontic, and pediatric dental studio in Uptown Dallas, Texas.",
    url: "https://texassmilestudio.com",
    telephone: "+1-214-555-0192",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "3811 Turtle Creek Blvd, Suite 400",
      addressLocality: "Dallas",
      addressRegion: "TX",
      postalCode: "75219",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.8099,
      longitude: -96.8038,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "08:00",
        closes: "17:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "08:00",
        closes: "14:00",
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/frames/scene-01-hero/poster-desktop.webp"
          type="image/webp"
          media="(min-width: 768px)"
        />
        <link
          rel="preload"
          as="image"
          href="/frames/scene-01-hero/poster-mobile-v3.webp"
          type="image/webp"
          media="(max-width: 767px)"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
