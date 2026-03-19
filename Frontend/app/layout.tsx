import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VOID.SYS — Mangesh Phadte | AI/ML Engineer",
  description:
    "Immersive portfolio of Mangesh Phadte — AI/ML Engineer building production LLM systems, knowledge graphs, and autonomous data pipelines from Goa, India.",
  keywords: [
    "AI Engineer",
    "ML Engineer",
    "LLM",
    "Portfolio",
    "Mangesh Phadte",
    "Three.js",
    "Deep Learning",
  ],
  authors: [{ name: "Mangesh Phadte" }],
  openGraph: {
    title: "VOID.SYS — Mangesh Phadte",
    description: "AI/ML Engineer · Goa, India",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://voidsys.dev",
    siteName: "VOID.SYS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body>
        {/* Aurora Background Layer */}
        <div className="aurora-container" aria-hidden="true">
          <div className="aurora-orb aurora-orb-1" />
          <div className="aurora-orb aurora-orb-2" />
          <div className="aurora-orb aurora-orb-3" />
        </div>

        {/* Noise Texture Overlay */}
        <div className="noise-overlay" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Main Content */}
        <main style={{ position: "relative", zIndex: 2 }}>{children}</main>
      </body>
    </html>
  );
}
