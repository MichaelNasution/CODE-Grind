"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type Project } from "@/lib/data";
import ProjectCard from "@/components/ProjectCard";
import Footer from "@/components/Footer";
import MorphingSVG from "@/components/MorphingSVG";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES: (Project["category"] | "All")[] = [
  "All",
  "WebGL",
  "Motion",
  "Systems",
  "Data",
  "Open Source",
];

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState<Project["category"] | "All">("All");
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  // Hero entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current?.querySelectorAll(".hero-item") ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.1,
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Re-animate grid on filter change
  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(".project-card") ?? [];
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.07,
        ease: "power3.out",
      }
    );
  }, [activeCategory]);

  return (
    <main style={{ paddingBottom: 0 }}>
      {/* ── Page Hero ── */}
      <div
        ref={heroRef}
        className="page-hero grid-bg"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Decorative morphing blob */}
        <MorphingSVG
          className=""
          color="var(--accent)"
          opacity={0.05}
          style={{
            position: "absolute",
            right: "8%",
            top: "10%",
            width: "320px",
            height: "320px",
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
            Selected Work
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
            Work &{" "}
            <em style={{ color: "var(--accent)" }}>Portfolio</em>
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
            {projects.length} projects across WebGL, motion design, interactive
            data visualization, and open source tooling.
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div
        style={{
          padding: "32px 60px",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            data-cursor="pointer"
            className={`tag-pill${activeCategory === cat ? " active" : ""}`}
            style={{
              background: "transparent",
              border: `0.5px solid ${
                activeCategory === cat
                  ? "var(--accent)"
                  : "var(--border)"
              }`,
              color:
                activeCategory === cat
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              cursor: "none",
              fontSize: "11px",
              letterSpacing: "0.08em",
              padding: "6px 16px",
              borderRadius: "100px",
              transition: "all 0.25s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {cat}
            {cat !== "All" && (
              <span
                style={{
                  marginLeft: "6px",
                  color: "var(--text-tertiary)",
                  fontSize: "10px",
                }}
              >
                {projects.filter((p) => p.category === cat).length}
              </span>
            )}
          </button>
        ))}

        <div style={{ marginLeft: "auto", flexShrink: 0 }}>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              letterSpacing: "0.06em",
            }}
          >
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Projects Grid ── */}
      <div
        ref={gridRef}
        style={{
          padding: "48px 60px 80px",
          maxWidth: "1300px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px",
        }}
      >
        {filtered.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "80px 0",
              color: "var(--text-tertiary)",
            }}
          >
            <p style={{ fontSize: "14px" }}>No projects in this category yet.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
