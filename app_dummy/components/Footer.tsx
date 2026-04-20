"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current?.querySelectorAll(".footer-item") ?? [], {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      id="contact"
      style={{
        borderTop: "0.5px solid var(--border)",
        padding: "80px 60px 48px",
      }}
    >
      {/* CTA block */}
      <div
        className="footer-item"
        style={{
          textAlign: "center",
          marginBottom: "80px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "20px",
          }}
        >
          Start a Project
        </p>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 6vw, 80px)",
            fontWeight: 900,
            lineHeight: 1.05,
            color: "var(--text-primary)",
            marginBottom: "36px",
          }}
        >
          Let&apos;s Build
          <br />
          <em style={{ color: "var(--accent)" }}>Something</em>
          <br />
          Remarkable.
        </h2>

        <Link
          href="/contact"
          data-cursor="pointer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--accent)",
            color: "#050505",
            padding: "16px 38px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "box-shadow 0.3s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              "0 0 40px rgba(0,255,65,0.5), 0 0 80px rgba(0,255,65,0.2)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
          }}
        >
          Start the conversation
          <span style={{ fontSize: "18px" }}>→</span>
        </Link>
      </div>

      <div className="divider footer-item" />

      {/* Bottom bar */}
      <div
        className="footer-item"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "var(--text-primary)",
          }}
        >
          dev{" "}
          <span style={{ color: "var(--text-tertiary)", fontWeight: 300 }}>
            w/
          </span>{" "}
          <span style={{ color: "var(--accent)" }}>kaleh</span>
        </div>

        <div style={{ display: "flex", gap: "28px" }}>
          {["Twitter", "GitHub", "Dribbble", "LinkedIn"].map((link) => (
            <a
              key={link}
              href="#"
              className="link-underline"
              data-cursor="pointer"
              style={{
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                textDecoration: "none",
                transition: "color 0.25s ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--text-tertiary)")
              }
            >
              {link}
            </a>
          ))}
        </div>

        <span
          style={{
            fontSize: "11px",
            color: "var(--text-tertiary)",
            letterSpacing: "0.06em",
          }}
        >
          © 2026 kaleh. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
