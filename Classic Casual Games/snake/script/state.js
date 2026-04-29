(function () {
  "use strict";

  window.SnakeState = {
    create() {
      return {
        size: 18,
        snake: [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 13, y: 9 },
        score: 0,
        speed: 1,
        status: "ready",
        mode: "solo",
        difficulty: "medium",
        loopId: null,
        best: GameKit.loadScore("snake", { best: 0 }).best,
      };
    },
  };
})();
