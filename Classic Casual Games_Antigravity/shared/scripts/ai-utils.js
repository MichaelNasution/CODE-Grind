(function () {
  "use strict";

  const GameKit = window.GameKit || {};

  function minimax(state, depth, isMaximizing, getMoves, applyMove, evaluate, terminal, maxDepth = Infinity) {
    const terminalScore = terminal(state, depth);
    if (terminalScore !== null || depth >= maxDepth) return terminalScore ?? evaluate(state, depth);

    const moves = getMoves(state);
    if (!moves.length) return evaluate(state, depth);

    if (isMaximizing) {
      let best = -Infinity;
      for (const move of moves) {
        best = Math.max(best, minimax(applyMove(state, move, true), depth + 1, false, getMoves, applyMove, evaluate, terminal, maxDepth));
      }
      return best;
    }

    let best = Infinity;
    for (const move of moves) {
      best = Math.min(best, minimax(applyMove(state, move, false), depth + 1, true, getMoves, applyMove, evaluate, terminal, maxDepth));
    }
    return best;
  }

  function alphaBeta(state, depth, alpha, beta, isMaximizing, getMoves, applyMove, evaluate, terminal, maxDepth = Infinity) {
    const terminalScore = terminal(state, depth);
    if (terminalScore !== null || depth >= maxDepth) return terminalScore ?? evaluate(state, depth);

    const moves = getMoves(state);
    if (!moves.length) return evaluate(state, depth);

    if (isMaximizing) {
      let best = -Infinity;
      for (const move of moves) {
        best = Math.max(best, alphaBeta(applyMove(state, move, true), depth + 1, alpha, beta, false, getMoves, applyMove, evaluate, terminal, maxDepth));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }

    let best = Infinity;
    for (const move of moves) {
      best = Math.min(best, alphaBeta(applyMove(state, move, false), depth + 1, alpha, beta, true, getMoves, applyMove, evaluate, terminal, maxDepth));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  function evaluateBoard(board, weights = {}) {
    return board.reduce((score, cell) => {
      if (!cell) return score;
      const value = weights[cell.type || cell] || 0;
      return cell.color === "black" || cell.player === "ai" ? score + value : score - value;
    }, 0);
  }

  window.GameKit = {
    ...GameKit,
    minimax,
    alphaBeta,
    evaluateBoard,
  };
})();
