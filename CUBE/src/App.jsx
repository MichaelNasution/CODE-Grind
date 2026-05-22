import { useState } from "react";
import { useCubeStore } from "./store/cubeStore";
import CubeCanvas from "./components/CubeCanvas";
import SolverPanel from "./components/SolverPanel";
import FormulaLibrary from "./components/FormulaLibrary";
import TutorialPanel from "./components/TutorialPanel";

const TABS = [
  { id:"solver",   label:"Solver",   icon:"⚙" },
  { id:"library",  label:"Formulas", icon:"📚" },
  { id:"tutorial", label:"Tutorial", icon:"🎓" },
];

export default function App() {
  const { cube, activeTab, setActiveTab, applyMoveSequence } = useCubeStore();
  const [mobilePanel, setMobilePanel] = useState(false);

  return (
    <div className="app">
      {/* Nav */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">CubeOS</span>
          <span className="logo-sub">Formula Lab</span>
        </div>
        <div className="nav-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`nav-tab ${activeTab===t.id?"active":""}`}
              onClick={() => setActiveTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <span className="nav-hint">Drag cube to rotate • Double-click to reset</span>
        </div>
      </nav>

      {/* Main layout */}
      <div className="main-layout">
        {/* Cube viewport */}
        <div className="cube-viewport">
          <CubeCanvas cubeState={cube} />
          <div className="viewport-overlay">
            <div className="face-labels">
              <span className="face-label top">U</span>
              <span className="face-label right">R</span>
              <span className="face-label front">F</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          {activeTab === "solver"   && <SolverPanel />}
          {activeTab === "library"  && <FormulaLibrary />}
          {activeTab === "tutorial" && <TutorialPanel onApplyMoves={applyMoveSequence} />}
        </div>
      </div>
    </div>
  );
}
