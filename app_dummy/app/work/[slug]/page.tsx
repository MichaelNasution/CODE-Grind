"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getProjectBySlug, getAdjacentProjects } from "@/lib/data";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) || "";
  const project = getProjectBySlug(slug);
  const { prev, next } = getAdjacentProjects(slug);

  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        heroRef.current?.querySelectorAll(".hero-item") ?? [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.1,
        }
      );

      // Parallax on thumb
      if (thumbRef.current) {
        gsap.to(thumbRef.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      // Content reveals
      gsap.fromTo(
        contentRef.current?.querySelectorAll(".reveal-block") ?? [],
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    return () => ctx.revert();
  }, [project]);

  if (!project) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Project not found.
        </p>
        <Link
          href="/work"
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          ← Back to Work
        </Link>
      </main>
    );
  }

  return (
    <main>
      {/* ── Hero ── */}
      <div
        ref={heroRef}
        style={{
          minHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "120px 60px 70px",
          position: "relative",
          overflow: "hidden",
          background: project.bgColor,
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        {/* Parallax background visual */}
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            inset: "-20%",
            zIndex: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.12,
          }}
        >
          <svg viewBox="0 0 800 450" style={{ width: "100%", height: "100%" }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 53}
                y1="0"
                x2={i * 53}
                y2="450"
                stroke={project.accentColor}
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 50}
                x2="800"
                y2={i * 50}
                stroke={project.accentColor}
                strokeWidth="0.5"
              />
            ))}
            <circle cx="400" cy="225" r="120" fill={project.accentColor} opacity="0.2" />
            <circle cx="400" cy="225" r="60" fill={project.accentColor} opacity="0.3" />
          </svg>
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "820px" }}>
          {/* Back + category */}
          <div
            className="hero-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            <Link
              href="/work"
              data-cursor="pointer"
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                letterSpacing: "0.06em",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 0.2s ease",
              }}
            >
              ← Work
            </Link>
            <span style={{ color: "var(--border)" }}>/</span>
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: project.accentColor,
              }}
            >
              {project.category}
            </span>
          </div>

          <h1
            className="hero-item"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(40px, 6vw, 76px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "var(--text-primary)",
              marginBottom: "16px",
            }}
          >
            {project.title}
          </h1>

          <p
            className="hero-item"
            style={{
              fontSize: "clamp(16px, 1.8vw, 20px)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "40px",
            }}
          >
            {project.subtitle}
          </p>

          {/* Meta row */}
          <div
            className="hero-item"
            style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}
          >
            {[
              { label: "Client", value: project.client },
              { label: "Year", value: project.year },
              { label: "Role", value: "Lead Developer" },
            ].map((m) => (
              <div key={m.label}>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                    marginBottom: "4px",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Metrics Bar ── */}
      <div
        style={{
          borderBottom: "0.5px solid var(--border)",
          display: "grid",
          gridTemplateColumns: `repeat(${project.metrics.length}, 1fr)`,
        }}
      >
        {project.metrics.map((m, i) => (
          <div
            key={i}
            style={{
              padding: "32px 40px",
              borderRight:
                i < project.metrics.length - 1
                  ? "0.5px solid var(--border)"
                  : "none",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(28px, 3vw, 40px)",
                fontWeight: 700,
                color: project.accentColor,
                lineHeight: 1,
                marginBottom: "6px",
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div
        ref={contentRef}
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 60px",
        }}
      >
        {/* Description */}
        <div
          className="reveal-block"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "60px",
            marginBottom: "80px",
            paddingBottom: "80px",
            borderBottom: "0.5px solid var(--border)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: project.accentColor,
                marginBottom: "16px",
              }}
            >
              Overview
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(26px, 3vw, 36px)",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "var(--text-primary)",
              }}
            >
              About this project
            </h2>
          </div>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.8,
              color: "var(--text-secondary)",
              paddingTop: "8px",
            }}
          >
            {project.description}
          </p>
        </div>

        {/* Challenge / Solution / Outcome */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "40px",
            marginBottom: "80px",
            paddingBottom: "80px",
            borderBottom: "0.5px solid var(--border)",
          }}
        >
          {[
            { label: "The Challenge", body: project.challenge },
            { label: "The Solution", body: project.solution },
            { label: "The Outcome", body: project.outcome },
          ].map((section) => (
            <div key={section.label} className="reveal-block">
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "14px",
                }}
              >
                {section.label}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.75,
                  color: "var(--text-secondary)",
                }}
              >
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="reveal-block" style={{ marginBottom: "80px" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: project.accentColor,
              marginBottom: "20px",
            }}
          >
            Tech Stack
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="tag-pill"
                style={{
                  border: `0.5px solid ${project.accentColor}55`,
                  color: project.accentColor,
                  padding: "6px 14px",
                  fontSize: "12px",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Next / Prev Navigation ── */}
      <div
        style={{
          borderTop: "0.5px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {prev ? (
          <Link
            href={`/work/${prev.slug}`}
            data-cursor="pointer"
            style={{
              padding: "40px 60px",
              borderRight: "0.5px solid var(--border)",
              textDecoration: "none",
              transition: "background 0.3s ease",
              display: "block",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "var(--card-bg)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "transparent")
            }
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: "10px",
              }}
            >
              ← Previous
            </p>
            <p style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: 600 }}>
              {prev.title}
            </p>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/work/${next.slug}`}
            data-cursor="pointer"
            style={{
              padding: "40px 60px",
              textDecoration: "none",
              textAlign: "right",
              transition: "background 0.3s ease",
              display: "block",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "var(--card-bg)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "transparent")
            }
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: "10px",
              }}
            >
              Next →
            </p>
            <p style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: 600 }}>
              {next.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <Footer />
    </main>
  );
}
