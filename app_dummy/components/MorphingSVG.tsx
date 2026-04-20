"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Three organic blob paths to morph between
const PATHS = [
  "M60,10 C80,10 95,25 95,45 C95,65 85,78 65,82 C45,86 15,80 8,60 C1,40 10,15 30,10 C40,7 50,10 60,10 Z",
  "M55,5 C78,5 98,22 98,48 C98,72 80,90 55,92 C30,94 5,75 5,50 C5,25 28,5 55,5 Z",
  "M50,8 C70,4 92,18 96,42 C100,66 88,88 62,93 C36,98 8,82 5,56 C2,30 20,12 50,8 Z",
];

export default function MorphingSVG({
  className = "",
  color = "var(--accent)",
  opacity = 0.08,
  style: containerStyle = {},
}: {
  className?: string;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;

    let currentIndex = 0;
    let animating = false;

    const morphToNext = () => {
      if (animating) return;
      animating = true;
      currentIndex = (currentIndex + 1) % PATHS.length;

      gsap.to(path, {
        attr: { d: PATHS[currentIndex] },
        duration: 2.5,
        ease: "power2.inOut",
        onComplete: () => {
          animating = false;
        },
      });
    };

    // Scroll-triggered morphing
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: morphToNext,
      onLeaveBack: morphToNext,
    });

    // Also morph on interval for visual interest
    const interval = setInterval(morphToNext, 4000);

    return () => {
      st.kill();
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ lineHeight: 0, display: "inline-block", ...containerStyle }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <path
          ref={pathRef}
          d={PATHS[0]}
          fill={color}
          opacity={opacity}
          style={{ willChange: "d" }}
        />
      </svg>
    </div>
  );
}
