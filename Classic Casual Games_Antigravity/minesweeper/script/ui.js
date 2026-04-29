(function () {
  "use strict";

  const state = window.MinesweeperState.create();
  const boardEl = GameKit.qs("#board");
  const mineCount = GameKit.qs("#mine-count");
  const timer = GameKit.qs("#timer");
  const bestScore = GameKit.qs("#best-score");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");
  const modeButtons = GameKit.qsa("[data-mode]");
  const difficultyButtons = GameKit.qsa("[data-difficulty]");

  boot();

  function boot() {
    modeButtons.forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      GameKit.setPressed(modeButtons, state.mode, "mode");
      updateStatus();
    }));
    difficultyButtons.forEach((button) => button.addEventListener("click", () => {
      state.difficulty = button.dataset.difficulty;
      GameKit.setPressed(difficultyButtons, state.difficulty, "difficulty");
    }));
    GameKit.qs("#new-game").addEventListener("click", reset);
    GameKit.qs("#ai-step").addEventListener("click", aiStep);
    reset();
  }

  function reset() {
    window.clearInterval(state.timerId);
    Object.assign(state, window.MinesweeperState.create(), { mode: state.mode, difficulty: state.difficulty });
    window.MinesweeperGame.createBoard(state);
    render();
    updateStatus();
  }

  function startTimer() {
    if (state.timerId) return;
    state.status = "playing";
    state.timerId = window.setInterval(() => {
      state.seconds += 1;
      timer.textContent = state.seconds;
    }, 1000);
  }

  function render() {
    boardEl.innerHTML = "";
    mineCount.textContent = Math.max(0, state.mines - state.flags);
    timer.textContent = state.seconds;
    bestScore.textContent = state.best ?? "--";
    state.board.forEach((tile) => {
      const button = document.createElement("button");
      button.className = "mine-tile tile-button";
      button.type = "button";
      button.dataset.index = tile.index;
      button.addEventListener("click", () => reveal(tile.index));
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        window.MinesweeperGame.toggleFlag(state, tile.index);
        render();
      });
      paintTile(button, tile);
      boardEl.appendChild(button);
    });
  }

  function paintTile(button, tile) {
    button.classList.toggle("revealed", tile.revealed);
    button.classList.toggle("flagged", tile.flagged);
    button.classList.toggle("exploded", tile.mine && tile.revealed);
    button.textContent = tile.revealed ? (tile.mine ? "*" : tile.count || "") : (tile.flagged ? "!" : "");
    button.disabled = tile.revealed || state.status === "lost" || state.status === "won";
  }

  function reveal(index) {
    GameKit.playClick();
    window.MinesweeperGame.reveal(state, index);
    if (state.status !== "lost" && state.status !== "won") startTimer();
    finishIfNeeded();
    render();
  }

  function aiStep() {
    if (!state.board.length) return;
    const index = window.MinesweeperAI.chooseTile(state);
    if (index !== undefined) reveal(index);
  }

  function finishIfNeeded() {
    if (state.status === "lost") {
      GameKit.playLose();
      window.clearInterval(state.timerId);
      state.board.forEach((tile) => { if (tile.mine) tile.revealed = true; });
    }
    if (state.status === "won") {
      GameKit.playWin();
      window.clearInterval(state.timerId);
      if (!state.best || state.seconds < state.best) {
        state.best = state.seconds;
        GameKit.saveScore("minesweeper", { best: state.best });
      }
    }
    updateStatus();
  }

  function updateStatus() {
    const text = {
      ready: ["Ready", "Reveal a safe tile. Right-click or long-press to flag."],
      playing: ["Sweeping", state.mode === "race" ? "Score-race mode: clear the board as fast as possible." : "Use deduction, flags, and clean reveals."],
      won: ["Cleared", "Every safe tile is open. Excellent sweep."],
      lost: ["Mine hit", "The field detonated. Start a fresh board."],
    }[state.status];
    statusTitle.textContent = text[0];
    statusCopy.textContent = text[1];
  }
})();
