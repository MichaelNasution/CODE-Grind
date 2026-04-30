(function () {
  "use strict";

  function createBoard() {
    return Array.from({ length: 15 }, () => Array(15).fill(null));
  }

  function isEmpty(board) {
    return !board.flat().some(Boolean);
  }

  function canPlace(board, word, row, col, direction) {
    word = word.toUpperCase();
    if (direction === "horizontal" && col + word.length > 15) return false;
    if (direction === "vertical" && row + word.length > 15) return false;

    const boardEmpty = isEmpty(board);
    let touchesCenter = false;
    let touchesExisting = false;
    let needsNewTile = false;

    for (let i = 0; i < word.length; i++) {
      const r = row + (direction === "vertical" ? i : 0);
      const c = col + (direction === "horizontal" ? i : 0);
      const existing = board[r][c];

      if (existing) {
        // Existing tile must match the letter in the word
        if (existing.letter !== word[i]) return false;
        touchesExisting = true;
      } else {
        needsNewTile = true;
        // Check adjacency to existing tiles (perpendicular neighbors)
        if (hasAdjacentTile(board, r, c, direction)) touchesExisting = true;
      }

      if (r === 7 && c === 7) touchesCenter = true;
    }

    // Must place at least one new tile
    if (!needsNewTile) return false;

    // First word must cross center
    if (boardEmpty) return touchesCenter;

    // Subsequent words must connect to existing tiles
    return touchesExisting;
  }

  function hasAdjacentTile(board, row, col, direction) {
    // Check all 4 neighbors, but especially perpendicular ones
    const neighbors = [
      [row - 1, col], [row + 1, col],
      [row, col - 1], [row, col + 1]
    ];
    return neighbors.some(([r, c]) =>
      r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] !== null
    );
  }

  function place(board, tiles) {
    tiles.forEach((item) => { board[item.row][item.col] = item.tile; });
  }

  window.ScrabbleBoard = { createBoard, canPlace, place, isEmpty };
})();
