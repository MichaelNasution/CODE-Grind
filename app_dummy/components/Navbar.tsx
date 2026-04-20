"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Work", href: "/work" },
  { label: "Lab", href: "/lab" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll state on route change
    setScrolled(false);

    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isHome = pathname === "/";
  const alwaysOpaque = !isHome; // non-home pages always have bg

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "0 48px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.4s ease, border-color 0.4s ease",
        background:
          scrolled || alwaysOpaque ? "rgba(5,5,5,0.9)" : "transparent",
        backdropFilter: scrolled || alwaysOpaque ? "blur(20px)" : "none",
        WebkitBackdropFilter:
          scrolled || alwaysOpaque ? "blur(20px)" : "none",
        borderBottom:
          scrolled || alwaysOpaque
            ? "0.5px solid #1f1f1f"
            : "0.5px solid transparent",
      }}
    >
      {/* ── Logo ── */}
      <Link
        href="/"
        data-cursor="pointer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "var(--text-primary)",
        }}
      >
        {/* Mark */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="1"
            y="1"
            width="20"
            height="20"
            rx="3"
            stroke="var(--accent)"
            strokeWidth="0.75"
          />
          <path
            d="M6 11 L11 6 L16 11 L11 16 Z"
            fill="var(--accent)"
            opacity="0.9"
          />
        </svg>

        {/* Wordmark */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
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
        </span>
      </Link>

      {/* ── Nav Links ── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.label}
              href={link.href}
              data-cursor="pointer"
              className={`link-underline${isActive ? " nav-link-active" : ""}`}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.25s ease",
              }}
            >
              {link.label}
            </Link>
          );
        })}

        {/* CTA Button */}
        <Link
          href="/contact"
          data-cursor="pointer"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent)",
            border: "0.5px solid rgba(0,255,65,0.35)",
            borderRadius: "4px",
            padding: "9px 20px",
            textDecoration: "none",
            transition: "background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "rgba(0,255,65,0.08)";
            el.style.boxShadow = "0 0 20px rgba(0,255,65,0.2)";
            el.style.borderColor = "rgba(0,255,65,0.6)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "transparent";
            el.style.boxShadow = "none";
            el.style.borderColor = "rgba(0,255,65,0.35)";
          }}
        >
          Let&apos;s Talk
          <span
            style={{
              display: "inline-block",
              transition: "transform 0.25s ease",
            }}
          >
            →
          </span>
        </Link>
      </nav>
    </header>
  );
}
