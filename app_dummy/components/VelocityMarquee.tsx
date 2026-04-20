"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Lenis from "lenis";

interface VelocityMarqueeProps {
  items: string[];
  baseSpeed?: number; // px/sec at zero scroll velocity
  direction?: 1 | -1;
  separator?: string;
  style?: React.CSSProperties;
}

export default function VelocityMarquee({
  items,
  baseSpeed = 60,
  direction = -1,
  separator = "◈",
  style = {},
}: VelocityMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const velRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Build repeated item list (×4 for seamless looping)
  const repeated = [...items, ...items, ...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalW = track.scrollWidth / 4; // one set width
    let lastTs = 0;

    const lenis = (
      window as unknown as { lenis?: Lenis }
    ).lenis;

    const onScroll = ({ velocity }: { velocity: number }) => {
      velRef.current = velocity;
    };

    if (lenis) {
      lenis.on("scroll", onScroll);
    }

    const tick = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.05); // cap dt at 50ms
      lastTs = ts;

      // Speed = base + velocity contribution
      const scrollBoost = velRef.current * 8;
      const speed = baseSpeed + Math.abs(scrollBoost);
      const sign = direction * (velRef.current < 0 ? -1 : 1);
      // Always use `direction` sign when velocity near zero
      const effectiveDir = Math.abs(velRef.current) < 0.05 ? direction : sign;

      xRef.current += effectiveDir * speed * dt;

      // Wrap: when moved one full set width, reset
      if (xRef.current <= -totalW) xRef.current += totalW;
      if (xRef.current >= 0) xRef.current -= totalW;

      // Apply skewX based on velocity for rubber-band feel
      const skew = gsap.utils.clamp(-8, 8, velRef.current * 1.5);

      gsap.set(track, {
        x: xRef.current,
        skewX: skew,
      });

      // Dampen velocity toward zero
      velRef.current *= 0.92;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (lenis) lenis.off("scroll", onScroll);
    };
  }, [baseSpeed, direction]);

  return (
    <div
      className="velocity-marquee"
      style={{ overflow: "hidden", ...style }}
    >
      <div ref={trackRef} className="velocity-marquee-track">
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0 24px",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              flexShrink: 0,
            }}
          >
            {item}
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "var(--accent)",
                marginLeft: "24px",
                opacity: 0.5,
                flexShrink: 0,
                display: "inline-block",
              }}
            >
              {/* separator dot or custom */}
              {separator === "◈" ? null : separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
