(function () {
  "use strict";

  window.ChessState = {
    create() {
      return {
        board: initialBoard(),
        turn: "white",
        mode: "ai",
        difficulty: "medium",
        selected: null,
        legalMoves: [],
        lastMove: null,
        captured: { white: [], black: [] },
        status: "playing",
        /* Castling rights — true until king or corresponding rook moves */
        castling: { K: true, Q: true, k: true, q: true },
        /* En passant target square index (null if none) */
        enPassant: null,
        halfMoveClock: 0,
        fullMoveNumber: 1,
        /* Stockfish engine state */
        engineLoading: false,
        engineReady: false,
      };
    },
  };

  function initialBoard() {
    const back = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
    const board = Array(64).fill(null);
    back.forEach((type, file) => {
      board[file] = { type, color: "black" };
      board[8 + file] = { type: "pawn", color: "black" };
      board[48 + file] = { type: "pawn", color: "white" };
      board[56 + file] = { type, color: "white" };
    });
    return board;
  }
})();
