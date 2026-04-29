(function () {
  "use strict";

  const state = window.TicTacToeState.create();
  const cells = GameKit.qsa(".cell");
  const boardEl = GameKit.qs("#board");
  const winLine = GameKit.qs("#win-line");
  const turnLabel = GameKit.qs("#turn-label");
  const statusMessage = GameKit.qs("#status-message");
  const scoreEls = {
    X: GameKit.qs("#score-x"),
    O: GameKit.qs("#score-o"),
    draw: GameKit.qs("#score-draw"),
  };
  const modeButtons = GameKit.qsa("[data-mode]");
  const starterButtons = GameKit.qsa("[data-starter]");
  const difficultyButtons = GameKit.qsa("[data-difficulty]");
  const aiLevelField = GameKit.qs(".ai-level-field");

  const difficultyLabels = { easy: "Easy", medium: "Medium", hard: "Hard" };

  boot();

  function boot() {
    cells.forEach((cell) => cell.addEventListener("click", onCellClick));
    GameKit.qs("#reset-round").addEventListener("click", resetRound);
    GameKit.qs("#reset-score").addEventListener("click", resetScores);
    modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
    starterButtons.forEach((button) => button.addEventListener("click", () => {
      state.starter = button.dataset.starter;
      GameKit.setPressed(starterButtons, state.starter, "starter");
      resetRound();
    }));
    difficultyButtons.forEach((button) => button.addEventListener("click", () => {
      state.aiDifficulty = button.dataset.difficulty;
      GameKit.setPressed(difficultyButtons, state.aiDifficulty, "difficulty");
      resetRound();
    }));

    renderScores();
    setAiAvailability();
    introAnimation();
    updateStatus();
    maybeAiMove();
  }

  function onCellClick(event) {
    const index = Number(event.currentTarget.dataset.index);
    if (state.roundOver || state.aiThinking || state.board[index]) return;
    if (state.mode === "ai" && state.currentPlayer === "O") return;
    playMove(index, state.currentPlayer);
  }

  function playMove(index, player) {
    GameKit.playClick();
    const result = window.TicTacToeGame.applyMove(state, index, player);
    renderCell(index, player);

    if (result) {
      finishRound(result);
      return;
    }

    state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
    updateStatus();
    maybeAiMove();
  }

  function maybeAiMove() {
    if (state.mode !== "ai" || state.currentPlayer !== "O" || state.roundOver) return;
    state.aiThinking = true;
    const token = ++state.aiMoveToken;
    updateStatus(`AI ${difficultyLabels[state.aiDifficulty]} is thinking...`);
    setBoardDisabled(true);

    window.setTimeout(() => {
      if (token !== state.aiMoveToken || state.roundOver || state.mode !== "ai") return;
      state.aiThinking = false;
      playMove(window.TicTacToeAI.chooseMove(state.board, state.aiDifficulty), "O");
    }, 420 + GameKit.randomInt(0, 260));
  }

  function renderCell(index, player) {
    const cell = cells[index];
    cell.disabled = true;
    cell.setAttribute("aria-label", `Square ${index + 1}, filled by ${player}`);
    cell.innerHTML = `<span class="marker ${player.toLowerCase()}">${player}</span>`;
    GameKit.animate(cell, { scale: [0.92, 1.04, 1], duration: 500, easing: "spring(1, 82, 10, 0)" });
    GameKit.animate(cell.querySelector(".marker"), {
      opacity: [0, 1],
      scale: [0.25, 1.08, 1],
      rotate: player === "X" ? [-18, 4, 0] : [18, -4, 0],
      duration: 640,
      easing: "spring(1, 80, 9, 0)",
    });
  }

  function finishRound(result) {
    state.roundOver = true;
    state.scores[result.winner] += 1;
    GameKit.saveScore("ticTacToe", state.scores);
    renderScores();
    setBoardDisabled(true);

    if (result.winner === "draw") {
      turnLabel.textContent = "Draw";
      statusMessage.textContent = "The board is full. Reset the round to play again.";
      GameKit.animate(boardEl, { rotate: [0, -1.2, 1.2, 0], duration: 420, easing: "easeInOutSine" });
      return;
    }

    GameKit.playWin();
    result.combo.forEach((index) => cells[index].classList.add("win"));
    showWinLine(result.combo);
    turnLabel.textContent = `${result.winner} wins`;
    statusMessage.textContent = result.winner === "X" && state.mode === "ai" ? "You took the round." : `${result.winner} takes the round.`;
  }

  function showWinLine(combo) {
    const boardRect = boardEl.getBoundingClientRect();
    const startRect = cells[combo[0]].getBoundingClientRect();
    const endRect = cells[combo[2]].getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2 - boardRect.left;
    const startY = startRect.top + startRect.height / 2 - boardRect.top;
    const endX = endRect.left + endRect.width / 2 - boardRect.left;
    const endY = endRect.top + endRect.height / 2 - boardRect.top;
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    const length = Math.hypot(endX - startX, endY - startY) + startRect.width * 0.42;

    winLine.style.left = `${(startX + endX) / 2}px`;
    winLine.style.top = `${(startY + endY) / 2}px`;
    winLine.style.width = `${length}px`;
    winLine.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scaleX(0)`;
    winLine.style.opacity = "1";
    GameKit.animate(winLine, { opacity: [0, 1], scaleX: [0, 1], duration: 560, easing: "easeOutExpo" });
  }

  function updateStatus(overrideText) {
    turnLabel.textContent = `${state.currentPlayer} to move`;
    statusMessage.textContent = overrideText
      || (state.mode === "ai" && state.currentPlayer === "O"
        ? `AI ${difficultyLabels[state.aiDifficulty]} is thinking.`
        : state.mode === "ai"
          ? `You are X. AI level: ${difficultyLabels[state.aiDifficulty]}.`
          : `Player ${state.currentPlayer}, choose a square.`);
    setBoardDisabled(state.roundOver || state.aiThinking);
  }

  function renderScores() {
    Object.keys(scoreEls).forEach((key) => {
      scoreEls[key].textContent = state.scores[key];
    });
  }

  function resetRound() {
    state.aiMoveToken += 1;
    state.roundOver = false;
    state.aiThinking = false;
    state.board = Array(9).fill("");
    state.currentPlayer = state.starter;
    winLine.style.opacity = "0";
    cells.forEach((cell, index) => {
      cell.classList.remove("win");
      cell.disabled = false;
      cell.innerHTML = "";
      cell.setAttribute("aria-label", `Square ${index + 1}`);
    });
    GameKit.animate(cells, { opacity: [0.42, 1], scale: [0.94, 1], delay: GameKit.stagger(42), duration: 420, easing: "spring(1, 76, 10, 0)" });
    updateStatus();
    maybeAiMove();
  }

  function resetScores() {
    state.scores = { ...window.TicTacToeState.fallbackScores };
    GameKit.saveScore("ticTacToe", state.scores);
    renderScores();
  }

  function setMode(nextMode) {
    state.mode = nextMode;
    GameKit.setPressed(modeButtons, state.mode, "mode");
    setAiAvailability();
    resetRound();
  }

  function setAiAvailability() {
    const isAi = state.mode === "ai";
    aiLevelField.classList.toggle("is-muted", !isAi);
    difficultyButtons.forEach((button) => { button.disabled = !isAi; });
  }

  function setBoardDisabled(disabled) {
    cells.forEach((cell, index) => {
      cell.disabled = disabled || Boolean(state.board[index]);
    });
  }

  function introAnimation() {
    GameKit.animate(".game-stage", { opacity: [0, 1], translateY: [18, 0], duration: 720, easing: "easeOutCubic" });
    GameKit.animate(cells, { opacity: [0, 1], scale: [0.76, 1], delay: GameKit.stagger(65), duration: 760, easing: "spring(1, 72, 10, 0)" });
  }
})();
