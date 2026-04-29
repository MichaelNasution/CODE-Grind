(function () {
  "use strict";

  let state = window.SnakeState.create();
  const boardEl = GameKit.qs("#board");
  const scoreEl = GameKit.qs("#score");
  const speedEl = GameKit.qs("#speed");
  const bestEl = GameKit.qs("#best");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");
  const modeButtons = GameKit.qsa("[data-mode]");
  const difficultyButtons = GameKit.qsa("[data-difficulty]");
  const keys = {
    ArrowUp: { x: 0, y: -1 }, KeyW: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, KeyS: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, KeyA: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, KeyD: { x: 1, y: 0 },
  };

  boot();

  function boot() {
    drawGrid();
    render();
    document.addEventListener("keydown", (event) => {
      if (keys[event.code]) {
        event.preventDefault();
        window.SnakeGame.changeDirection(state, keys[event.code]);
      }
    });
    GameKit.qs("#start").addEventListener("click", start);
    GameKit.qs("#reset").addEventListener("click", reset);
    modeButtons.forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      GameKit.setPressed(modeButtons, state.mode, "mode");
      updateStatus();
    }));
    difficultyButtons.forEach((button) => button.addEventListener("click", () => {
      state.difficulty = button.dataset.difficulty;
      GameKit.setPressed(difficultyButtons, state.difficulty, "difficulty");
    }));
  }

  function drawGrid() {
    boardEl.innerHTML = "";
    for (let index = 0; index < state.size * state.size; index += 1) {
      const cell = document.createElement("div");
      cell.className = "snake-cell";
      boardEl.appendChild(cell);
    }
  }

  function start() {
    if (state.status === "playing") return;
    state.status = "playing";
    updateStatus();
    tick();
  }

  function tick() {
    window.clearTimeout(state.loopId);
    if (state.mode === "ai") window.SnakeGame.changeDirection(state, window.SnakeAI.chooseDirection(state));
    window.SnakeGame.step(state);
    if (state.status === "lost") {
      GameKit.playLose();
      state.best = Math.max(state.best, state.score);
      GameKit.saveScore("snake", { best: state.best });
      render();
      updateStatus();
      return;
    }
    render();
    state.loopId = window.setTimeout(tick, Math.max(70, 170 - state.speed * 12));
  }

  function reset() {
    window.clearTimeout(state.loopId);
    const mode = state.mode;
    const difficulty = state.difficulty;
    state = window.SnakeState.create();
    state.mode = mode;
    state.difficulty = difficulty;
    drawGrid();
    render();
    updateStatus();
  }

  function render() {
    const snakeKeys = new Set(state.snake.map(window.SnakeGame.key));
    GameKit.qsa(".snake-cell", boardEl).forEach((cell, index) => {
      const x = index % state.size;
      const y = Math.floor(index / state.size);
      const isHead = state.snake[0].x === x && state.snake[0].y === y;
      cell.className = "snake-cell";
      cell.classList.toggle("snake", snakeKeys.has(`${x},${y}`));
      cell.classList.toggle("head", isHead);
      cell.classList.toggle("food", state.food.x === x && state.food.y === y);
    });
    scoreEl.textContent = state.score;
    speedEl.textContent = `${state.speed}x`;
    bestEl.textContent = state.best;
  }

  function updateStatus() {
    statusTitle.textContent = state.status === "lost" ? "Game over" : state.status === "playing" ? "Running" : "Ready";
    statusCopy.textContent = state.status === "lost"
      ? "Collision detected. Reset and try another route."
      : state.mode === "ai"
        ? `AI pilot is set to ${state.difficulty}.`
        : "Use arrow keys or WASD to steer.";
  }
})();
