(function () {
  "use strict";

  function createBoard(state, safeIndex = -1) {
    const total = state.rows * state.cols;
    const mineIndexes = new Set();
    while (mineIndexes.size < state.mines) {
      const index = GameKit.randomInt(0, total - 1);
      if (index !== safeIndex) mineIndexes.add(index);
    }

    state.board = Array.from({ length: total }, (_, index) => ({
      index,
      mine: mineIndexes.has(index),
      revealed: false,
      flagged: false,
      count: 0,
    }));

    state.board.forEach((tile) => {
      tile.count = neighbors(state, tile.index).filter((neighbor) => state.board[neighbor].mine).length;
    });
  }

  function neighbors(state, index) {
    const row = Math.floor(index / state.cols);
    const col = index % state.cols;
    const result = [];
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (!dr && !dc) continue;
        const nextRow = row + dr;
        const nextCol = col + dc;
        if (nextRow >= 0 && nextRow < state.rows && nextCol >= 0 && nextCol < state.cols) {
          result.push(nextRow * state.cols + nextCol);
        }
      }
    }
    return result;
  }

  function reveal(state, index) {
    if (!state.board.length) createBoard(state, index);
    if (state.status === "ready" && state.board[index].mine) createBoard(state, index);
    const tile = state.board[index];
    if (!tile || tile.revealed || tile.flagged || state.status === "lost" || state.status === "won") return [];

    const changed = [];
    const queue = [index];
    while (queue.length) {
      const current = state.board[queue.shift()];
      if (current.revealed || current.flagged) continue;
      current.revealed = true;
      state.revealed += 1;
      changed.push(current.index);
      if (current.mine) {
        state.status = "lost";
        break;
      }
      if (current.count === 0) {
        neighbors(state, current.index).forEach((next) => {
          const neighbor = state.board[next];
          if (!neighbor.revealed && !neighbor.flagged && !neighbor.mine) queue.push(next);
        });
      }
    }

    if (state.status !== "lost" && state.revealed === state.rows * state.cols - state.mines) {
      state.status = "won";
    }

    return changed;
  }

  function toggleFlag(state, index) {
    const tile = state.board[index];
    if (!tile || tile.revealed || state.status === "lost" || state.status === "won") return;
    tile.flagged = !tile.flagged;
    state.flags += tile.flagged ? 1 : -1;
  }

  window.MinesweeperGame = { createBoard, neighbors, reveal, toggleFlag };
})();
