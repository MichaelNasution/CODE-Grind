(function () {
  "use strict";

  /**
   * Build a placement object for a word.
   * The word string includes letters that may already exist on the board.
   * We only consume rack tiles for empty cells.
   */
  function buildPlacement(state, player, word, row, col, direction) {
    word = word.toUpperCase();
    const rack = [...state.racks[player]]; // shallow copy to simulate consumption
    const usedIds = [];
    const tiles = []; // only newly placed tiles

    for (let i = 0; i < word.length; i++) {
      const r = row + (direction === "vertical" ? i : 0);
      const c = col + (direction === "horizontal" ? i : 0);
      if (r < 0 || r >= 15 || c < 0 || c >= 15) return null;

      const existing = state.board[r][c];
      if (existing) {
        // Board already has a tile here – it must match the word letter
        if (existing.letter !== word[i]) return null;
        // Don't consume a rack tile; skip
        continue;
      }

      // Need a tile from rack
      const rackIndex = rack.findIndex((t) => t.letter === word[i] && !usedIds.includes(t.id));
      if (rackIndex < 0) return null;
      const tile = rack[rackIndex];
      usedIds.push(tile.id);
      tiles.push({ row: r, col: c, tile });
    }

    if (!tiles.length) return null; // must place at least one new tile
    return {
      word,
      tiles,
      usedIds,
      score: window.ScrabbleScoring.scorePlacement(tiles, state.board),
    };
  }

  function playWord(state, player, word, row, col, direction) {
    word = word.toUpperCase();
    if (word.length < 2) return { ok: false, reason: "Word must be at least 2 letters." };
    if (!window.ScrabbleDictionary.isValid(word)) return { ok: false, reason: "Word is not in the dictionary." };
    if (!window.ScrabbleBoard.canPlace(state.board, word, row, col, direction)) return { ok: false, reason: "That word does not fit or connect legally." };
    const placement = buildPlacement(state, player, word, row, col, direction);
    if (!placement) return { ok: false, reason: "Your rack does not contain the needed tiles." };
    window.ScrabbleBoard.place(state.board, placement.tiles);
    window.ScrabbleRack.removeTiles(state.racks[player], placement.usedIds);
    state.scores[player] += placement.score;
    window.ScrabbleRack.drawTiles(state, player);
    state.lastMove = { player, word, score: placement.score, tiles: placement.tiles };
    state.turn = player === "player" ? "ai" : "player";
    return { ok: true, placement };
  }

  window.ScrabbleGame = { buildPlacement, playWord };
})();
