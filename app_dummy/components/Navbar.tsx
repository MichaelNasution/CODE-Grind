"use client";

import { useEffect, useRef, useState } from "react";

const navLinks = [
  { label: "Work", href: "#bento" },
  { label: "Process", href: "#process" },
  { label: "Lab", href: "#lab" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.4s ease, border-color 0.4s ease, padding 0.4s ease",
        background: scrolled ? "rgba(5,5,5,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "0.5px solid #1f1f1f" : "0.5px solid transparent",
      }}
    >
      {/* Logo */}
      <a
        href="/"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "var(--text-primary)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        data-cursor="pointer"
      >
        <span style={{ color: "var(--accent)" }}>◈</span>
        <span>CODEGRIND</span>
      </a>

      {/* Nav Links */}
      <nav style={{ display: "flex", gap: "36px", alignItems: "center" }}>
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="link-underline"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.25s ease",
            }}
            data-cursor="pointer"
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "var(--text-secondary)")
            }
          >
            {link.label}
          </a>
        ))}

        <a
          href="#contact"
          data-cursor="pointer"
          style={{
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--accent)",
            border: "0.5px solid rgba(0,255,65,0.35)",
            borderRadius: "4px",
            padding: "8px 18px",
            textDecoration: "none",
            transition: "background 0.25s ease, box-shadow 0.25s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "rgba(0,255,65,0.08)";
            (e.target as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,65,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "transparent";
            (e.target as HTMLElement).style.boxShadow = "none";
          }}
        >
          Let&apos;s Talk →
        </a>
      </nav>
    </header>
  );
}
