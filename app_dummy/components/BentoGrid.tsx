"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const bentoItems = [
  {
    id: "b1",
    span: "col-span-2 row-span-2",
    colSpan: 2,
    rowSpan: 2,
    tag: "01 — Featured",
    title: "Motion Design Systems",
    desc:
      "Building cohesive animation languages that unify product experiences across every touchpoint.",
    accentLine: true,
    large: true,
  },
  {
    id: "b2",
    span: "col-span-1 row-span-1",
    colSpan: 1,
    rowSpan: 1,
    tag: "02 — Interface",
    title: "WebGL Experiences",
    desc: "Immersive 3D scenes driven by real-time shader programming.",
    accentLine: false,
    large: false,
  },
  {
    id: "b3",
    span: "col-span-1 row-span-1",
    colSpan: 1,
    rowSpan: 1,
    tag: "03 — Performance",
    title: "60fps Animation",
    desc: "GSAP + CSS GPU acceleration for buttery smooth motion.",
    accentLine: false,
    large: false,
  },
  {
    id: "b4",
    span: "col-span-1 row-span-2",
    colSpan: 1,
    rowSpan: 2,
    tag: "04 — Data",
    title: "Interactive Data Viz",
    desc:
      "Complex datasets transformed into beautiful, navigable visual stories using D3 and Canvas.",
    accentLine: false,
    large: false,
  },
  {
    id: "b5",
    span: "col-span-1 row-span-1",
    colSpan: 1,
    rowSpan: 1,
    tag: "05 — System",
    title: "Design Systems",
    desc: "Scalable component architectures built to last.",
    accentLine: false,
    large: false,
  },
  {
    id: "b6",
    span: "col-span-1 row-span-1",
    colSpan: 1,
    rowSpan: 1,
    tag: "06 — Code",
    title: "Open Source",
    desc: "Contributing back to the ecosystem that powers us all.",
    accentLine: false,
    large: false,
  },
];

function BentoCard({
  item,
}: {
  item: (typeof bentoItems)[number];
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className="bento-card"
      data-cursor="pointer"
      onMouseMove={handleMouseMove}
      style={{
        gridColumn: `span ${item.colSpan}`,
        gridRow: `span ${item.rowSpan}`,
        padding: item.large ? "40px" : "28px",
        minHeight: item.large ? "300px" : "160px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontWeight: 500,
            display: "block",
            marginBottom: "16px",
          }}
        >
          {item.tag}
        </span>

        <h3
          style={{
            fontFamily: item.large ? "var(--font-serif)" : "var(--font-sans)",
            fontSize: item.large ? "clamp(26px, 3vw, 36px)" : "18px",
            fontWeight: item.large ? 700 : 600,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: "14px",
          }}
        >
          {item.title}
        </h3>

        {item.accentLine && (
          <div
            style={{
              width: "30px",
              height: "1px",
              background: "var(--accent)",
              marginBottom: "16px",
              boxShadow: "0 0 8px var(--accent)",
            }}
          />
        )}

        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.7,
            color: "var(--text-secondary)",
          }}
        >
          {item.desc}
        </p>
      </div>

      {/* Arrow indicator */}
      <div
        style={{
          alignSelf: "flex-end",
          width: "32px",
          height: "32px",
          border: "0.5px solid var(--border)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          color: "var(--text-secondary)",
          transition: "border-color 0.3s ease, color 0.3s ease, transform 0.3s ease",
        }}
        className="card-arrow"
      >
        ↗
      </div>

      <style>{`
        .bento-card:hover .card-arrow {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          transform: rotate(45deg) !important;
        }
      `}</style>
    </div>
  );
}

export default function BentoGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ensure ScrollTrigger is aware of current scroll position
      ScrollTrigger.refresh();

      // Title reveal
      gsap.fromTo(
        titleRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // Cards stagger — use direct DOM query on sectionRef
      const cards = sectionRef.current?.querySelectorAll(".bento-card") ?? [];
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="bento"
      style={{
        padding: "120px 60px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Section header */}
      <div ref={titleRef} style={{ marginBottom: "64px" }}>
        <p
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
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            maxWidth: "500px",
          }}
        >
          Capabilities &amp; <em>Craft</em>
        </h2>
      </div>

      {/* Bento Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          gridAutoRows: "minmax(160px, auto)",
        }}
      >
        {bentoItems.map((item) => (
          <BentoCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
