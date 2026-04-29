(function () {
  "use strict";

  function createBoard() {
    return Array.from({ length: 15 }, () => Array(15).fill(null));
  }

  function canPlace(board, word, row, col, direction) {
    if (direction === "horizontal" && col + word.length > 15) return false;
    if (direction === "vertical" && row + word.length > 15) return false;
    let touches = board.flat().some(Boolean) ? false : row === 7 && col <= 7 && (direction === "horizontal" ? col + word.length > 7 : row + word.length > 7);
    for (let index = 0; index < word.length; index += 1) {
      const r = row + (direction === "vertical" ? index : 0);
      const c = col + (direction === "horizontal" ? index : 0);
      const existing = board[r][c];
      if (existing && existing.letter !== word[index]) return false;
      if (existing || neighbors(board, r, c).some(Boolean)) touches = true;
    }
    return touches;
  }

  function place(board, tiles) {
    tiles.forEach((item) => { board[item.row][item.col] = item.tile; });
  }

  function neighbors(board, row, col) {
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dr, dc]) => board[row + dr]?.[col + dc]).filter(Boolean);
  }

  window.ScrabbleBoard = { createBoard, canPlace, place };
})();
