"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  {
    num: "01",
    title: "Discover",
    desc:
      "Deep-dive research into your users, competitors, and brand positioning to surface hidden opportunities.",
  },
  {
    num: "02",
    title: "Architect",
    desc:
      "Information architecture and interaction design — mapping out the full user journey before writing a single line of code.",
  },
  {
    num: "03",
    title: "Craft",
    desc:
      "Pixel-perfect implementation using performance-first techniques. Every frame, every transition deliberate.",
  },
  {
    num: "04",
    title: "Iterate",
    desc:
      "Rapid prototyping cycles with real user feedback, refining until the experience feels inevitable.",
  },
];

const techStack = [
  "Next.js", "TypeScript", "GSAP", "Three.js", "Framer Motion",
  "Lenis", "Figma", "WebGL", "D3.js", "Storybook",
  "Vercel", "Prisma", "Supabase", "Tailwind",
];

export default function ScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const labRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();

      // Process steps stagger
      const steps = processRef.current?.querySelectorAll(".process-step");
      if (steps && steps.length > 0) {
        gsap.fromTo(
          steps,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.14,
            ease: "power3.out",
            scrollTrigger: {
              trigger: processRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Lab section elements
      const labItems = labRef.current?.querySelectorAll(".lab-item");
      if (labItems && labItems.length > 0) {
        gsap.fromTo(
          labItems,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: labRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Marquee infinite scroll
      if (marqueeRef.current) {
        const totalWidth = marqueeRef.current.scrollWidth / 2;
        gsap.to(marqueeRef.current, {
          x: `-${totalWidth}px`,
          duration: 22,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x: number) => parseFloat(String(x)) % totalWidth),
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef as React.RefObject<HTMLDivElement>}>
      {/* ── Process Section ── */}
      <section
        id="process"
        style={{
          padding: "120px 60px",
          maxWidth: "1200px",
          margin: "0 auto",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "start",
          }}
        >
          {/* Left: heading */}
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "16px",
              }}
            >
              How We Work
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(34px, 4vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.1,
                color: "var(--text-primary)",
              }}
            >
              A Precision
              <br />
              <em style={{ color: "var(--accent)" }}>Process</em>
            </h2>
            <p
              style={{
                marginTop: "24px",
                fontSize: "14px",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
                maxWidth: "380px",
              }}
            >
              Every project follows a refined methodology built from years of
              shipping award-winning digital products.
            </p>
          </div>

          {/* Right: Steps */}
          <div ref={processRef} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {processSteps.map((step) => (
              <div
                key={step.num}
                className="process-step"
                style={{
                  padding: "28px 0",
                  borderBottom: "0.5px solid var(--border)",
                  display: "grid",
                  gridTemplateColumns: "48px 1fr",
                  gap: "20px",
                  alignItems: "start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "13px",
                    color: "var(--text-tertiary)",
                    fontStyle: "italic",
                    paddingTop: "2px",
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Marquee ── */}
      <div
        style={{
          overflow: "hidden",
          borderTop: "0.5px solid var(--border)",
          borderBottom: "0.5px solid var(--border)",
          padding: "20px 0",
          position: "relative",
        }}
      >
        {/* Fade edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, var(--bg) 0%, transparent 10%, transparent 90%, var(--bg) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <div
          ref={marqueeRef}
          style={{
            display: "flex",
            gap: "0",
            whiteSpace: "nowrap",
          }}
        >
          {/* Doubled for seamless loop */}
          {[...techStack, ...techStack].map((tech, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0 30px",
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              {tech}
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginLeft: "30px",
                  opacity: 0.5,
                  flexShrink: 0,
                }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* ── Lab Section ── */}
      <section
        ref={labRef}
        id="lab"
        style={{
          padding: "120px 60px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <p
          className="lab-item"
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "16px",
          }}
        >
          Experiments
        </p>
        <h2
          className="lab-item"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(34px, 4vw, 52px)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: "60px",
          }}
        >
          The <em>Lab</em>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {[
            { title: "Fluid Cursor", tag: "Canvas + WebGL", year: "2025" },
            { title: "Morphing SVG Paths", tag: "GSAP MorphSVG", year: "2025" },
            { title: "Scroll Velocity Text", tag: "Lenis + GSAP", year: "2024" },
          ].map((exp) => (
            <div
              key={exp.title}
              className="bento-card lab-item"
              data-cursor="pointer"
              style={{ padding: "28px", minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {exp.tag}
                </span>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginTop: "12px",
                  }}
                >
                  {exp.title}
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  {exp.year}
                </span>
                <span style={{ fontSize: "18px", color: "var(--accent)" }}>↗</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
