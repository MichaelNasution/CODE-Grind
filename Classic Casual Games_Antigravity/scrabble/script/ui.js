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

  let locked = false; // prevent input during AI turn animation

  // Drag and drop state
  let draggedTileId = null;
  let draggedFrom = null; // "rack" or { row, col }

  boot();

  function boot() {
    statusTitle.textContent = "Loading dictionary…";
    statusCopy.textContent = "Downloading 149,000+ word Scrabble dictionary.";
    locked = true;
    window.ScrabbleDictionary.load().then(() => {
      locked = false;
      statusTitle.textContent = "Ready";
      statusCopy.textContent = "Drag tiles to the board, or type to place them. Then Play Word.";
      wireControls();
      wireKeyboard();
      render();
    });
  }

  /* ── Controls ────────────────────────────────────────────── */

  function wireControls() {
    GameKit.qs("#new-game").addEventListener("click", () => {
      const mode = state.mode;
      const difficulty = state.difficulty;
      state = window.ScrabbleState.create();
      state.mode = mode;
      state.difficulty = difficulty;
      locked = false;
      draggedTileId = null;
      draggedFrom = null;
      statusTitle.textContent = "Ready";
      statusCopy.textContent = "Drag tiles to the board, or type to place them. Then Play Word.";
      render();
    });

    submitBtn.addEventListener("click", submitWord);
    aiMoveBtn.addEventListener("click", () => {
      if (locked) return;
      playAiMove();
    });

    GameKit.qs("#clear-word").addEventListener("click", () => {
      clearStaging();
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

    // Rack drop zone (to return tiles from board)
    const rackPanel = GameKit.qs(".rack-panel");
    rackPanel.addEventListener("dragover", (e) => {
      if (locked || state.turn !== "player") return;
      e.preventDefault();
    });
    rackPanel.addEventListener("drop", (e) => {
      if (locked || state.turn !== "player") return;
      e.preventDefault();
      if (draggedFrom !== "rack" && draggedTileId) {
        const stageIdx = state.staging.findIndex((st) => st.tile.id === draggedTileId);
        if (stageIdx >= 0) {
          const st = state.staging.splice(stageIdx, 1)[0];
          state.racks.player.push(st.tile);
          render();
        }
      }
      draggedTileId = null;
      draggedFrom = null;
    });
  }

  function clearStaging() {
    while (state.staging.length > 0) {
      const st = state.staging.pop();
      state.racks.player.push(st.tile);
    }
  }

  /* ── Keyboard input for word typing ─────────────────────── */

  function wireKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (locked || state.turn !== "player") return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "Enter") {
        e.preventDefault();
        submitWord();
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        if (state.staging.length > 0) {
          // Remove the most recently placed tile (last in array)
          const st = state.staging.pop();
          state.racks.player.push(st.tile);
          render();
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        clearStaging();
        render();
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        const tileIndex = state.racks.player.findIndex((t) => t.letter === letter);
        if (tileIndex >= 0) {
          // Find next available cell
          let r = state.selectedCell.row;
          let c = state.selectedCell.col;
          
          // Advance past existing tiles on board and staging
          while (r < 15 && c < 15 && (state.board[r][c] || state.staging.some((st) => st.row === r && st.col === c))) {
            if (state.direction === "horizontal") c++;
            else r++;
          }
          
          if (r < 15 && c < 15) {
            const tile = state.racks.player.splice(tileIndex, 1)[0];
            state.staging.push({ row: r, col: c, tile });
            render();
          }
        }
      }
    });
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

    submitBtn.disabled = locked || state.turn !== "player";
    aiMoveBtn.disabled = locked;
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    const lastKeys = new Set((state.lastMove?.tiles || []).map((item) => `${item.row},${item.col}`));

    for (let row = 0; row < 15; row += 1) {
      for (let col = 0; col < 15; col += 1) {
        const cell = document.createElement("div");
        const bonus = window.ScrabbleScoring.bonus[`${row},${col}`];
        const tile = state.board[row][col];
        const staged = state.staging.find((st) => st.row === row && st.col === col);

        cell.className = `scrabble-cell ${bonus ? `bonus-${bonus}` : ""}`;
        cell.classList.toggle("filled", Boolean(tile));
        cell.classList.toggle("last-move", lastKeys.has(`${row},${col}`));
        cell.classList.toggle("selected", state.selectedCell.row === row && state.selectedCell.col === col);
        
        if (staged) {
          cell.classList.add("staged");
          const tileEl = document.createElement("div");
          tileEl.innerHTML = tileMarkup(staged.tile);
          tileEl.draggable = true;
          tileEl.addEventListener("dragstart", (e) => handleDragStart(e, { row, col }, staged.tile.id));
          tileEl.addEventListener("click", (e) => {
             e.stopPropagation();
             if (locked || state.turn !== "player") return;
             // Click to return to rack
             const stageIdx = state.staging.findIndex((st) => st.tile.id === staged.tile.id);
             if (stageIdx >= 0) {
               const st = state.staging.splice(stageIdx, 1)[0];
               state.racks.player.push(st.tile);
               render();
             }
          });
          cell.appendChild(tileEl.firstElementChild);
        } else if (tile) {
          cell.innerHTML = tileMarkup(tile);
        } else {
          cell.innerHTML = bonusMarkup(bonus);
        }

        // Drag and drop events for the cell
        cell.addEventListener("dragover", (e) => {
          if (locked || state.turn !== "player") return;
          e.preventDefault(); // Necessary to allow dropping
          if (!tile && !staged) cell.classList.add("drag-over");
        });
        cell.addEventListener("dragleave", () => cell.classList.remove("drag-over"));
        cell.addEventListener("drop", (e) => {
          cell.classList.remove("drag-over");
          handleDrop(e, row, col);
        });

        // Click to select cell
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
      button.draggable = true;
      button.innerHTML = tileMarkup(tile);
      
      button.addEventListener("dragstart", (e) => handleDragStart(e, "rack", tile.id));
      
      button.addEventListener("click", () => {
        if (locked || state.turn !== "player") return;
        
        // Find next available cell to act like typing
        let r = state.selectedCell.row;
        let c = state.selectedCell.col;
        while (r < 15 && c < 15 && (state.board[r][c] || state.staging.some((st) => st.row === r && st.col === c))) {
          if (state.direction === "horizontal") c++;
          else r++;
        }
        
        if (r < 15 && c < 15) {
          const idx = state.racks.player.findIndex((t) => t.id === tile.id);
          const t = state.racks.player.splice(idx, 1)[0];
          state.staging.push({ row: r, col: c, tile: t });
          render();
        }
      });
      rackEl.appendChild(button);
    });
    rackCount.textContent = `${state.racks.player.length} tile${state.racks.player.length === 1 ? "" : "s"}`;
  }

  function handleDragStart(e, source, tileId) {
    if (locked || state.turn !== "player") {
      e.preventDefault();
      return;
    }
    draggedTileId = tileId;
    draggedFrom = source;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tileId);
  }

  function handleDrop(e, targetRow, targetCol) {
    e.preventDefault();
    if (locked || state.turn !== "player") return;
    
    const tileId = draggedTileId;
    if (!tileId) return;

    // Check if target is empty
    if (state.board[targetRow][targetCol]) return; // Occupied by permanent tile
    const existingStaged = state.staging.findIndex((st) => st.row === targetRow && st.col === targetCol);
    
    // If target has a staged tile, we could swap. For simplicity, we just prevent drop if occupied.
    if (existingStaged >= 0 && (draggedFrom === "rack" || draggedFrom.row !== targetRow || draggedFrom.col !== targetCol)) {
       return; 
    }

    if (draggedFrom === "rack") {
       const rackIdx = state.racks.player.findIndex((t) => t.id === tileId);
       if (rackIdx >= 0) {
          const tile = state.racks.player.splice(rackIdx, 1)[0];
          state.staging.push({ row: targetRow, col: targetCol, tile });
       }
    } else {
       // Coming from staging
       const stageIdx = state.staging.findIndex((st) => st.tile.id === tileId);
       if (stageIdx >= 0) {
          state.staging[stageIdx].row = targetRow;
          state.staging[stageIdx].col = targetCol;
       }
    }
    
    draggedTileId = null;
    draggedFrom = null;
    
    // Update selected cell to the dropped location for convenience
    state.selectedCell = { row: targetRow, col: targetCol };
    render();
  }

  /* ── Move Inference ──────────────────────────────────────── */

  function inferMoveFromStaging() {
    if (state.staging.length === 0) return null;

    let isHorizontal = true;
    let isVertical = true;
    const r0 = state.staging[0].row;
    const c0 = state.staging[0].col;

    for (const t of state.staging) {
      if (t.row !== r0) isHorizontal = false;
      if (t.col !== c0) isVertical = false;
    }

    if (!isHorizontal && !isVertical) return { error: "Tiles must be placed in a single row or column." };

    let direction = state.direction;
    if (state.staging.length > 1) {
      direction = isHorizontal ? "horizontal" : "vertical";
    }

    let minR = 15, maxR = -1, minC = 15, maxC = -1;
    for (const t of state.staging) {
      minR = Math.min(minR, t.row);
      maxR = Math.max(maxR, t.row);
      minC = Math.min(minC, t.col);
      maxC = Math.max(maxC, t.col);
    }

    if (direction === "horizontal") {
      let r = r0;
      let c1 = minC;
      while (c1 > 0 && state.board[r][c1 - 1]) c1--;
      let c2 = maxC;
      while (c2 < 14 && state.board[r][c2 + 1]) c2++;
      
      let word = "";
      for (let c = c1; c <= c2; c++) {
        const boardTile = state.board[r][c];
        const stagedTile = state.staging.find((t) => t.row === r && t.col === c);
        if (boardTile) word += boardTile.letter;
        else if (stagedTile) word += stagedTile.tile.letter;
        else return { error: "Word has gaps between tiles." };
      }
      return { word, row: r, col: c1, direction };
    } else {
      let c = c0;
      let r1 = minR;
      while (r1 > 0 && state.board[r1 - 1][c]) r1--;
      let r2 = maxR;
      while (r2 < 14 && state.board[r2 + 1][c]) r2++;
      
      let word = "";
      for (let r = r1; r <= r2; r++) {
        const boardTile = state.board[r][c];
        const stagedTile = state.staging.find((t) => t.row === r && t.col === c);
        if (boardTile) word += boardTile.letter;
        else if (stagedTile) word += stagedTile.tile.letter;
        else return { error: "Word has gaps between tiles." };
      }
      return { word, row: r1, col: c, direction };
    }
  }

  function renderWordInput() {
    const move = inferMoveFromStaging();
    if (!move || move.error) {
      wordPreview.textContent = "-";
      selectedScore.textContent = "0 pts";
      return;
    }

    wordPreview.textContent = move.word;
    
    // To calculate score, we temporarily simulate the tiles being played
    // We can use buildPlacement
    const originalRack = [...state.racks.player];
    // Put staging tiles back into rack temporarily to satisfy buildPlacement
    for (const st of state.staging) state.racks.player.push(st.tile);
    
    const placement = window.ScrabbleGame.buildPlacement(
      state, "player", move.word, move.row, move.col, move.direction
    );
    
    // Restore rack
    state.racks.player = originalRack;

    selectedScore.textContent = placement ? `${placement.score} pts` : "0 pts";
  }

  /* ── Submit word ─────────────────────────────────────────── */

  function submitWord() {
    if (locked) return;
    if (state.turn !== "player") {
      statusTitle.textContent = "Not your turn";
      statusCopy.textContent = "Wait for the AI to finish.";
      return;
    }
    
    if (state.staging.length === 0) {
      statusTitle.textContent = "Place your tiles";
      statusCopy.textContent = "Drag tiles to the board or type to form a word.";
      GameKit.playLose();
      return;
    }

    const move = inferMoveFromStaging();
    if (move.error) {
      statusTitle.textContent = "Invalid placement";
      statusCopy.textContent = move.error;
      GameKit.playLose();
      return;
    }

    // `ScrabbleGame.playWord` expects tiles to be in the rack.
    // Move staging back to rack temporarily.
    const stashedStaging = [...state.staging];
    clearStaging();

    const result = window.ScrabbleGame.playWord(
      state, "player", move.word, move.row, move.col, move.direction
    );

    if (result.ok) {
      statusTitle.textContent = `Played ${move.word}`;
      statusCopy.textContent = `Scored ${result.placement.score} points!`;
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
      // Restore staging if invalid
      for (const st of stashedStaging) {
         // remove from rack
         const idx = state.racks.player.findIndex(t => t.id === st.tile.id);
         if (idx >= 0) state.racks.player.splice(idx, 1);
         state.staging.push(st);
      }
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
