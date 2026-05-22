import { useState } from "react";
import { OLLDiagram, PLLDiagram } from "./Diagrams";
import { DIFFICULTY_LABELS, CATEGORY_COLORS } from "../data/formulas";
import { useCubeStore } from "../store/cubeStore";
import { parseMoves } from "../engine/cube";

const STARS = (n) => "★".repeat(n) + "☆".repeat(5-n);

export default function FormulaCard({ formula, onClick, isSelected }) {
  const [copied, setCopied] = useState(false);
  const enqueueMoves = useCubeStore(state => state.enqueueMoves);

  const catColor = CATEGORY_COLORS[formula.group] || CATEGORY_COLORS[formula.category] || "#888";
  const mainAlg = formula.algorithms[0];

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mainAlg.moves);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAnimate = (e) => {
    e.stopPropagation();
    const parsed = parseMoves(mainAlg.moves);
    if (parsed.length > 0) {
      enqueueMoves(parsed);
    }
  };

  return (
    <div
      onClick={() => onClick(formula)}
      className={`formula-card ${isSelected ? "selected" : ""}`}
      style={{"--cat-color": catColor}}
    >
      {/* Header */}
      <div className="card-header">
        <div className="card-diagram">
          {formula.category === "OLL" && formula.topFace
            ? <OLLDiagram topFace={formula.topFace} size={52} />
            : formula.category === "PLL"
            ? <PLLDiagram size={52} />
            : <div className="card-icon">{formula.category?.slice(0,1)}</div>
          }
        </div>
        <div className="card-info">
          <div className="card-name">{formula.name}</div>
          <div className="card-meta">
            <span className="cat-badge" style={{background: catColor + "22", color: catColor, border:`1px solid ${catColor}44`}}>
              {formula.category}
            </span>
            <span className="group-badge">{formula.group}</span>
          </div>
          <div className="card-stars" title={DIFFICULTY_LABELS[formula.difficulty]}>
            {STARS(formula.difficulty)}
          </div>
        </div>
      </div>

      {/* Algorithm preview */}
      <div className="card-alg">
        <code>{mainAlg.moves}</code>
        <button className="copy-btn" onClick={handleCopy} title="Copy algorithm">
          {copied ? "✓" : "⎘"}
        </button>
      </div>

      {/* Expanded content */}
      {isSelected && (
        <div className="card-expanded">
          <p className="card-desc">{formula.description}</p>
          {formula.algorithms.length > 1 && (
            <div className="card-alts">
              <div className="alts-label">Alternatives</div>
              {formula.algorithms.slice(1).map((a, i) => (
                <div key={i} className="alt-alg">
                  <span className="alt-label">{a.label}</span>
                  <code>{a.moves}</code>
                </div>
              ))}
            </div>
          )}
          
          <div className="card-actions-row">
            {formula.executionTime && (
              <div className="card-time">⏱ ~{formula.executionTime}</div>
            )}
            {mainAlg.moves !== "—" && (
              <button className="btn-card-animate" onClick={handleAnimate}>
                ▶ Animate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
