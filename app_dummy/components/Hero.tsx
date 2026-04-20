"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ParticleCanvas from "./ParticleCanvas";

const TITLE_LINE_1 = "Crafting Digital";
const TITLE_LINE_2 = "Experiences";
const SUBTITLE =
  "Senior Creative Technologist specializing in high-performance\ninteractive interfaces and award-winning web experiences.";

function splitToChars(text: string, className: string) {
  return text.split("").map((char, i) => (
    <span key={i} className="char-wrap">
      <span
        className={`char ${className}`}
        style={{ display: "inline-block" }}
        aria-hidden="true"
      >
        {char === " " ? "\u00A0" : char}
      </span>
    </span>
  ));
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // Overlay fade out
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
      });

      // Badge pop in
      tl.from(badgeRef.current, {
        opacity: 0,
        y: -16,
        duration: 0.6,
        ease: "back.out(2)",
      }, "-=0.2");

      // Title chars stagger — Line 1
      const chars1 = line1Ref.current?.querySelectorAll(".char") ?? [];
      tl.from(chars1, {
        y: "100%",
        opacity: 0,
        duration: 0.7,
        stagger: 0.025,
        ease: "power3.out",
      }, "-=0.3");

      // Title chars stagger — Line 2 (starts slightly after)
      const chars2 = line2Ref.current?.querySelectorAll(".char") ?? [];
      tl.from(chars2, {
        y: "100%",
        opacity: 0,
        duration: 0.7,
        stagger: 0.03,
        ease: "power3.out",
      }, "-=0.5");

      // Subtitle
      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power2.out",
      }, "-=0.3");

      // Meta row
      tl.from(metaRef.current?.children ?? [], {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      }, "-=0.4");

      // Scroll indicator
      tl.from(scrollIndicatorRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.2");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="grid-bg"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: "100px",
      }}
    >
      {/* Particle Canvas background */}
      <ParticleCanvas />

      {/* Initial overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Radial gradient centerpiece */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,255,65,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          maxWidth: "900px",
          padding: "0 40px",
          width: "100%",
        }}
      >
        {/* Badge */}
        <div
          ref={badgeRef}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "0.5px solid rgba(0,255,65,0.3)",
            borderRadius: "100px",
            padding: "6px 16px",
            marginBottom: "40px",
            background: "rgba(0,255,65,0.04)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent)",
              animation: "pulse-dot 2s ease infinite",
              display: "inline-block",
            }}
          />
          <style>{`
            @keyframes pulse-dot {
              0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--accent); }
              50% { opacity: 0.4; box-shadow: 0 0 2px var(--accent); }
            }
          `}</style>
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            Available for Projects 2025
          </span>
        </div>

        {/* Title Line 1 */}
        <div
          ref={line1Ref}
          aria-label={TITLE_LINE_1}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(52px, 8vw, 108px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            display: "block",
          }}
        >
          {splitToChars(TITLE_LINE_1, "line1-char")}
        </div>

        {/* Title Line 2 — italic + accent */}
        <div
          ref={line2Ref}
          aria-label={TITLE_LINE_2}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(52px, 8vw, 108px)",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--accent)",
            display: "block",
            marginBottom: "36px",
            textShadow: "0 0 60px rgba(0,255,65,0.25)",
          }}
        >
          {splitToChars(TITLE_LINE_2, "line2-char")}
        </div>

        {/* Divider */}
        <div
          style={{
            width: "40px",
            height: "0.5px",
            background: "var(--text-tertiary)",
            margin: "0 auto 28px",
          }}
        />

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            fontSize: "clamp(14px, 1.5vw, 17px)",
            lineHeight: 1.75,
            color: "var(--text-secondary)",
            maxWidth: "520px",
            margin: "0 auto 48px",
            whiteSpace: "pre-line",
          }}
        >
          {SUBTITLE}
        </p>

        {/* CTA Row */}
        <div
          ref={metaRef}
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="#bento"
            data-cursor="pointer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--accent)",
              color: "#050505",
              padding: "14px 30px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "box-shadow 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 30px rgba(0,255,65,0.45), 0 0 60px rgba(0,255,65,0.15)";
              (e.currentTarget as HTMLAnchorElement).style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              (e.currentTarget as HTMLAnchorElement).style.transform =
                "translateY(0)";
            }}
          >
            View Work
            <span style={{ fontSize: "16px" }}>↗</span>
          </a>

          <a
            href="#process"
            data-cursor="pointer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              border: "0.5px solid var(--border)",
              color: "var(--text-primary)",
              padding: "14px 30px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "border-color 0.3s ease, background 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(0,255,65,0.3)";
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(0,255,65,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "var(--border)";
              (e.currentTarget as HTMLAnchorElement).style.background =
                "transparent";
            }}
          >
            Our Process
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "60px",
          zIndex: 3,
        }}
      >
        {[
          { num: "140+", label: "Projects Shipped" },
          { num: "8yr", label: "Experience" },
          { num: "99%", label: "Client Satisfaction" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 700,
                fontFamily: "var(--font-serif)",
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}
            >
              {stat.num}
            </div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        style={{
          position: "absolute",
          bottom: "32px",
          right: "40px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, transparent, var(--text-tertiary))",
          }}
        />
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            writingMode: "vertical-rl",
          }}
        >
          Scroll to explore
        </span>
      </div>
    </section>
  );
}
