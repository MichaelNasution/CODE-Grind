(function () {
  "use strict";

  /* ───── Built-in AI (alpha-beta) ───── */
  function chooseMove(state) {
    const depth = { easy: 1, medium: 2, hard: 3 }[state.difficulty] || 2;
    let best = -Infinity;
    const bestMoves = [];
    const moves = window.ChessGame.allLegalMoves(state, "black");
    moves.forEach((move) => {
      const next = cloneState(state);
      window.ChessGame.applyMove(next, move);
      const score = search(next, depth - 1, -Infinity, Infinity, false, state.difficulty === "hard");
      if (score > best) {
        best = score;
        bestMoves.length = 0;
        bestMoves.push(move);
      } else if (score === best) {
        bestMoves.push(move);
      }
    });
    return bestMoves[GameKit.randomInt(0, bestMoves.length - 1)];
  }

  function search(state, depth, alpha, beta, maximizing, prune) {
    if (depth <= 0 || state.status === "checkmate" || state.status === "stalemate") return window.ChessGame.evaluate(state);
    const color = maximizing ? "black" : "white";
    const moves = window.ChessGame.allLegalMoves(state, color);
    if (!moves.length) return window.ChessGame.evaluate(state);

    if (maximizing) {
      let best = -Infinity;
      for (const move of moves) {
        const next = cloneState(state);
        window.ChessGame.applyMove(next, move);
        best = Math.max(best, search(next, depth - 1, alpha, beta, false, prune));
        alpha = Math.max(alpha, best);
        if (prune && beta <= alpha) break;
      }
      return best;
    }

    let best = Infinity;
    for (const move of moves) {
      const next = cloneState(state);
      window.ChessGame.applyMove(next, move);
      best = Math.min(best, search(next, depth - 1, alpha, beta, true, prune));
      beta = Math.min(beta, best);
      if (prune && beta <= alpha) break;
    }
    return best;
  }

  /* ───── Stockfish AI (async) ───── */
  async function chooseMoveStockfish(state) {
    if (!window.StockfishEngine.isReady()) {
      await window.StockfishEngine.init();
    }
    const fen = window.ChessGame.toFEN(state);
    const uciMove = await window.StockfishEngine.getBestMove(fen, 15);
    if (!uciMove || uciMove === "(none)") return null;
    return window.ChessGame.parseUCIMove(uciMove, state.board);
  }

  /* ───── Unified async interface ───── */
  async function chooseMoveAsync(state) {
    if (state.difficulty === "stockfish") {
      return chooseMoveStockfish(state);
    }
    /* Built-in AI is synchronous, wrap in microtask for UI breathing room */
    return chooseMove(state);
  }

  function cloneState(state) {
    return {
      ...state,
      board: state.board.map((piece) => piece ? { ...piece } : null),
      lastMove: state.lastMove ? { ...state.lastMove } : null,
      castling: state.castling ? { ...state.castling } : { K: true, Q: true, k: true, q: true },
      enPassant: state.enPassant,
      captured: {
        white: state.captured?.white ? state.captured.white.map((piece) => ({ ...piece })) : [],
        black: state.captured?.black ? state.captured.black.map((piece) => ({ ...piece })) : [],
      },
      legalMoves: [],
    };
  }

  window.ChessAI = { chooseMove, chooseMoveAsync };
})();
