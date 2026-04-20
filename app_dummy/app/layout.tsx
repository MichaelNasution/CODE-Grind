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
      <body>
        <CustomCursor />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
