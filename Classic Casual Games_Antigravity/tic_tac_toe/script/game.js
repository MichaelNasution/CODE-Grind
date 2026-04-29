(function () {
  "use strict";

  const { wins } = window.TicTacToeState;

  function getEmptyIndexes(board) {
    return board.map((value, index) => (value ? null : index)).filter((index) => index !== null);
  }

  function getResult(board) {
    for (const combo of wins) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo };
      }
    }
    return board.every(Boolean) ? { winner: "draw", combo: [] } : null;
  }

  function applyMove(state, index, player) {
    state.board[index] = player;
    return getResult(state.board);
  }

  window.TicTacToeGame = {
    getEmptyIndexes,
    getResult,
    applyMove,
  };
})();
