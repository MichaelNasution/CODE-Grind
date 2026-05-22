import { useEffect } from "react";
import { useCubeStore } from "../store/cubeStore";
import { isSolved, parseMoves } from "../engine/cube";

const MOVES_3x3 = ["R","R'","R2","L","L'","L2","U","U'","U2","D","D'","D2","F","F'","F2","B","B'","B2"];

export default function SolverPanel() {
  const {
    cube, scramble, solve, reset, undo, redo,
    solutionMoves, solutionStep, stepSolution,
    speed, setSpeed, method, setMethod,
    historyIndex, history,
    isPlaying, setIsPlaying,
    enqueueMoves, clearQueue
  } = useCubeStore();

  const solved = isSolved(cube);

  // Pulse CSS effect upon completing a solution
  useEffect(() => {
    if (solutionMoves.length > 0 && solutionStep === solutionMoves.length) {
      const vp = document.querySelector(".cube-viewport");
      if (vp) {
        vp.style.transition = "transform 0.4s";
        vp.style.transform = "scale(1.02)";
        setTimeout(() => { vp.style.transform = ""; }, 400);
      }
    }
  }, [solutionStep, solutionMoves.length]);

  const handleScramble = () => {
    clearQueue();
    setIsPlaying(false);
    scramble();
  };

  const handleSolve = () => {
    clearQueue();
    setIsPlaying(false);
    solve();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      clearQueue();
      setIsPlaying(false);
    } else {
      const remaining = solutionMoves.slice(solutionStep);
      enqueueMoves(remaining);
      setIsPlaying(true);
    }
  };

  const handleStepForward = () => {
    clearQueue();
    setIsPlaying(false);
    if (solutionStep < solutionMoves.length) {
      enqueueMoves([solutionMoves[solutionStep]]);
    }
  };

  const handleInputMove = (e) => {
    if (e.key === "Enter") {
      const val = e.target.value.trim();
      const moves = parseMoves(val);
      if (moves.length) enqueueMoves(moves);
      e.target.value = "";
    }
  };

  const scrambleStr = useCubeStore.getState().scrambleMoves.join(" ");
  const progress = solutionMoves.length > 0 ? (solutionStep / solutionMoves.length) * 100 : 0;

  return (
    <div className="solver-panel">
      {/* Status badge */}
      <div className={`status-badge ${solved ? "status-solved" : "status-scrambled"}`}>
        {solved ? "✓ Solved" : "⧖ Scrambled"}
      </div>

      {/* Method selector */}
      <div className="section">
        <div className="section-label">Solving Method</div>
        <div className="method-grid">
          {["Layer-by-Layer","CFOP","Roux","ZZ","Optimal"].map(m => (
            <button key={m} className={`method-btn ${method===m?"active":""}`} onClick={() => setMethod(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="section">
        <div className="action-row">
          <button className="btn btn-primary" onClick={handleScramble}>⇄ Scramble</button>
          <button className="btn btn-accent" onClick={handleSolve} disabled={solved}>▶ Solve</button>
          <button className="btn btn-ghost" onClick={reset}>↺ Reset</button>
        </div>
        <div className="action-row">
          <button className="btn btn-ghost" onClick={undo} disabled={historyIndex <= 0}>← Undo</button>
          <button className="btn btn-ghost" onClick={redo} disabled={historyIndex >= history.length-1}>Redo →</button>
        </div>
      </div>

      {/* Manual input */}
      <div className="section">
        <div className="section-label">Enter Moves</div>
        <input className="move-input" placeholder="e.g. R U R' U' F R F'" onKeyDown={handleInputMove} />
        <div className="move-hint">Press Enter to execute</div>
        <div className="quick-moves">
          {["R","R'","U","U'","F","F'","L","L'","D","D'","B","B'"].map(m => (
            <button key={m} className="quick-btn" onClick={() => enqueueMoves([m])}>{m}</button>
          ))}
        </div>
      </div>

      {/* Scramble display */}
      {scrambleStr && (
        <div className="section">
          <div className="section-label">Scramble</div>
          <div className="move-sequence">{scrambleStr}</div>
        </div>
      )}

      {/* Solution playback */}
      {solutionMoves.length > 0 && (
        <div className="section">
          <div className="section-label">Solution ({solutionMoves.length} moves)</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width:`${progress}%`}} />
          </div>
          <div className="move-sequence solution-moves">
            {solutionMoves.map((m, i) => (
              <span key={i} className={`move-token ${i < solutionStep ? "done" : i === solutionStep ? "current" : ""}`}>{m}</span>
            ))}
          </div>
          <div className="playback-controls">
            <button className="btn btn-ghost" onClick={handleStepForward} disabled={solutionStep >= solutionMoves.length}>⊢ Step</button>
            <button className={`btn ${isPlaying ? "btn-accent" : "btn-primary"}`} onClick={handlePlayPause}>
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
          </div>
          <div className="speed-control">
            <span className="section-label">Speed: {speed}×</span>
            <input type="range" min="0.5" max="3" step="0.5" value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))} className="speed-slider" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="section stats-row">
        <div className="stat"><span className="stat-val">{history.length-1}</span><span className="stat-label">Moves made</span></div>
        <div className="stat"><span className="stat-val">{solutionMoves.length||"—"}</span><span className="stat-label">Solution length</span></div>
        <div className="stat"><span className="stat-val">{method}</span><span className="stat-label">Method</span></div>
      </div>
    </div>
  );
}
