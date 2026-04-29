(function () {
  "use strict";

  function buildPlacement(state, player, word, row, col, direction) {
    const rack = state.racks[player];
    const usedIds = [];
    const tiles = [];
    for (let index = 0; index < word.length; index += 1) {
      const r = row + (direction === "vertical" ? index : 0);
      const c = col + (direction === "horizontal" ? index : 0);
      if (r < 0 || r >= 15 || c < 0 || c >= 15) return null;
      const existing = state.board[r][c];
      if (existing) continue;
      const tile = rack.find((item) => item.letter === word[index] && !usedIds.includes(item.id));
      if (!tile) return null;
      usedIds.push(tile.id);
      tiles.push({ row: r, col: c, tile });
    }
    if (!tiles.length) return null;
    return { word, tiles, usedIds, score: window.ScrabbleScoring.scorePlacement(tiles, state.board) };
  }

  function playWord(state, player, word, row, col, direction) {
    word = word.toUpperCase();
    if (!window.ScrabbleDictionary.isValid(word)) return { ok: false, reason: "Word is not in the platform dictionary." };
    if (!window.ScrabbleBoard.canPlace(state.board, word, row, col, direction)) return { ok: false, reason: "That word does not fit or connect legally." };
    const placement = buildPlacement(state, player, word, row, col, direction);
    if (!placement) return { ok: false, reason: "Your rack does not contain the needed tiles." };
    window.ScrabbleBoard.place(state.board, placement.tiles);
    window.ScrabbleRack.removeTiles(state.racks[player], placement.usedIds);
    state.scores[player] += placement.score;
    window.ScrabbleRack.drawTiles(state, player);
    state.lastMove = { player, word, score: placement.score, tiles: placement.tiles };
    state.turn = state.turn === "player" ? "ai" : "player";
    return { ok: true, placement };
  }

  window.ScrabbleGame = { buildPlacement, playWord };
})();
