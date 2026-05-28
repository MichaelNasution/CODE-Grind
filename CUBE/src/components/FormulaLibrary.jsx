import { useMemo, useState } from "react";
import { useCubeStore } from "../store/cubeStore";
import { ALL_FORMULAS, NOTATION } from "../data/formulas";
import FormulaCard from "./FormulaCard";

const CATEGORIES = ["All", "OLL", "PLL", "F2L", "Method", "Custom"];
const VALID_MOVES = new Set(["R","R'","R2","L","L'","L2","U","U'","U2","D","D'","D2","F","F'","F2","B","B'","B2"]);

export default function FormulaLibrary() {
  const {
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    selectedFormula, setSelectedFormula,
    customFormulas, addCustomFormula
  } = useCubeStore();

  // Custom loader form state
  const [customName, setCustomName] = useState("");
  const [customMoves, setCustomMoves] = useState("");
  const [customGroup, setCustomGroup] = useState("User Custom");
  const [customDesc, setCustomDesc] = useState("");
  const [customDiff, setCustomDiff] = useState(3);
  const [formOpen, setFormOpen] = useState(false);

  // Real-time notation validation
  const validation = useMemo(() => {
    if (!customMoves.trim()) {
      return { valid: false, message: "Enter space-separated standard 3x3 moves (e.g. R U R' U').", invalidTokens: [] };
    }
    const cleaned = customMoves.replace(/[()[\]]/g, " ").trim();
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 0);
    
    if (tokens.length === 0) {
      return { valid: false, message: "Enter standard moves above.", invalidTokens: [] };
    }

    const invalidTokens = tokens.filter(t => !VALID_MOVES.has(t));
    if (invalidTokens.length > 0) {
      return {
        valid: false,
        message: `Invalid notation detected: "${invalidTokens.join(", ")}"`,
        invalidTokens
      };
    }

    return {
      valid: true,
      message: `Notation valid! (${tokens.length} moves)`,
      invalidTokens: []
    };
  }, [customMoves]);

  // Combine default library with loaded custom formulas
  const combinedFormulas = useMemo(() => {
    const customWithCategory = customFormulas.map(f => ({
      ...f,
      category: "Custom"
    }));
    return [...ALL_FORMULAS, ...customWithCategory];
  }, [customFormulas]);

  const filtered = useMemo(() => {
    let list = combinedFormulas;
    if (activeCategory !== "All") list = list.filter(f => f.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.group.toLowerCase().includes(q) ||
        f.algorithms.some(a => a.moves.toLowerCase().includes(q)) ||
        (f.description || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [combinedFormulas, activeCategory, searchQuery]);

  const handleAddFormula = (e) => {
    e.preventDefault();
    if (!customName.trim() || !validation.valid) return;

    const newFormula = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      group: customGroup.trim() || "User Custom",
      difficulty: customDiff,
      algorithms: [{ label: "Main", moves: customMoves.trim() }],
      description: customDesc.trim() || "User loaded custom algorithm.",
      executionTime: `${(0.4 * customMoves.split(/\s+/).length).toFixed(1)}s`
    };

    addCustomFormula(newFormula);

    // Reset fields
    setCustomName("");
    setCustomMoves("");
    setCustomDesc("");
    setCustomDiff(3);
    setFormOpen(false);
    setActiveCategory("Custom"); // Auto-focus custom library!
  };

  return (
    <div className="library-panel">
      {/* Search and Custom Loader trigger */}
      <div className="library-header-row">
        <div className="library-search">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            placeholder="Search by name, group, or notation…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery("")}>×</button>
          )}
        </div>
        <button className="btn btn-primary toggle-form-btn" onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? "✕ Close Form" : "✚ Custom Loader"}
        </button>
      </div>

      {/* Custom Formula Loader Form */}
      {formOpen && (
        <form onSubmit={handleAddFormula} className="custom-loader-form">
          <h3 className="section-title">✚ Load Custom Formula</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Formula Name</label>
              <input
                className="form-input"
                placeholder="e.g. My Custom Sune"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Group/Category</label>
              <input
                className="form-input"
                placeholder="e.g. Corners, Edges, Roux Sb"
                value={customGroup}
                onChange={e => setCustomGroup(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Algorithm Moves</label>
              <input
                className="form-input moves-input-field"
                placeholder="e.g. R U R' U R U2 R'"
                value={customMoves}
                onChange={e => setCustomMoves(e.target.value)}
                required
              />
              <div className={`validation-badge ${validation.valid ? "valid" : "invalid"}`}>
                {validation.valid ? "✓ " : "⚠ "} {validation.message}
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description / Hints</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe how to recognize this case or alternative trigger steps…"
                value={customDesc}
                onChange={e => setCustomDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Difficulty Stars: {customDiff}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={customDiff}
                onChange={e => setCustomDiff(parseInt(e.target.value))}
                className="form-range"
              />
            </div>

            <div className="form-actions full-width">
              <button
                type="submit"
                className="btn btn-accent submit-loader-btn"
                disabled={!customName.trim() || !validation.valid}
              >
                ✓ Load to Library
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category filters */}
      <div className="cat-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="results-count">{filtered.length} formula{filtered.length !== 1 ? "s" : ""}</div>

      {/* Cards */}
      <div className="formula-grid">
        {filtered.length === 0
          ? <div className="empty-state">No formulas match your search or filters.</div>
          : filtered.map(f => (
            <FormulaCard
              key={f.id}
              formula={f}
              isSelected={selectedFormula?.id === f.id}
              onClick={sel => setSelectedFormula(selectedFormula?.id === sel.id ? null : sel)}
            />
          ))
        }
      </div>

      {/* Notation Reference */}
      <div className="notation-section">
        <h3 className="section-title">Notation Reference</h3>
        <div className="notation-grid">
          {NOTATION.map(n => (
            <div key={n.id} className="notation-row">
              <code className="notation-symbol">{n.symbol}</code>
              <span className="notation-desc">{n.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
