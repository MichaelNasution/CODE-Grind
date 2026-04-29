(function () {
  "use strict";

  const fallbackScores = { X: 0, O: 0, draw: 0 };

  window.TicTacToeState = {
    wins: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ],
    create() {
      return {
        board: Array(9).fill(""),
        scores: GameKit.loadScore("ticTacToe", fallbackScores),
        currentPlayer: "X",
        starter: "X",
        mode: "ai",
        aiDifficulty: "medium",
        roundOver: false,
        aiThinking: false,
        aiMoveToken: 0,
      };
    },
    fallbackScores,
  };
})();
