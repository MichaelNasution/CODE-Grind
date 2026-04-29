(function () {
  "use strict";

  window.SolitaireState = {
    create() {
      return {
        stock: [],
        waste: [],
        foundations: { hearts: [], diamonds: [], clubs: [], spades: [] },
        tableau: Array.from({ length: 7 }, () => []),
        score: 0,
        moves: 0,
        mode: "solo",
        difficulty: "medium",
        best: GameKit.loadScore("solitaire", { best: 0 }).best,
      };
    },
  };
})();
