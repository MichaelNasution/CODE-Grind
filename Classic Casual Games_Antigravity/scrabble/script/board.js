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

  function getWordsFormed(board, newTiles, primaryDirection) {
    const words = [];
    
    function extractWord(r, c, dr, dc) {
        let startR = r, startC = c;
        while (startR - dr >= 0 && startC - dc >= 0 && board[startR - dr][startC - dc]) {
            startR -= dr;
            startC -= dc;
        }
        
        const letters = [];
        let currR = startR, currC = startC;
        while (currR < 15 && currC < 15 && board[currR][currC]) {
            const isNew = newTiles.some(t => t.row === currR && t.col === currC);
            letters.push({ row: currR, col: currC, tile: board[currR][currC], isNew });
            currR += dr;
            currC += dc;
        }
        return letters;
    }

    if (newTiles.length > 0) {
        const first = newTiles[0];
        const dr = primaryDirection === "vertical" ? 1 : 0;
        const dc = primaryDirection === "horizontal" ? 1 : 0;
        
        const primary = extractWord(first.row, first.col, dr, dc);
        if (primary.length > 1 || newTiles.length === 1) {
            words.push(primary);
        }

        const crossDr = primaryDirection === "horizontal" ? 1 : 0;
        const crossDc = primaryDirection === "vertical" ? 1 : 0;
        
        for (const nt of newTiles) {
            const cross = extractWord(nt.row, nt.col, crossDr, crossDc);
            if (cross.length > 1) {
                words.push(cross);
            }
        }
    }
    
    // Deduplicate words based on stringified coordinates to prevent issues with single tile placements
    const uniqueWords = [];
    const seen = new Set();
    for (const w of words) {
       if (w.length === 0) continue;
       const key = `${w[0].row},${w[0].col}-${w[w.length-1].row},${w[w.length-1].col}`;
       if (!seen.has(key)) {
           seen.add(key);
           uniqueWords.push(w);
       }
    }
    
    return uniqueWords;
  }

  window.ScrabbleBoard = { createBoard, canPlace, place, isEmpty, getWordsFormed };
})();
