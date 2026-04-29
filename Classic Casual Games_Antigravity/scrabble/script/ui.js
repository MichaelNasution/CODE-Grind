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

  boot();

  function boot() {
    wireControls();
    render();
  }

  function wireControls() {
    GameKit.qs("#new-game").addEventListener("click", () => {
      const mode = state.mode;
      const difficulty = state.difficulty;
      state = window.ScrabbleState.create();
      state.mode = mode;
      state.difficulty = difficulty;
      statusTitle.textContent = "Ready";
      statusCopy.textContent = "Choose tiles and place your word.";
      render();
    });
    GameKit.qs("#submit-word").addEventListener("click", submitWord);
    GameKit.qs("#ai-move").addEventListener("click", playAiMove);
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

  function render() {
    renderBoard();
    renderRack();
    GameKit.qs("#player-score").textContent = state.scores.player;
    GameKit.qs("#ai-score").textContent = state.scores.ai;
    GameKit.qs("#bag-count").textContent = state.bag.length;
    playerCard.classList.toggle("active", state.turn === "player");
    aiCard.classList.toggle("active", state.turn === "ai");
    turnLabel.textContent = state.turn === "player" ? "Your turn" : "AI turn";
    lastPlay.textContent = state.lastMove ? `${state.lastMove.player === "player" ? "You" : "AI"} played ${state.lastMove.word} for ${state.lastMove.score}` : "No words played";
    updateWordPreview();
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
        cell.classList.toggle("preview", previewKeys.has(`${row},${col}`) && !tile);
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
        state.selectedRackIds = state.selectedRackIds.includes(tile.id)
          ? state.selectedRackIds.filter((id) => id !== tile.id)
          : [...state.selectedRackIds, tile.id];
        render();
      });
      rackEl.appendChild(button);
    });
    rackCount.textContent = `${state.racks.player.length} tile${state.racks.player.length === 1 ? "" : "s"}`;
  }

  function submitWord() {
    const tiles = selectedTiles();
    const word = tiles.map((tile) => tile.letter).join("");
    const result = window.ScrabbleGame.playWord(state, "player", word, state.selectedCell.row, state.selectedCell.col, state.direction);
    state.selectedRackIds = [];
    statusTitle.textContent = result.ok ? `Played ${word}` : "Invalid move";
    statusCopy.textContent = result.ok ? `Scored ${result.placement.score} points.` : result.reason;
    if (result.ok) {
      GameKit.playClick();
      if (state.mode === "ai") window.setTimeout(playAiMove, 450);
    } else {
      GameKit.playLose();
    }
    render();
  }

  function playAiMove() {
    const move = window.ScrabbleAI.chooseMove(state);
    if (!move) {
      statusTitle.textContent = "AI passed";
      statusCopy.textContent = "No dictionary word can be placed from the current rack.";
      return;
    }
    const result = window.ScrabbleGame.playWord(state, "ai", move.word, move.row, move.col, move.direction);
    statusTitle.textContent = `AI played ${move.word}`;
    statusCopy.textContent = result.ok ? `AI scored ${result.placement.score} points.` : result.reason;
    GameKit.playClick();
    render();
  }

  function updateWordPreview() {
    const tiles = selectedTiles();
    const word = tiles.map((tile) => tile.letter).join("");
    wordPreview.textContent = word || "-";
    const placement = word ? window.ScrabbleGame.buildPlacement(state, "player", word, state.selectedCell.row, state.selectedCell.col, state.direction) : null;
    selectedScore.textContent = placement ? `${placement.score} pts` : "0 pts";
  }

  function selectedTiles() {
    return state.selectedRackIds.map((id) => state.racks.player.find((tile) => tile.id === id)).filter(Boolean);
  }

  function previewCells() {
    const tiles = selectedTiles();
    return tiles.map((tile, index) => ({
      row: state.selectedCell.row + (state.direction === "vertical" ? index : 0),
      col: state.selectedCell.col + (state.direction === "horizontal" ? index : 0),
      tile,
    })).filter((item) => item.row >= 0 && item.row < 15 && item.col >= 0 && item.col < 15);
  }

  function tileMarkup(tile, extraClass = "") {
    return `<span class="tile-face ${extraClass}"><span class="tile-letter">${tile.letter}</span><span class="tile-value">${tile.value}</span></span>`;
  }

  function bonusMarkup(bonus) {
    if (!bonus) return "";
    return `<span class="bonus-label">${bonus.toUpperCase()}</span>`;
  }
})();
