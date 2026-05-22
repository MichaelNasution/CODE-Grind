import { useMemo } from "react";
import { useCubeStore } from "../store/cubeStore";
import { ALL_FORMULAS, NOTATION } from "../data/formulas";
import FormulaCard from "./FormulaCard";

const CATEGORIES = ["All","OLL","PLL","F2L","Method"];

export default function FormulaLibrary() {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory, selectedFormula, setSelectedFormula } = useCubeStore();

  const filtered = useMemo(() => {
    let list = ALL_FORMULAS;
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
  }, [activeCategory, searchQuery]);

  return (
    <div className="library-panel">
      {/* Search */}
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
          ? <div className="empty-state">No formulas match your search.</div>
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
