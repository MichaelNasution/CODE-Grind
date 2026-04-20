import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: {
    default: "dev w/ kaleh — Creative Developer Portfolio",
    template: "%s | dev w/ kaleh",
  },
  description:
    "Portfolio of kaleh — Senior Creative Technologist specializing in WebGL experiences, motion design systems, and award-winning interactive interfaces.",
  keywords: [
    "creative developer",
    "WebGL",
    "GSAP",
    "motion design",
    "interactive",
    "portfolio",
    "Next.js",
  ],
  authors: [{ name: "kaleh" }],
  creator: "kaleh",
  openGraph: {
    title: "dev w/ kaleh — Creative Developer Portfolio",
    description:
      "WebGL experiences, motion design systems, and award-winning interactive interfaces.",
    type: "website",
    siteName: "dev w/ kaleh",
  },
  twitter: {
    card: "summary_large_image",
    title: "dev w/ kaleh",
    description: "Creative Developer — WebGL · Motion · Systems",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CustomCursor />
        <PageTransition />
        <SmoothScroll>
          <Navbar />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
