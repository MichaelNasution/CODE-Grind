(function () {
  "use strict";

  let state = window.ScrabbleState.create();
  const boardEl = GameKit.qs("#board");
  const rackEl = GameKit.qs("#rack");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");

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
      render();
    });
    GameKit.qs("#submit-word").addEventListener("click", submitWord);
    GameKit.qs("#ai-move").addEventListener("click", playAiMove);
    GameKit.qsa("[data-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      GameKit.setPressed(GameKit.qsa("[data-mode]"), state.mode, "mode");
    }));
    GameKit.qsa("[data-difficulty]").forEach((button) => button.addEventListener("click", () => {
      state.difficulty = button.dataset.difficulty;
      GameKit.setPressed(GameKit.qsa("[data-difficulty]"), state.difficulty, "difficulty");
    }));
    GameKit.qsa("[data-direction]").forEach((button) => button.addEventListener("click", () => {
      state.direction = button.dataset.direction;
      GameKit.setPressed(GameKit.qsa("[data-direction]"), state.direction, "direction");
    }));
  }

  function render() {
    renderBoard();
    renderRack();
    GameKit.qs("#player-score").textContent = state.scores.player;
    GameKit.qs("#ai-score").textContent = state.scores.ai;
    GameKit.qs("#bag-count").textContent = state.bag.length;
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    for (let row = 0; row < 15; row += 1) {
      for (let col = 0; col < 15; col += 1) {
        const cell = document.createElement("button");
        const bonus = window.ScrabbleScoring.bonus[`${row},${col}`];
        const tile = state.board[row][col];
        cell.className = `scrabble-cell ${bonus ? `bonus-${bonus}` : ""}`;
        cell.classList.toggle("filled", Boolean(tile));
        cell.classList.toggle("selected", state.selectedCell.row === row && state.selectedCell.col === col);
        cell.textContent = tile ? tile.letter : (bonus || "");
        cell.addEventListener("click", () => {
          state.selectedCell = { row, col };
          renderBoard();
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
      button.textContent = `${tile.letter}${tile.value}`;
      button.addEventListener("click", () => {
        state.selectedRackIds = state.selectedRackIds.includes(tile.id)
          ? state.selectedRackIds.filter((id) => id !== tile.id)
          : [...state.selectedRackIds, tile.id];
        renderRack();
      });
      rackEl.appendChild(button);
    });
  }

  function submitWord() {
    const selectedTiles = state.selectedRackIds.map((id) => state.racks.player.find((tile) => tile.id === id)).filter(Boolean);
    const word = selectedTiles.map((tile) => tile.letter).join("");
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
})();
