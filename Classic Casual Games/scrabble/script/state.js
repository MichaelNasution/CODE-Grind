(function () {
  "use strict";

  window.ScrabbleState = {
    create() {
      const state = {
        board: window.ScrabbleBoard.createBoard(),
        bag: window.ScrabbleTile.createBag(),
        racks: { player: [], ai: [] },
        scores: { player: 0, ai: 0 },
        mode: "ai",
        difficulty: "medium",
        direction: "horizontal",
        selectedRackIds: [],
        selectedCell: { row: 7, col: 7 },
        lastMove: null,
        turn: "player",
      };
      window.ScrabbleRack.drawTiles(state, "player");
      window.ScrabbleRack.drawTiles(state, "ai");
      return state;
    },
  };
})();
