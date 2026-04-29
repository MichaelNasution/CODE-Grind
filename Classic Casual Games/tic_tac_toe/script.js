(() => {
  "use strict";

  const animeApi = window.anime || {};
  const rawAnimate = animeApi.animate || fallbackAnimate;
  const animate = safeAnimate;
  const stagger = animeApi.stagger || ((step) => (_, index) => index * step);

  const cells = Array.from(document.querySelectorAll(".cell"));
  const boardEl = document.getElementById("board");
  const winLine = document.getElementById("win-line");
  const turnLabel = document.getElementById("turn-label");
  const statusMessage = document.getElementById("status-message");
  const scoreEls = {
    X: document.getElementById("score-x"),
    O: document.getElementById("score-o"),
    draw: document.getElementById("score-draw"),
  };

  const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
  const starterButtons = Array.from(document.querySelectorAll("[data-starter]"));
  const difficultyButtons = Array.from(document.querySelectorAll("[data-difficulty]"));
  const aiLevelField = document.querySelector(".ai-level-field");
  const resetRoundBtn = document.getElementById("reset-round");
  const resetScoreBtn = document.getElementById("reset-score");

  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let board = Array(9).fill("");
  let scores = { X: 0, O: 0, draw: 0 };
  let currentPlayer = "X";
  let starter = "X";
  let mode = "ai";
  let aiDifficulty = "medium";
  let roundOver = false;
  let aiThinking = false;
  let aiMoveToken = 0;

  const difficultyLabels = {
    easy: "Mudah",
    medium: "Sedang",
    hard: "Sulit",
  };

  boot();

  function boot() {
    cells.forEach((cell) => cell.addEventListener("click", onCellClick));
    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setMode(button.dataset.mode);
        resetRound();
      });
    });
    starterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        starter = button.dataset.starter;
        setActive(starterButtons, "starter", starter);
        resetRound();
      });
    });
    difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        aiDifficulty = button.dataset.difficulty;
        setActive(difficultyButtons, "difficulty", aiDifficulty);
        resetRound();
      });
    });
    resetRoundBtn.addEventListener("click", resetRound);
    resetScoreBtn.addEventListener("click", resetScores);
    wireButtonMotion();
    setAiLevelAvailability();

    introAnimation();
    updateStatus();
    maybeAiMove();
  }

  function onCellClick(event) {
    const index = Number(event.currentTarget.dataset.index);
    if (roundOver || aiThinking || board[index]) return;
    if (mode === "ai" && currentPlayer === "O") return;
    playMove(index, currentPlayer);
  }

  function playMove(index, player) {
    board[index] = player;
    renderCell(index, player);

    const result = getResult();
    if (result) {
      finishRound(result);
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();
    maybeAiMove();
  }

  function maybeAiMove() {
    if (mode !== "ai" || currentPlayer !== "O" || roundOver) return;

    aiThinking = true;
    const token = ++aiMoveToken;
    updateStatus(`AI ${difficultyLabels[aiDifficulty]} sedang menghitung langkah...`);
    setBoardDisabled(true);

    window.setTimeout(() => {
      if (token !== aiMoveToken || roundOver || mode !== "ai" || currentPlayer !== "O") return;

      const choice = getAiMove();

      aiThinking = false;
      if (choice !== undefined) playMove(choice, "O");
    }, 520 + Math.round(Math.random() * 360));
  }

  function renderCell(index, player) {
    const cell = cells[index];
    cell.disabled = true;
    cell.setAttribute("aria-label", `Kotak ${index + 1}, diisi ${player}`);
    cell.innerHTML = `<span class="marker ${player.toLowerCase()}">${player}</span>`;

    animate(cell, {
      scale: [0.92, 1.04, 1],
      duration: 520,
      easing: "spring(1, 82, 10, 0)",
    });

    animate(cell.querySelector(".marker"), {
      opacity: [0, 1],
      scale: [0.25, 1.08, 1],
      rotate: player === "X" ? [-18, 4, 0] : [18, -4, 0],
      duration: 640,
      easing: "spring(1, 80, 9, 0)",
    });
  }

  function getResult() {
    for (const combo of wins) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo };
      }
    }

    if (board.every(Boolean)) {
      return { winner: "draw", combo: [] };
    }

    return null;
  }

  function finishRound(result) {
    roundOver = true;
    setBoardDisabled(true);
    scores[result.winner] += 1;
    updateScore(result.winner);

    if (result.winner === "draw") {
      turnLabel.textContent = "Seri";
      statusMessage.textContent = "Board penuh. Reset ronde untuk main lagi.";
      animate(boardEl, {
        rotate: [0, -1.2, 1.2, 0],
        duration: 420,
        easing: "easeInOutSine",
      });
      return;
    }

    result.combo.forEach((index) => cells[index].classList.add("win"));
    showWinLine(result.combo);
    turnLabel.textContent = `${result.winner} menang`;
    statusMessage.textContent = result.winner === "X" && mode === "ai"
      ? "Kamu menang. Langkahmu rapi."
      : `${result.winner} mengambil ronde ini.`;

    animate(result.combo.map((index) => cells[index]), {
      scale: [1, 1.06, 1],
      duration: 780,
      delay: stagger(85),
      easing: "spring(1, 70, 9, 0)",
    });
  }

  function showWinLine(combo) {
    const boardRect = boardEl.getBoundingClientRect();
    const startRect = cells[combo[0]].getBoundingClientRect();
    const endRect = cells[combo[2]].getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2 - boardRect.left;
    const startY = startRect.top + startRect.height / 2 - boardRect.top;
    const endX = endRect.left + endRect.width / 2 - boardRect.left;
    const endY = endRect.top + endRect.height / 2 - boardRect.top;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const length = Math.hypot(endX - startX, endY - startY) + startRect.width * 0.42;
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

    winLine.style.left = `${midX}px`;
    winLine.style.top = `${midY}px`;
    winLine.style.width = `${length}px`;
    winLine.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scaleX(0)`;
    winLine.style.opacity = "1";

    animate(winLine, {
      opacity: [0, 1],
      scaleX: [0, 1],
      duration: 560,
      easing: "easeOutExpo",
    });
  }

  function updateStatus(overrideText) {
    turnLabel.textContent = `${currentPlayer} bermain`;

    if (overrideText) {
      statusMessage.textContent = overrideText;
    } else if (mode === "ai" && currentPlayer === "O") {
      statusMessage.textContent = `AI ${difficultyLabels[aiDifficulty]} sedang menghitung langkah.`;
    } else if (mode === "ai") {
      statusMessage.textContent = `Kamu bermain sebagai X. Level AI: ${difficultyLabels[aiDifficulty]}.`;
    } else {
      statusMessage.textContent = `Pemain ${currentPlayer}, pilih kotak.`;
    }

    setBoardDisabled(roundOver || aiThinking);
    animate(".status-box", {
      translateY: [4, 0],
      opacity: [0.82, 1],
      duration: 260,
      easing: "easeOutQuad",
    });
  }

  function updateScore(key) {
    scoreEls[key].textContent = scores[key];
    animate(scoreEls[key], {
      scale: [1, 1.28, 1],
      translateY: [0, -6, 0],
      duration: 500,
      easing: "spring(1, 80, 8, 0)",
    });
  }

  function resetRound() {
    aiMoveToken += 1;
    roundOver = false;
    aiThinking = false;
    board = Array(9).fill("");
    currentPlayer = starter;
    winLine.style.opacity = "0";
    winLine.style.transform = "translate(-50%, -50%) scaleX(0)";

    animate(boardEl, {
      opacity: [1, 0.35, 1],
      translateY: [0, 12, 0],
      duration: 520,
      easing: "easeOutCubic",
    });

    cells.forEach((cell, index) => {
      cell.classList.remove("win");
      cell.disabled = false;
      cell.innerHTML = "";
      cell.setAttribute("aria-label", `Kotak ${index + 1}`);
    });

    animate(cells, {
      opacity: [0.42, 1],
      scale: [0.94, 1],
      delay: stagger(42),
      duration: 420,
      easing: "spring(1, 76, 10, 0)",
    });

    updateStatus();
    maybeAiMove();
  }

  function resetScores() {
    scores = { X: 0, O: 0, draw: 0 };
    Object.entries(scoreEls).forEach(([key, element], index) => {
      element.textContent = scores[key];
      animate(element.closest(".score-card"), {
        scale: [1, 0.96, 1],
        delay: index * 70,
        duration: 380,
        easing: "spring(1, 85, 10, 0)",
      });
    });
  }

  function setMode(nextMode) {
    mode = nextMode;
    setActive(modeButtons, "mode", mode);
    setAiLevelAvailability();
  }

  function setAiLevelAvailability() {
    const isAiMode = mode === "ai";
    aiLevelField.classList.toggle("is-muted", !isAiMode);
    difficultyButtons.forEach((button) => {
      button.disabled = !isAiMode;
    });
  }

  function setActive(buttons, dataKey, value) {
    buttons.forEach((button) => {
      const isActive = button.dataset[dataKey] === value;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (isActive) {
        animate(button, {
          scale: [0.96, 1.04, 1],
          duration: 360,
          easing: "spring(1, 88, 10, 0)",
        });
      }
    });
  }

  function setBoardDisabled(disabled) {
    cells.forEach((cell, index) => {
      cell.disabled = disabled || Boolean(board[index]);
    });
  }

  function getAiMove() {
    if (aiDifficulty === "easy") return getRandomMove(board);
    if (aiDifficulty === "hard") return getHardMove(board);
    return getMediumMove(board);
  }

  function getEmptyIndexes(state) {
    return state
      .map((value, index) => (value ? null : index))
      .filter((index) => index !== null);
  }

  function getRandomMove(state) {
    const emptyIndexes = getEmptyIndexes(state);
    return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  }

  function getImmediateWinningMove(state, player) {
    for (const index of getEmptyIndexes(state)) {
      const nextState = [...state];
      nextState[index] = player;
      const result = getResultForBoard(nextState);
      if (result && result.winner === player) return index;
    }
    return undefined;
  }

  function getMediumMove(state) {
    const winningMove = getImmediateWinningMove(state, "O");
    if (winningMove !== undefined) return winningMove;

    const shouldPlaySmart = Math.random() < 0.76;
    if (!shouldPlaySmart) return getRandomMove(state);

    const blockingMove = getImmediateWinningMove(state, "X");
    if (blockingMove !== undefined) return blockingMove;

    if (!state[4]) return 4;

    const openCorners = [0, 2, 6, 8].filter((index) => !state[index]);
    if (openCorners.length) return openCorners[Math.floor(Math.random() * openCorners.length)];

    return getRandomMove(state);
  }

  function getHardMove(state) {
    let bestScore = -Infinity;
    const bestMoves = [];

    for (const index of getEmptyIndexes(state)) {
      const nextState = [...state];
      nextState[index] = "O";
      const score = minimax(nextState, 0, false, -Infinity, Infinity);

      if (score > bestScore) {
        bestScore = score;
        bestMoves.length = 0;
        bestMoves.push(index);
      } else if (score === bestScore) {
        bestMoves.push(index);
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  function minimax(state, depth, isMaximizing, alpha, beta) {
    const result = getResultForBoard(state);
    if (result) {
      if (result.winner === "O") return 10 - depth;
      if (result.winner === "X") return depth - 10;
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const index of getEmptyIndexes(state)) {
        const nextState = [...state];
        nextState[index] = "O";
        bestScore = Math.max(bestScore, minimax(nextState, depth + 1, false, alpha, beta));
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    }

    let bestScore = Infinity;
    for (const index of getEmptyIndexes(state)) {
      const nextState = [...state];
      nextState[index] = "X";
      bestScore = Math.min(bestScore, minimax(nextState, depth + 1, true, alpha, beta));
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return bestScore;
  }

  function getResultForBoard(state) {
    for (const combo of wins) {
      const [a, b, c] = combo;
      if (state[a] && state[a] === state[b] && state[a] === state[c]) {
        return { winner: state[a], combo };
      }
    }

    if (state.every(Boolean)) {
      return { winner: "draw", combo: [] };
    }

    return null;
  }

  function introAnimation() {
    animate(".game-stage", {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 720,
      easing: "easeOutCubic",
    });

    animate(cells, {
      opacity: [0, 1],
      scale: [0.76, 1],
      delay: stagger(65),
      duration: 760,
      easing: "spring(1, 72, 10, 0)",
    });

    animate(".score-card", {
      opacity: [0, 1],
      translateY: [-10, 0],
      delay: stagger(85),
      duration: 560,
      easing: "easeOutExpo",
    });
  }

  function wireButtonMotion() {
    const buttons = Array.from(document.querySelectorAll(".segment, .action-btn"));
    buttons.forEach((button) => {
      button.addEventListener("pointerenter", () => {
        animate(button, {
          translateY: -2,
          scale: 1.025,
          duration: 220,
          easing: "easeOutQuad",
        });
      });

      button.addEventListener("pointerleave", () => {
        animate(button, {
          translateY: 0,
          scale: 1,
          duration: 220,
          easing: "easeOutQuad",
        });
      });

      button.addEventListener("pointerdown", () => {
        animate(button, {
          scale: 0.96,
          duration: 130,
          easing: "easeOutQuad",
        });
      });

      button.addEventListener("pointerup", () => {
        animate(button, {
          scale: 1,
          duration: 260,
          easing: "spring(1, 90, 10, 0)",
        });
      });
    });
  }

  function safeAnimate(targets, params = {}) {
    try {
      return rawAnimate(targets, params);
    } catch (error) {
      return fallbackAnimate(targets, params);
    }
  }

  function fallbackAnimate(targets, params = {}) {
    const elements = typeof targets === "string"
      ? Array.from(document.querySelectorAll(targets))
      : Array.isArray(targets)
        ? targets
        : [targets];

    elements.filter(Boolean).forEach((element) => {
      if (params.opacity) element.style.opacity = String(lastValue(params.opacity));
      if (params.scale) element.style.transform = `scale(${lastValue(params.scale)})`;
      if (params.translateY) element.style.transform = `translateY(${lastValue(params.translateY)}px)`;
    });

    return { finished: Promise.resolve() };
  }

  function lastValue(value) {
    return Array.isArray(value) ? value[value.length - 1] : value;
  }
})();
