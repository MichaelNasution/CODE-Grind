"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export default function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef<string>(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // On first load: just do a quick fade-in reveal
      gsap.fromTo(
        overlay,
        { scaleY: 1, transformOrigin: "top" },
        {
          scaleY: 0,
          duration: 0.7,
          ease: "power4.inOut",
          delay: 0.05,
        }
      );
      return;
    }

    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;

      // Sweep in from bottom, then sweep out from top
      const tl = gsap.timeline();
      tl.fromTo(
        overlay,
        { scaleY: 0, transformOrigin: "bottom" },
        { scaleY: 1, duration: 0.45, ease: "power4.inOut" }
      ).fromTo(
        overlay,
        { scaleY: 1, transformOrigin: "top" },
        { scaleY: 0, duration: 0.45, ease: "power4.inOut", delay: 0.05 }
      );

      // Scroll to top immediately on route change
      const lenis = (window as Window & { lenis?: { scrollTo: (pos: number, opts: object) => void } }).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  return (
    <div
      id="page-transition"
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        pointerEvents: "none",
        background: "var(--accent)",
        transformOrigin: "bottom",
        transform: "scaleY(0)",
      }}
    />
  );
}
