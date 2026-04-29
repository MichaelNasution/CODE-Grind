(function () {
  "use strict";

  const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 };
  const symbols = {
    white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
    black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
  };

  function legalMoves(state, from) {
    const piece = state.board[from];
    if (!piece) return [];
    return pseudoMoves(state.board, from).filter((move) => {
      const board = applyMoveToBoard(state.board, { from, to: move.to, promotion: move.promotion });
      return !isInCheck(board, piece.color);
    });
  }

  function allLegalMoves(state, color = state.turn) {
    const moves = [];
    state.board.forEach((piece, index) => {
      if (piece?.color === color) legalMoves({ ...state, turn: color }, index).forEach((move) => moves.push({ from: index, ...move }));
    });
    return moves;
  }

  function pseudoMoves(board, from) {
    const piece = board[from];
    if (!piece) return [];
    const moves = [];
    const row = Math.floor(from / 8);
    const col = from % 8;
    const add = (r, c, promotion = null) => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const to = r * 8 + c;
      if (board[to]?.color === piece.color) return false;
      moves.push({ to, promotion });
      return !board[to];
    };

    if (piece.type === "pawn") {
      const dir = piece.color === "white" ? -1 : 1;
      const start = piece.color === "white" ? 6 : 1;
      const next = from + dir * 8;
      if (!board[next]) {
        add(row + dir, col, row + dir === 0 || row + dir === 7 ? "queen" : null);
        if (row === start && !board[from + dir * 16]) add(row + dir * 2, col);
      }
      [-1, 1].forEach((dc) => {
        const target = (row + dir) * 8 + col + dc;
        if (col + dc >= 0 && col + dc < 8 && board[target] && board[target].color !== piece.color) add(row + dir, col + dc, row + dir === 0 || row + dir === 7 ? "queen" : null);
      });
    }

    if (piece.type === "knight") {
      [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(([dr, dc]) => add(row + dr, col + dc));
    }

    if (piece.type === "king") {
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) if (dr || dc) add(row + dr, col + dc);
    }

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

  function applyMove(state, move) {
    const piece = state.board[move.from];
    const captured = state.board[move.to];
    if (captured && state.captured) state.captured[piece.color].push(captured);
    state.board = applyMoveToBoard(state.board, move);
    state.lastMove = move;
    state.turn = piece.color === "white" ? "black" : "white";
    const nextMoves = allLegalMoves(state, state.turn);
    if (!nextMoves.length) state.status = isInCheck(state.board, state.turn) ? "checkmate" : "stalemate";
    else state.status = isInCheck(state.board, state.turn) ? "check" : "playing";
  }

  function applyMoveToBoard(board, move) {
    const copy = board.map((piece) => piece ? { ...piece } : null);
    const piece = copy[move.from];
    copy[move.to] = move.promotion ? { ...piece, type: move.promotion } : piece;
    copy[move.from] = null;
    return copy;
  }

  function isInCheck(board, color) {
    const kingIndex = board.findIndex((piece) => piece?.type === "king" && piece.color === color);
    const enemy = color === "white" ? "black" : "white";
    return board.some((piece, index) => piece?.color === enemy && attacksSquare(board, index, kingIndex));
  }

  function attacksSquare(board, from, target) {
    const piece = board[from];
    const row = Math.floor(from / 8);
    const col = from % 8;
    const targetRow = Math.floor(target / 8);
    const targetCol = target % 8;

    if (piece.type === "pawn") {
      const dir = piece.color === "white" ? -1 : 1;
      return targetRow === row + dir && Math.abs(targetCol - col) === 1;
    }

    return pseudoMoves(board, from).some((move) => move.to === target);
  }

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

  window.ChessGame = { values, symbols, legalMoves, allLegalMoves, applyMove, applyMoveToBoard, isInCheck, evaluate };
})();
