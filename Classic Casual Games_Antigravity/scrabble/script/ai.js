(function () {
  "use strict";

  function chooseMove(state) {
    const rackLetters = state.racks.ai.map((tile) => tile.letter);
    const candidateWords = window.ScrabbleDictionary.fromRack(rackLetters);
    const placements = [];
    candidateWords.forEach((word) => {
      for (let row = 0; row < 15; row += 1) {
        for (let col = 0; col < 15; col += 1) {
          ["horizontal", "vertical"].forEach((direction) => {
            if (!window.ScrabbleBoard.canPlace(state.board, word, row, col, direction)) return;
            const placement = window.ScrabbleGame.buildPlacement(state, "ai", word, row, col, direction);
            if (placement) placements.push({ ...placement, row, col, direction });
          });
        }
      }
    });
    if (!placements.length) return null;
    if (state.difficulty === "easy") return placements[GameKit.randomInt(0, placements.length - 1)];
    placements.sort((a, b) => rank(state, b) - rank(state, a));
    return state.difficulty === "medium" ? placements[0] : placements.find((move) => move.word.length >= 4) || placements[0];
  }

  function rank(state, move) {
    const coverage = move.tiles.length * 1.5;
    const bonusUse = move.tiles.some((tile) => window.ScrabbleScoring.bonus[`${tile.row},${tile.col}`]) ? 6 : 0;
    const blocking = move.tiles.some((tile) => tile.row === 7 || tile.col === 7) ? 2 : 0;
    return move.score + coverage + bonusUse + blocking;
  }

  window.ScrabbleAI = { chooseMove };
})();
