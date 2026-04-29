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
        status: "playing",
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
