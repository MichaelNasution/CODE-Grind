"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { labExperiments } from "@/lib/data";
import Footer from "@/components/Footer";
import VelocityMarquee from "@/components/VelocityMarquee";
import MorphingSVG from "@/components/MorphingSVG";

gsap.registerPlugin(ScrollTrigger);

const TECH_TERMS = [
  "WebGL", "GLSL", "Canvas API", "GSAP", "Lenis",
  "Three.js", "MorphSVG", "Web Workers", "CSS Houdini", "Shader Programming",
];

export default function LabPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current?.querySelectorAll(".hero-item") ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.8, stagger: 0.12,
          ease: "power3.out", delay: 0.1,
        }
      );

      const cards = gridRef.current?.querySelectorAll(".lab-card") ?? [];
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.7, stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <main>
      {/* ── Hero ── */}
      <div
        ref={heroRef}
        className="page-hero grid-bg"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <MorphingSVG
          color="var(--accent)"
          opacity={0.04}
          style={{
            position: "absolute",
            left: "5%",
            bottom: "-10%",
            width: "400px",
            height: "400px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            className="hero-item"
            style={{
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "16px",
            }}
          >
            Interactive Experiments
          </p>
          <h1
            className="hero-item"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(42px, 6vw, 80px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "var(--text-primary)",
              marginBottom: "20px",
            }}
          >
            The{" "}
            <em style={{ color: "var(--accent)" }}>Lab</em>
          </h1>
          <p
            className="hero-item"
            style={{
              fontSize: "clamp(14px, 1.5vw, 17px)",
              color: "var(--text-secondary)",
              maxWidth: "480px",
              lineHeight: 1.7,
            }}
          >
            A playground for pushing the boundaries of what the browser can
            render. All experiments are production-quality explorations.
          </p>
        </div>
      </div>

      {/* ── Velocity Marquee ── */}
      <div
        style={{
          borderBottom: "0.5px solid var(--border)",
          borderTop: "0.5px solid var(--border)",
          padding: "16px 0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, var(--bg) 0%, transparent 8%, transparent 92%, var(--bg) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <VelocityMarquee items={TECH_TERMS} baseSpeed={55} direction={-1} />
      </div>

      {/* ── Experiments Grid ── */}
      <div
        ref={gridRef}
        style={{
          padding: "64px 60px 80px",
          maxWidth: "1300px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "16px",
        }}
      >
        {labExperiments.map((exp) => (
          <div
            key={exp.slug}
            className="lab-card"
            data-cursor="pointer"
          >
            {/* Preview gradient */}
            <div
              className="lab-card-preview"
              style={{
                background: `linear-gradient(135deg, ${exp.gradientFrom}22 0%, ${exp.gradientTo} 100%)`,
                position: "relative",
              }}
            >
              {/* Animated grid overlay */}
              <svg
                viewBox="0 0 360 202"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0.25,
                }}
              >
                {Array.from({ length: 7 }).map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * 60}
                    y1="0"
                    x2={i * 60}
                    y2="202"
                    stroke={exp.gradientFrom}
                    strokeWidth="0.5"
                  />
                ))}
                {Array.from({ length: 4 }).map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1="0"
                    y1={i * 67}
                    x2="360"
                    y2={i * 67}
                    stroke={exp.gradientFrom}
                    strokeWidth="0.5"
                  />
                ))}
                <circle
                  cx="180"
                  cy="101"
                  r="36"
                  fill="none"
                  stroke={exp.gradientFrom}
                  strokeWidth="0.6"
                />
                <circle cx="180" cy="101" r="12" fill={exp.gradientFrom} opacity="0.5" />
              </svg>

              {/* Status badge */}
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "rgba(5,5,5,0.7)",
                  border: "0.5px solid var(--border)",
                  borderRadius: "100px",
                  padding: "4px 10px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background:
                      exp.status === "Live"
                        ? exp.gradientFrom
                        : exp.status === "WIP"
                        ? "#f59e0b"
                        : "var(--text-tertiary)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    color: "var(--text-secondary)",
                  }}
                >
                  {exp.status}
                </span>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: "22px 24px 26px", background: "var(--card-bg)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: exp.gradientFrom,
                    fontWeight: 500,
                  }}
                >
                  {exp.tag}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  {exp.year}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                  lineHeight: 1.25,
                }}
              >
                {exp.title}
              </h3>

              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.65,
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                }}
              >
                {exp.description.slice(0, 120)}…
              </p>

              {/* Tech tags */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {exp.techStack.slice(0, 3).map((t) => (
                  <span key={t} className="tag-pill" style={{ fontSize: "10px" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </main>
  );
}
