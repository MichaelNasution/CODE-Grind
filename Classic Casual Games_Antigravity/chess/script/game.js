(function () {
  "use strict";

  const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 };
  const symbols = {
    white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
    black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
  };

  /* ───── square helpers ───── */
  function rowCol(index) { return [Math.floor(index / 8), index % 8]; }
  function toIndex(row, col) { return row * 8 + col; }

  /* ───── legal move generation ───── */
  function legalMoves(state, from) {
    const piece = state.board[from];
    if (!piece) return [];
    return pseudoMoves(state, from).filter((move) => {
      const next = simulateMove(state, { from, to: move.to, promotion: move.promotion, castle: move.castle, enPassant: move.enPassant });
      return !isInCheck(next.board, piece.color);
    });
  }

  function allLegalMoves(state, color) {
    if (color === undefined) color = state.turn;
    const moves = [];
    state.board.forEach((piece, index) => {
      if (piece && piece.color === color) {
        legalMoves(state, index).forEach((move) => moves.push({ from: index, ...move }));
      }
    });
    return moves;
  }

  /* ───── pseudo-legal move generation ───── */
  function pseudoMoves(state, from) {
    const board = state.board;
    const piece = board[from];
    if (!piece) return [];
    const moves = [];
    const [row, col] = rowCol(from);

    const add = (r, c, extra) => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const to = toIndex(r, c);
      if (board[to] && board[to].color === piece.color) return false;
      moves.push({ to, promotion: null, castle: null, enPassant: false, ...extra });
      return !board[to];
    };

    /* ── Pawn ── */
    if (piece.type === "pawn") {
      const dir = piece.color === "white" ? -1 : 1;
      const startRow = piece.color === "white" ? 6 : 1;
      const promoRow = piece.color === "white" ? 0 : 7;
      const nextRow = row + dir;
      const next = toIndex(nextRow, col);

      /* Single push */
      if (!board[next]) {
        if (nextRow === promoRow) {
          ["queen", "rook", "bishop", "knight"].forEach((p) => add(nextRow, col, { promotion: p }));
        } else {
          add(nextRow, col);
        }
        /* Double push */
        if (row === startRow) {
          const doubleNext = toIndex(row + dir * 2, col);
          if (!board[doubleNext]) add(row + dir * 2, col);
        }
      }
      /* Captures */
      [-1, 1].forEach((dc) => {
        const nc = col + dc;
        if (nc < 0 || nc > 7) return;
        const target = toIndex(nextRow, nc);
        if (board[target] && board[target].color !== piece.color) {
          if (nextRow === promoRow) {
            ["queen", "rook", "bishop", "knight"].forEach((p) => add(nextRow, nc, { promotion: p }));
          } else {
            add(nextRow, nc);
          }
        }
        /* En passant */
        if (state.enPassant === target) {
          add(nextRow, nc, { enPassant: true });
        }
      });
    }

    /* ── Knight ── */
    if (piece.type === "knight") {
      [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(([dr, dc]) => add(row + dr, col + dc));
    }

    /* ── King ── */
    if (piece.type === "king") {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr || dc) add(row + dr, col + dc);
        }
      }

      /* ── Castling ── */
      if (!isInCheck(board, piece.color)) {
        const homeRow = piece.color === "white" ? 7 : 0;
        if (row === homeRow && col === 4) {
          /* Kingside (O-O) */
          const kRight = piece.color === "white" ? "K" : "k";
          if (state.castling[kRight]) {
            const rookIdx = toIndex(homeRow, 7);
            if (board[rookIdx] && board[rookIdx].type === "rook" && board[rookIdx].color === piece.color) {
              if (!board[toIndex(homeRow, 5)] && !board[toIndex(homeRow, 6)]) {
                /* King must not pass through or land on attacked square */
                if (!isSquareAttacked(board, toIndex(homeRow, 5), piece.color) &&
                    !isSquareAttacked(board, toIndex(homeRow, 6), piece.color)) {
                  moves.push({ to: toIndex(homeRow, 6), promotion: null, castle: "K", enPassant: false });
                }
              }
            }
          }
          /* Queenside (O-O-O) */
          const qRight = piece.color === "white" ? "Q" : "q";
          if (state.castling[qRight]) {
            const rookIdx = toIndex(homeRow, 0);
            if (board[rookIdx] && board[rookIdx].type === "rook" && board[rookIdx].color === piece.color) {
              if (!board[toIndex(homeRow, 1)] && !board[toIndex(homeRow, 2)] && !board[toIndex(homeRow, 3)]) {
                if (!isSquareAttacked(board, toIndex(homeRow, 3), piece.color) &&
                    !isSquareAttacked(board, toIndex(homeRow, 2), piece.color)) {
                  moves.push({ to: toIndex(homeRow, 2), promotion: null, castle: "Q", enPassant: false });
                }
              }
            }
          }
        }
      }
    }

    /* ── Sliding pieces (Bishop, Rook, Queen) ── */
    const sliders = {
      bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
      rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
      queen: [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]],
    };
    if (sliders[piece.type]) {
      sliders[piece.type].forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        while (add(r, c)) {
          r += dr;
          c += dc;
        }
      });
    }

    return moves;
  }

  /* ───── apply move (mutates state) ───── */
  function applyMove(state, move) {
    const piece = state.board[move.from];
    const captured = state.board[move.to];

    /* En passant capture */
    let epCaptured = null;
    if (move.enPassant && piece.type === "pawn") {
      const dir = piece.color === "white" ? 1 : -1;
      const epIndex = move.to + dir * 8;
      epCaptured = state.board[epIndex];
      state.board[epIndex] = null;
    }

    /* Track captured piece */
    const actualCapture = captured || epCaptured;
    if (actualCapture && state.captured) {
      state.captured[piece.color].push(actualCapture);
    }

    /* Execute board move */
    state.board[move.to] = move.promotion ? { type: move.promotion, color: piece.color } : piece;
    state.board[move.from] = null;

    /* Execute castling rook move */
    if (move.castle) {
      const homeRow = piece.color === "white" ? 7 : 0;
      if (move.castle === "K") {
        state.board[toIndex(homeRow, 5)] = state.board[toIndex(homeRow, 7)];
        state.board[toIndex(homeRow, 7)] = null;
      } else {
        state.board[toIndex(homeRow, 3)] = state.board[toIndex(homeRow, 0)];
        state.board[toIndex(homeRow, 0)] = null;
      }
    }

    /* Update castling rights */
    if (piece.type === "king") {
      if (piece.color === "white") { state.castling.K = false; state.castling.Q = false; }
      else { state.castling.k = false; state.castling.q = false; }
    }
    if (piece.type === "rook") {
      if (move.from === 56) state.castling.Q = false;      /* a1 */
      else if (move.from === 63) state.castling.K = false;  /* h1 */
      else if (move.from === 0) state.castling.q = false;   /* a8 */
      else if (move.from === 7) state.castling.k = false;   /* h8 */
    }
    /* If a rook is captured on its home square */
    if (move.to === 56) state.castling.Q = false;
    if (move.to === 63) state.castling.K = false;
    if (move.to === 0) state.castling.q = false;
    if (move.to === 7) state.castling.k = false;

    /* Update en passant target */
    if (piece.type === "pawn" && Math.abs(move.to - move.from) === 16) {
      state.enPassant = (move.from + move.to) / 2;
    } else {
      state.enPassant = null;
    }

    /* Half-move clock */
    if (piece.type === "pawn" || actualCapture) {
      state.halfMoveClock = 0;
    } else {
      state.halfMoveClock = (state.halfMoveClock || 0) + 1;
    }

    /* Full move number */
    if (piece.color === "black") {
      state.fullMoveNumber = (state.fullMoveNumber || 1) + 1;
    }

    state.lastMove = move;
    state.turn = piece.color === "white" ? "black" : "white";

    /* Update game status */
    const nextMoves = allLegalMoves(state, state.turn);
    if (!nextMoves.length) {
      state.status = isInCheck(state.board, state.turn) ? "checkmate" : "stalemate";
    } else {
      state.status = isInCheck(state.board, state.turn) ? "check" : "playing";
    }
  }

  /* ───── simulate move (returns new state, does not mutate) ───── */
  function simulateMove(state, move) {
    const next = {
      board: state.board.map((p) => p ? { ...p } : null),
      castling: { ...state.castling },
      enPassant: state.enPassant,
      turn: state.turn,
    };

    const piece = next.board[move.from];

    /* En passant capture */
    if (move.enPassant && piece.type === "pawn") {
      const dir = piece.color === "white" ? 1 : -1;
      next.board[move.to + dir * 8] = null;
    }

    next.board[move.to] = move.promotion ? { type: move.promotion, color: piece.color } : piece;
    next.board[move.from] = null;

    /* Castling rook */
    if (move.castle) {
      const homeRow = piece.color === "white" ? 7 : 0;
      if (move.castle === "K") {
        next.board[toIndex(homeRow, 5)] = next.board[toIndex(homeRow, 7)];
        next.board[toIndex(homeRow, 7)] = null;
      } else {
        next.board[toIndex(homeRow, 3)] = next.board[toIndex(homeRow, 0)];
        next.board[toIndex(homeRow, 0)] = null;
      }
    }

    /* Update castling rights */
    if (piece.type === "king") {
      if (piece.color === "white") { next.castling.K = false; next.castling.Q = false; }
      else { next.castling.k = false; next.castling.q = false; }
    }
    if (piece.type === "rook") {
      if (move.from === 56) next.castling.Q = false;
      else if (move.from === 63) next.castling.K = false;
      else if (move.from === 0) next.castling.q = false;
      else if (move.from === 7) next.castling.k = false;
    }
    if (move.to === 56) next.castling.Q = false;
    if (move.to === 63) next.castling.K = false;
    if (move.to === 0) next.castling.q = false;
    if (move.to === 7) next.castling.k = false;

    /* En passant target */
    if (piece.type === "pawn" && Math.abs(move.to - move.from) === 16) {
      next.enPassant = (move.from + move.to) / 2;
    } else {
      next.enPassant = null;
    }

    next.turn = piece.color === "white" ? "black" : "white";
    return next;
  }

  /* ───── check detection ───── */
  function isInCheck(board, color) {
    const kingIndex = board.findIndex((p) => p && p.type === "king" && p.color === color);
    if (kingIndex === -1) return false;
    const enemy = color === "white" ? "black" : "white";
    return board.some((p, i) => p && p.color === enemy && attacksSquare(board, i, kingIndex));
  }

  function isSquareAttacked(board, square, byColor) {
    /* Is `square` attacked by the opponent of `byColor`? */
    const enemy = byColor === "white" ? "black" : "white";
    return board.some((p, i) => p && p.color === enemy && attacksSquare(board, i, square));
  }

  function attacksSquare(board, from, target) {
    const piece = board[from];
    if (!piece) return false;
    const [row, col] = rowCol(from);
    const [targetRow, targetCol] = rowCol(target);

    if (piece.type === "pawn") {
      const dir = piece.color === "white" ? -1 : 1;
      return targetRow === row + dir && Math.abs(targetCol - col) === 1;
    }

    if (piece.type === "knight") {
      const dr = Math.abs(targetRow - row);
      const dc = Math.abs(targetCol - col);
      return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
    }

    if (piece.type === "king") {
      return Math.abs(targetRow - row) <= 1 && Math.abs(targetCol - col) <= 1;
    }

    /* Sliding pieces */
    const dirs = {
      bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
      rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
      queen: [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]],
    };
    const pieceDirs = dirs[piece.type];
    if (!pieceDirs) return false;

    for (const [dr, dc] of pieceDirs) {
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
        const idx = toIndex(r, c);
        if (idx === target) return true;
        if (board[idx]) break;
        r += dr;
        c += dc;
      }
    }
    return false;
  }

  /* ───── evaluation ───── */
  function evaluate(stateOrBoard) {
    const board = Array.isArray(stateOrBoard) ? stateOrBoard : stateOrBoard.board;
    let score = 0;
    board.forEach((piece, index) => {
      if (!piece) return;
      const center = 3.5 - (Math.abs(Math.floor(index / 8) - 3.5) + Math.abs(index % 8 - 3.5)) * 0.05;
      const sign = piece.color === "black" ? 1 : -1;
      score += sign * (values[piece.type] + center * 0.08);
    });
    if (isInCheck(board, "white")) score += 0.4;
    if (isInCheck(board, "black")) score -= 0.4;
    return score;
  }

  /* ───── FEN generation ───── */
  function toFEN(state) {
    /* 1. Piece placement */
    const rows = [];
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      let rowStr = "";
      for (let c = 0; c < 8; c++) {
        const p = state.board[toIndex(r, c)];
        if (!p) { empty++; continue; }
        if (empty) { rowStr += empty; empty = 0; }
        const letter = pieceToFENChar(p);
        rowStr += letter;
      }
      if (empty) rowStr += empty;
      rows.push(rowStr);
    }
    const placement = rows.join("/");

    /* 2. Active color */
    const active = state.turn === "white" ? "w" : "b";

    /* 3. Castling availability */
    let castling = "";
    if (state.castling.K) castling += "K";
    if (state.castling.Q) castling += "Q";
    if (state.castling.k) castling += "k";
    if (state.castling.q) castling += "q";
    if (!castling) castling = "-";

    /* 4. En passant target */
    let ep = "-";
    if (state.enPassant !== null) {
      const [epr, epc] = rowCol(state.enPassant);
      ep = "abcdefgh"[epc] + (8 - epr);
    }

    /* 5 & 6. Clocks */
    const halfMove = state.halfMoveClock || 0;
    const fullMove = state.fullMoveNumber || 1;

    return `${placement} ${active} ${castling} ${ep} ${halfMove} ${fullMove}`;
  }

  function pieceToFENChar(piece) {
    const map = { pawn: "p", knight: "n", bishop: "b", rook: "r", queen: "q", king: "k" };
    const c = map[piece.type];
    return piece.color === "white" ? c.toUpperCase() : c;
  }

  /* ───── UCI move parsing ───── */
  function parseUCIMove(uci, board) {
    /* e.g. "e2e4", "e7e8q" (promotion) */
    if (!uci || uci.length < 4) return null;
    const fromCol = uci.charCodeAt(0) - 97;
    const fromRow = 8 - parseInt(uci[1], 10);
    const toCol = uci.charCodeAt(2) - 97;
    const toRow = 8 - parseInt(uci[3], 10);
    const from = toIndex(fromRow, fromCol);
    const to = toIndex(toRow, toCol);

    let promotion = null;
    if (uci.length === 5) {
      const promoMap = { q: "queen", r: "rook", b: "bishop", n: "knight" };
      promotion = promoMap[uci[4]] || null;
    }

    /* Detect castling */
    let castle = null;
    const piece = board[from];
    if (piece && piece.type === "king" && Math.abs(toCol - fromCol) === 2) {
      castle = toCol > fromCol ? "K" : "Q";
    }

    /* Detect en passant */
    let enPassant = false;
    if (piece && piece.type === "pawn" && fromCol !== toCol && !board[to]) {
      enPassant = true;
    }

    return { from, to, promotion, castle, enPassant };
  }

  window.ChessGame = {
    values, symbols, rowCol, toIndex,
    legalMoves, allLegalMoves,
    applyMove, simulateMove,
    isInCheck, isSquareAttacked,
    evaluate, toFEN, parseUCIMove,
  };
})();
