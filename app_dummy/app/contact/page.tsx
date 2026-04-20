"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";
import MorphingSVG from "@/components/MorphingSVG";

const SOCIAL_LINKS = [
  { label: "Twitter / X", handle: "@devwkaleh", href: "#" },
  { label: "GitHub", handle: "github.com/kaleh", href: "#" },
  { label: "Dribbble", handle: "dribbble.com/kaleh", href: "#" },
  { label: "LinkedIn", handle: "linkedin.com/in/kaleh", href: "#" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current?.querySelectorAll(".hero-item") ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.8, stagger: 0.1,
          ease: "power3.out", delay: 0.1,
        }
      );
      gsap.fromTo(
        formRef.current?.querySelectorAll(".form-row") ?? [],
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.6, stagger: 0.08,
          ease: "power3.out", delay: 0.3,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setFormState("sending");

    // Animate button
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        width: btnRef.current.offsetWidth,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    // Simulate async send
    await new Promise((r) => setTimeout(r, 1800));
    setFormState("sent");

    // Success animation
    gsap.fromTo(
      ".success-message",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* ── Main Grid Layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "calc(100vh - 68px)",
          marginTop: "68px",
        }}
      >
        {/* ── Left: CTA ── */}
        <div
          ref={heroRef}
          className="grid-bg"
          style={{
            padding: "80px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: "0.5px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Morphing blob */}
          <MorphingSVG
            color="var(--accent)"
            opacity={0.06}
            style={{
              position: "absolute",
              bottom: "5%",
              right: "-5%",
              width: "300px",
              height: "300px",
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
                marginBottom: "20px",
              }}
            >
              Start a Project
            </p>
            <h1
              className="hero-item"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(38px, 5vw, 68px)",
                fontWeight: 900,
                lineHeight: 1.05,
                color: "var(--text-primary)",
                marginBottom: "24px",
              }}
            >
              Let&apos;s Build
              <br />
              Something
              <br />
              <em style={{ color: "var(--accent)" }}>Remarkable.</em>
            </h1>
            <p
              className="hero-item"
              style={{
                fontSize: "15px",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
                maxWidth: "380px",
              }}
            >
              Whether it&apos;s a WebGL experience, a motion design system, or
              an interactive data visualization — let&apos;s talk about what
              you&apos;re building.
            </p>
          </div>

          {/* Social links */}
          <div
            className="hero-item"
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: "60px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: "20px",
              }}
            >
              Find me online
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {SOCIAL_LINKS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  data-cursor="pointer"
                  className="link-underline"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "0.5px solid var(--border)",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    transition: "padding-left 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "8px";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "0";
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{ fontSize: "12px", color: "var(--text-tertiary)" }}
                  >
                    {s.handle}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div
          style={{
            padding: "80px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {formState === "sent" ? (
            <div
              className="success-message"
              style={{ opacity: 0 }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "0.5px solid var(--accent)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "var(--accent)",
                  marginBottom: "24px",
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                }}
              >
                Message sent.
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "32px",
                }}
              >
                I&apos;ll get back to you within 24 hours. Looking forward to
                learning about your project.
              </p>
              <button
                data-cursor="pointer"
                onClick={() => {
                  setFormState("idle");
                  setName("");
                  setEmail("");
                  setMessage("");
                }}
                style={{
                  background: "transparent",
                  border: "0.5px solid var(--border)",
                  color: "var(--text-secondary)",
                  borderRadius: "4px",
                  padding: "12px 24px",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  cursor: "none",
                  transition: "border-color 0.25s ease, color 0.25s ease",
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit}>
              <p
                className="form-row"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "40px",
                }}
              >
                Get in touch
              </p>

              {/* Name */}
              <div className="form-row" style={{ marginBottom: "32px" }}>
                <label
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Name
                </label>
                <div className="form-input-wrap">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <div className="form-input-line" />
                </div>
              </div>

              {/* Email */}
              <div className="form-row" style={{ marginBottom: "32px" }}>
                <label
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Email
                </label>
                <div className="form-input-wrap">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="form-input-line" />
                </div>
              </div>

              {/* Message */}
              <div className="form-row" style={{ marginBottom: "48px" }}>
                <label
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Project Brief
                </label>
                <div className="form-input-wrap">
                  <textarea
                    className="form-input"
                    placeholder="Tell me about your project, timeline, and goals..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    style={{ resize: "none" }}
                  />
                  <div className="form-input-line" />
                </div>
              </div>

              {/* Submit */}
              <div className="form-row">
                <MagneticButton strength={0.25}>
                  <button
                    ref={btnRef}
                    type="submit"
                    data-cursor="pointer"
                    disabled={formState === "sending"}
                    style={{
                      background:
                        formState === "sending"
                          ? "rgba(0,255,65,0.6)"
                          : "var(--accent)",
                      color: "#050505",
                      border: "none",
                      borderRadius: "6px",
                      padding: "16px 40px",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: "none",
                      transition: "background 0.3s ease, box-shadow 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      boxShadow: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 30px rgba(0,255,65,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    {formState === "sending" ? (
                      <>
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "2px solid #050505",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Sending…
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      </>
                    ) : (
                      <>Send Message →</>
                    )}
                  </button>
                </MagneticButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
