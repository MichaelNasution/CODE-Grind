(function () {
  "use strict";

  function chooseTile(state) {
    const hidden = state.board.map((tile) => tile.index).filter((index) => {
      const tile = state.board[index];
      return !tile.revealed && !tile.flagged;
    });
    if (!hidden.length) return undefined;
    if (state.difficulty === "easy") return hidden[GameKit.randomInt(0, hidden.length - 1)];

    const safe = findSafeByNeighborCounts(state);
    if (safe !== undefined) return safe;
    if (state.difficulty === "hard") return lowestRiskTile(state, hidden);
    return hidden[GameKit.randomInt(0, hidden.length - 1)];
  }

  function findSafeByNeighborCounts(state) {
    for (const tile of state.board.filter((item) => item.revealed && item.count > 0)) {
      const neighbors = window.MinesweeperGame.neighbors(state, tile.index);
      const flagged = neighbors.filter((index) => state.board[index].flagged).length;
      const hidden = neighbors.filter((index) => !state.board[index].revealed && !state.board[index].flagged);
      if (flagged === tile.count && hidden.length) return hidden[0];
    }
    return undefined;
  }

  function lowestRiskTile(state, hidden) {
    let best = hidden[0];
    let bestRisk = Infinity;
    hidden.forEach((index) => {
      const visibleNeighbors = window.MinesweeperGame.neighbors(state, index).filter((next) => state.board[next].revealed);
      const risk = visibleNeighbors.reduce((sum, next) => sum + state.board[next].count, 0) / Math.max(1, visibleNeighbors.length);
      if (risk < bestRisk) {
        bestRisk = risk;
        best = index;
      }
    });
    return best;
  }

  window.MinesweeperAI = { chooseTile };
})();
