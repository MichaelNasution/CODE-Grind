"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows cursor exactly
      dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    };

    const lerpRing = () => {
      // Ring lags behind with lerp
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
      animId = requestAnimationFrame(lerpRing);
    };

    animId = requestAnimationFrame(lerpRing);

    const onMouseEnterHover = () => {
      dot.classList.add("hovered");
      ring.classList.add("hovered");
    };

    const onMouseLeaveHover = () => {
      dot.classList.remove("hovered");
      ring.classList.remove("hovered");
    };

    const attachHoverListeners = () => {
      const interactives = document.querySelectorAll<HTMLElement>(
        "a, button, [data-cursor='pointer'], .bento-card, input, textarea"
      );
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnterHover);
        el.addEventListener("mouseleave", onMouseLeaveHover);
      });
      return interactives;
    };

    // Attach immediately + re-attach after any DOM change (for dynamic content)
    let interactives = attachHoverListeners();

    const observer = new MutationObserver(() => {
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterHover);
        el.removeEventListener("mouseleave", onMouseLeaveHover);
      });
      interactives = attachHoverListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div id="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
