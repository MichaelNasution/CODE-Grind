(function () {
  "use strict";

  let state = window.ScrabbleState.create();
  const boardEl = GameKit.qs("#board");
  const rackEl = GameKit.qs("#rack");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");
  const turnLabel = GameKit.qs("#turn-label");
  const wordPreview = GameKit.qs("#word-preview");
  const selectedScore = GameKit.qs("#selected-score");
  const lastPlay = GameKit.qs("#last-play");
  const rackCount = GameKit.qs("#rack-count");
  const playerCard = GameKit.qs("#player-card");
  const aiCard = GameKit.qs("#ai-card");
  const submitBtn = GameKit.qs("#submit-word");
  const aiMoveBtn = GameKit.qs("#ai-move");

  // The typed word input buffer
  let typedWord = "";
  let locked = false; // prevent input during AI turn animation

  boot();

  function boot() {
    wireControls();
    wireKeyboard();
    render();
  }

  /* ── Controls ────────────────────────────────────────────── */

  function wireControls() {
    GameKit.qs("#new-game").addEventListener("click", () => {
      const mode = state.mode;
      const difficulty = state.difficulty;
      state = window.ScrabbleState.create();
      state.mode = mode;
      state.difficulty = difficulty;
      typedWord = "";
      locked = false;
      statusTitle.textContent = "Ready";
      statusCopy.textContent = "Type a word, click a starting cell, choose direction, then Play.";
      render();
    });

    submitBtn.addEventListener("click", submitWord);
    aiMoveBtn.addEventListener("click", () => {
      if (locked) return;
      playAiMove();
    });

    GameKit.qs("#clear-word").addEventListener("click", () => {
      typedWord = "";
      state.selectedRackIds = [];
      render();
    });

    GameKit.qsa("[data-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      GameKit.setPressed(GameKit.qsa("[data-mode]"), state.mode, "mode");
      render();
    }));
    GameKit.qsa("[data-difficulty]").forEach((button) => button.addEventListener("click", () => {
      state.difficulty = button.dataset.difficulty;
      GameKit.setPressed(GameKit.qsa("[data-difficulty]"), state.difficulty, "difficulty");
    }));
    GameKit.qsa("[data-direction]").forEach((button) => button.addEventListener("click", () => {
      state.direction = button.dataset.direction;
      GameKit.setPressed(GameKit.qsa("[data-direction]"), state.direction, "direction");
      render();
    }));
  }

  /* ── Keyboard input for word typing ─────────────────────── */

  function wireKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (locked) return;
      // Don't capture when an actual input/textarea is focused
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "Enter") {
        e.preventDefault();
        submitWord();
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        typedWord = typedWord.slice(0, -1);
        syncRackSelection();
        render();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        typedWord = "";
        state.selectedRackIds = [];
        render();
        return;
      }

      // Letter keys
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        typedWord += letter;
        syncRackSelection();
        render();
      }
    });
  }

  /**
   * Sync selectedRackIds to match the typedWord from left to right.
   * This ensures the rack highlights the tiles that would be used.
   */
  function syncRackSelection() {
    const ids = [];
    const used = new Set();
    for (const ch of typedWord) {
      const tile = state.racks.player.find((t) => t.letter === ch && !used.has(t.id));
      if (tile) {
        ids.push(tile.id);
        used.add(tile.id);
      }
      // If tile not found in rack, we still keep the typed letter
      // (it might come from the board)
    }
    state.selectedRackIds = ids;
  }

  /* ── Render ──────────────────────────────────────────────── */

  function render() {
    renderBoard();
    renderRack();
    renderWordInput();
    GameKit.qs("#player-score").textContent = state.scores.player;
    GameKit.qs("#ai-score").textContent = state.scores.ai;
    GameKit.qs("#bag-count").textContent = state.bag.length;
    playerCard.classList.toggle("active", state.turn === "player");
    aiCard.classList.toggle("active", state.turn === "ai");
    turnLabel.textContent = state.turn === "player" ? "Your turn" : "AI turn";
    lastPlay.textContent = state.lastMove
      ? `${state.lastMove.player === "player" ? "You" : "AI"} played ${state.lastMove.word} for ${state.lastMove.score}`
      : "No words played";

    // Disable/enable buttons based on turn
    submitBtn.disabled = locked || state.turn !== "player";
    aiMoveBtn.disabled = locked;
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    const preview = previewCells();
    const previewKeys = new Set(preview.map((item) => `${item.row},${item.col}`));
    const lastKeys = new Set((state.lastMove?.tiles || []).map((item) => `${item.row},${item.col}`));
    for (let row = 0; row < 15; row += 1) {
      for (let col = 0; col < 15; col += 1) {
        const cell = document.createElement("button");
        const bonus = window.ScrabbleScoring.bonus[`${row},${col}`];
        const tile = state.board[row][col];
        const previewTile = preview.find((item) => item.row === row && item.col === col);
        cell.className = `scrabble-cell ${bonus ? `bonus-${bonus}` : ""}`;
        cell.classList.toggle("filled", Boolean(tile));
        cell.classList.toggle("preview", Boolean(previewTile) && !tile);
        cell.classList.toggle("last-move", lastKeys.has(`${row},${col}`));
        cell.classList.toggle("selected", state.selectedCell.row === row && state.selectedCell.col === col);
        cell.innerHTML = tile
          ? tileMarkup(tile)
          : previewTile
            ? tileMarkup(previewTile.tile, "ghost")
            : bonusMarkup(bonus);
        cell.addEventListener("click", () => {
          state.selectedCell = { row, col };
          render();
        });
        boardEl.appendChild(cell);
      }
    }
  }

  function renderRack() {
    rackEl.innerHTML = "";
    state.racks.player.forEach((tile) => {
      const button = document.createElement("button");
      button.className = "rack-tile";
      button.classList.toggle("selected", state.selectedRackIds.includes(tile.id));
      button.innerHTML = tileMarkup(tile);
      button.addEventListener("click", () => {
        if (locked) return;
        // Clicking rack tile appends/removes the letter from typedWord
        if (state.selectedRackIds.includes(tile.id)) {
          // Remove first occurrence of this letter from typed word
          const idx = typedWord.indexOf(tile.letter);
          if (idx >= 0) typedWord = typedWord.slice(0, idx) + typedWord.slice(idx + 1);
        } else {
          typedWord += tile.letter;
        }
        syncRackSelection();
        render();
      });
      rackEl.appendChild(button);
    });
    rackCount.textContent = `${state.racks.player.length} tile${state.racks.player.length === 1 ? "" : "s"}`;
  }

  function renderWordInput() {
    const display = typedWord || "-";
    wordPreview.textContent = display;

    if (typedWord.length >= 2) {
      const placement = window.ScrabbleGame.buildPlacement(
        state, "player", typedWord,
        state.selectedCell.row, state.selectedCell.col, state.direction
      );
      selectedScore.textContent = placement ? `${placement.score} pts` : "0 pts";
    } else {
      selectedScore.textContent = "0 pts";
    }
  }

  /* ── Preview ghost tiles on the board ───────────────────── */

  function previewCells() {
    if (!typedWord) return [];
    const word = typedWord.toUpperCase();
    const result = [];
    const usedIds = new Set();
    for (let i = 0; i < word.length; i++) {
      const r = state.selectedCell.row + (state.direction === "vertical" ? i : 0);
      const c = state.selectedCell.col + (state.direction === "horizontal" ? i : 0);
      if (r < 0 || r >= 15 || c < 0 || c >= 15) continue;
      const existing = state.board[r][c];
      if (existing) continue; // Don't ghost-preview existing tiles
      const tile = state.racks.player.find((t) => t.letter === word[i] && !usedIds.has(t.id));
      if (tile) {
        usedIds.add(tile.id);
        result.push({ row: r, col: c, tile });
      }
    }
    return result;
  }

  /* ── Submit word ─────────────────────────────────────────── */

  function submitWord() {
    if (locked) return;
    if (state.turn !== "player") {
      statusTitle.textContent = "Not your turn";
      statusCopy.textContent = "Wait for the AI to finish.";
      return;
    }
    if (!typedWord || typedWord.length < 2) {
      statusTitle.textContent = "Type a word";
      statusCopy.textContent = "Type letters on your keyboard, or click rack tiles, then press Enter or Play Word.";
      GameKit.playLose();
      return;
    }

    const word = typedWord.toUpperCase();
    const result = window.ScrabbleGame.playWord(
      state, "player", word,
      state.selectedCell.row, state.selectedCell.col, state.direction
    );

    if (result.ok) {
      statusTitle.textContent = `Played ${word}`;
      statusCopy.textContent = `Scored ${result.placement.score} points!`;
      typedWord = "";
      state.selectedRackIds = [];
      GameKit.playClick();
      render();
      if (state.mode === "ai") {
        locked = true;
        render(); // update disabled states
        window.setTimeout(() => {
          playAiMove();
          locked = false;
          render();
        }, 600);
      }
    } else {
      statusTitle.textContent = "Invalid move";
      statusCopy.textContent = result.reason;
      GameKit.playLose();
      render();
    }
  }

  /* ── AI move ─────────────────────────────────────────────── */

  function playAiMove() {
    const move = window.ScrabbleAI.chooseMove(state);
    if (!move) {
      statusTitle.textContent = "AI passed";
      statusCopy.textContent = "No dictionary word can be placed from the current rack.";
      // Turn goes back to player
      state.turn = "player";
      render();
      return;
    }
    const result = window.ScrabbleGame.playWord(state, "ai", move.word, move.row, move.col, move.direction);
    if (result.ok) {
      statusTitle.textContent = `AI played ${move.word}`;
      statusCopy.textContent = `AI scored ${result.placement.score} points.`;
    } else {
      statusTitle.textContent = "AI passed";
      statusCopy.textContent = "AI could not place a valid word.";
      state.turn = "player";
    }
    GameKit.playClick();
    render();
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  function tileMarkup(tile, extraClass = "") {
    return `<span class="tile-face ${extraClass}"><span class="tile-letter">${tile.letter}</span><span class="tile-value">${tile.value}</span></span>`;
  }

  function bonusMarkup(bonus) {
    if (!bonus) return "";
    return `<span class="bonus-label">${bonus.toUpperCase()}</span>`;
  }
})();
