(function () {
  "use strict";

  function buildPlacement(state, player, word, row, col, direction) {
    word = word.toUpperCase();
    const rack = [...state.racks[player]];
    const usedIds = [];
    const tiles = [];

    for (let i = 0; i < word.length; i++) {
      const r = row + (direction === "vertical" ? i : 0);
      const c = col + (direction === "horizontal" ? i : 0);
      if (r < 0 || r >= 15 || c < 0 || c >= 15) return null;

      const existing = state.board[r][c];
      if (existing) {
        if (existing.letter !== word[i]) return null;
        continue;
      }

      // Need a tile from rack
      let rackIndex = rack.findIndex((t) => t.letter === word[i] && !usedIds.includes(t.id));
      if (rackIndex < 0) {
          // Try finding a blank
          rackIndex = rack.findIndex((t) => t.isBlank && !usedIds.includes(t.id));
      }
      if (rackIndex < 0) return null;
      
      const originalTile = rack[rackIndex];
      usedIds.push(originalTile.id);
      
      // If it's a blank, we create a copy assigned to the needed letter
      const tile = originalTile.isBlank ? { ...originalTile, letter: word[i] } : originalTile;
      tiles.push({ row: r, col: c, tile });
    }

    if (!tiles.length) return null;

    // Temporarily place to extract all words formed
    // Deep copy board is safer
    const tempBoard = state.board.map(row => [...row]);
    window.ScrabbleBoard.place(tempBoard, tiles);
    
    const formedWords = window.ScrabbleBoard.getWordsFormed(tempBoard, tiles, direction);
    
    // Validate all words
    const invalidWords = [];
    for (const fw of formedWords) {
        const text = fw.map(item => item.tile.letter).join("");
        if (!window.ScrabbleDictionary.isValid(text)) {
            invalidWords.push(text);
        }
    }
    
    return {
      word,
      tiles,
      usedIds,
      formedWords,
      invalidWords,
      score: invalidWords.length === 0 ? window.ScrabbleScoring.scorePlacement(formedWords, tiles.length) : 0,
    };
  }

  function playWord(state, player, word, row, col, direction) {
    word = word.toUpperCase();
    if (!window.ScrabbleBoard.canPlace(state.board, word, row, col, direction)) {
        return { ok: false, reason: "That word does not fit or connect legally." };
    }
    
    const placement = buildPlacement(state, player, word, row, col, direction);
    if (!placement) return { ok: false, reason: "Your rack does not contain the needed tiles." };
    if (placement.invalidWords.length > 0) {
        return { ok: false, reason: `Invalid dictionary word(s): ${placement.invalidWords.join(", ")}` };
    }

    window.ScrabbleBoard.place(state.board, placement.tiles);
    window.ScrabbleRack.removeTiles(state.racks[player], placement.usedIds);
    state.scores[player] += placement.score;
    window.ScrabbleRack.drawTiles(state, player);
    state.lastMove = { player, word, score: placement.score, tiles: placement.tiles };
    
    // End game logic
    if (state.bag.length === 0 && state.racks[player].length === 0) {
        state.turn = "gameover";
        // Deduct remaining tiles from opponent, add to winner
        const opponent = player === "player" ? "ai" : "player";
        let oppUnplayedScore = 0;
        state.racks[opponent].forEach(t => oppUnplayedScore += t.value);
        state.scores[player] += oppUnplayedScore;
        state.scores[opponent] -= oppUnplayedScore;
    } else {
        state.turn = player === "player" ? "ai" : "player";
    }
    
    return { ok: true, placement };
  }

  window.ScrabbleGame = { buildPlacement, playWord };
})();
