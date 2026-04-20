"use client";

import Link from "next/link";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="project-card"
      data-cursor="pointer"
    >
      {/* Thumbnail */}
      <div className="project-card-thumb">
        <div
          className="project-card-thumb-inner"
          style={{
            background: `linear-gradient(135deg, ${project.bgColor} 0%, ${project.accentColor}22 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Abstract visual placeholder */}
          <svg
            viewBox="0 0 400 225"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%", opacity: 0.6 }}
          >
            {/* Grid lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 57}
                y1="0"
                x2={i * 57}
                y2="225"
                stroke={project.accentColor}
                strokeWidth="0.3"
                opacity="0.2"
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 57}
                x2="400"
                y2={i * 57}
                stroke={project.accentColor}
                strokeWidth="0.3"
                opacity="0.2"
              />
            ))}
            {/* Center accent shape */}
            <circle
              cx="200"
              cy="112"
              r="40"
              fill="none"
              stroke={project.accentColor}
              strokeWidth="0.5"
              opacity="0.4"
            />
            <circle
              cx="200"
              cy="112"
              r="20"
              fill={project.accentColor}
              opacity="0.15"
            />
            {/* Index number */}
            <text
              x="200"
              y="118"
              textAnchor="middle"
              fill={project.accentColor}
              fontSize="14"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
              opacity="0.5"
            >
              {String(index + 1).padStart(2, "0")}
            </text>
          </svg>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "20px 22px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: project.accentColor,
              fontWeight: 500,
            }}
          >
            {project.category}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
            }}
          >
            {project.year}
          </span>
        </div>

        <h3
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            marginBottom: "8px",
          }}
        >
          {project.title}
        </h3>

        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            marginBottom: "16px",
          }}
        >
          {project.subtitle}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover arrow */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "32px",
          height: "32px",
          border: "0.5px solid var(--border)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          color: "var(--text-tertiary)",
          background: "var(--card-bg)",
          transition: "border-color 0.3s ease, color 0.3s ease, transform 0.3s ease",
        }}
        className="card-arrow"
      >
        ↗
      </div>
      <style>{`
        .project-card:hover .card-arrow {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          transform: rotate(45deg) !important;
        }
      `}</style>
    </Link>
  );
}
