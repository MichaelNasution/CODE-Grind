(function () {
  "use strict";

  window.MinesweeperState = {
    create() {
      return {
        rows: 10,
        cols: 10,
        mines: 14,
        board: [],
        revealed: 0,
        flags: 0,
        status: "ready",
        mode: "solo",
        difficulty: "medium",
        seconds: 0,
        timerId: null,
        best: GameKit.loadScore("minesweeper", { best: null }).best,
      };
    },
  };
})();
