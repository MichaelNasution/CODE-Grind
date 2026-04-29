(function () {
  "use strict";

  const { getEmptyIndexes, getResult } = window.TicTacToeGame;

  function chooseMove(board, difficulty) {
    if (difficulty === "easy") return randomMove(board);
    if (difficulty === "hard") return hardMove(board);
    return mediumMove(board);
  }

  function randomMove(board) {
    const empty = getEmptyIndexes(board);
    return empty[GameKit.randomInt(0, empty.length - 1)];
  }

  function immediateMove(board, player) {
    for (const index of getEmptyIndexes(board)) {
      const next = [...board];
      next[index] = player;
      const result = getResult(next);
      if (result?.winner === player) return index;
    }
    return undefined;
  }

  function mediumMove(board) {
    return immediateMove(board, "O")
      ?? (Math.random() < 0.82 ? immediateMove(board, "X") : undefined)
      ?? (!board[4] ? 4 : undefined)
      ?? randomMove(board);
  }

  function hardMove(board) {
    let bestScore = -Infinity;
    const bestMoves = [];

    for (const index of getEmptyIndexes(board)) {
      const next = [...board];
      next[index] = "O";
      const score = scoreBoard(next, 0, false, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMoves.length = 0;
        bestMoves.push(index);
      } else if (score === bestScore) {
        bestMoves.push(index);
      }
    }

    return bestMoves[GameKit.randomInt(0, bestMoves.length - 1)];
  }

  function scoreBoard(board, depth, isMaximizing, alpha, beta) {
    const result = getResult(board);
    if (result) {
      if (result.winner === "O") return 10 - depth;
      if (result.winner === "X") return depth - 10;
      return 0;
    }

    if (isMaximizing) {
      let best = -Infinity;
      for (const index of getEmptyIndexes(board)) {
        const next = [...board];
        next[index] = "O";
        best = Math.max(best, scoreBoard(next, depth + 1, false, alpha, beta));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }

    let best = Infinity;
    for (const index of getEmptyIndexes(board)) {
      const next = [...board];
      next[index] = "X";
      best = Math.min(best, scoreBoard(next, depth + 1, true, alpha, beta));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  window.TicTacToeAI = { chooseMove };
})();
