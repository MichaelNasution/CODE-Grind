import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "CodeGrind — Award-Winning Developer Experience",
  description:
    "A high-end interactive landing page built with Next.js 14, GSAP, and Lenis. Featuring smooth scrolling, particle interactions, and precision animations.",
  keywords: ["Next.js", "GSAP", "animation", "portfolio", "developer"],
  openGraph: {
    title: "CodeGrind — Award-Winning Developer Experience",
    description: "High-end interactive landing page with GSAP animations and Lenis smooth scroll.",
    type: "website",
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
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
