(function () {
  "use strict";

  let state = window.ChessState.create();
  const boardEl = GameKit.qs("#board");
  const turnEl = GameKit.qs("#turn");
  const modeLabel = GameKit.qs("#mode-label");
  const depthEl = GameKit.qs("#depth");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");
  const whiteCaptures = GameKit.qs("#white-captures");
  const blackCaptures = GameKit.qs("#black-captures");

  boot();

  function boot() {
    GameKit.qs("#new-game").addEventListener("click", () => {
      const mode = state.mode;
      const difficulty = state.difficulty;
      state = window.ChessState.create();
      state.mode = mode;
      state.difficulty = difficulty;
      render();
    });
    GameKit.qs("#ai-move").addEventListener("click", runAiMove);
    GameKit.qsa("[data-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      GameKit.setPressed(GameKit.qsa("[data-mode]"), state.mode, "mode");
      render();
    }));
    GameKit.qsa("[data-difficulty]").forEach((button) => button.addEventListener("click", () => {
      state.difficulty = button.dataset.difficulty;
      GameKit.setPressed(GameKit.qsa("[data-difficulty]"), state.difficulty, "difficulty");
      render();
    }));
    render();
  }

  function render() {
    boardEl.innerHTML = "";
    state.board.forEach((piece, index) => {
      const square = document.createElement("button");
      square.className = `chess-square ${(Math.floor(index / 8) + index) % 2 ? "dark" : "light"}`;
      square.classList.toggle("selected", state.selected === index);
      square.classList.toggle("legal", state.legalMoves.some((move) => move.to === index));
      square.classList.toggle("capture-target", state.legalMoves.some((move) => move.to === index && state.board[index]));
      square.classList.toggle("last", Boolean(state.lastMove && (state.lastMove.from === index || state.lastMove.to === index)));
      square.type = "button";
      square.dataset.index = index;
      square.setAttribute("aria-label", piece ? `${piece.color} ${piece.type} on ${squareName(index)}` : `Empty square ${squareName(index)}`);
      if (piece) {
        const pieceEl = document.createElement("span");
        pieceEl.className = `chess-piece piece-${piece.color}`;
        pieceEl.textContent = window.ChessGame.symbols[piece.color][piece.type];
        square.appendChild(pieceEl);
      }
      square.addEventListener("click", () => onSquare(index));
      boardEl.appendChild(square);
    });
    turnEl.textContent = state.turn === "white" ? "White" : "Black";
    modeLabel.textContent = state.mode === "ai" ? "AI" : "PvP";
    depthEl.textContent = { easy: 1, medium: 2, hard: 3 }[state.difficulty];
    statusTitle.textContent = state.status === "checkmate" ? "Checkmate" : state.status === "stalemate" ? "Stalemate" : state.status === "check" ? "Check" : "Playing";
    statusCopy.textContent = statusMessage();
    renderCaptures();
  }

  function renderCaptures() {
    whiteCaptures.innerHTML = state.captured.white
      .map((piece) => `<span class="captured-piece piece-${piece.color}">${window.ChessGame.symbols[piece.color][piece.type]}</span>`)
      .join("");
    blackCaptures.innerHTML = state.captured.black
      .map((piece) => `<span class="captured-piece piece-${piece.color}">${window.ChessGame.symbols[piece.color][piece.type]}</span>`)
      .join("");
  }

  function statusMessage() {
    if (state.selected !== null) {
      return `${squareName(state.selected)} selected. ${state.legalMoves.length} legal move${state.legalMoves.length === 1 ? "" : "s"} available.`;
    }
    if (state.status === "check") return `${state.turn === "white" ? "White" : "Black"} is in check.`;
    if (state.status === "checkmate") return `${state.turn === "white" ? "Black" : "White"} wins by checkmate.`;
    if (state.status === "stalemate") return "No legal moves remain. The game is a stalemate.";
    return state.mode === "ai"
      ? "You play white. Select a piece to see legal moves; captures are marked in red."
      : "Two players share the board locally. Select a piece to see legal moves.";
  }

  function onSquare(index) {
    if (state.status === "checkmate" || state.status === "stalemate") return;
    if (state.mode === "ai" && state.turn === "black") return;
    const piece = state.board[index];
    const chosenMove = state.legalMoves.find((move) => move.to === index);
    if (chosenMove && state.selected !== null) {
      window.ChessGame.applyMove(state, { from: state.selected, ...chosenMove });
      state.selected = null;
      state.legalMoves = [];
      GameKit.playClick();
      render();
      if (state.mode === "ai" && state.turn === "black" && state.status !== "checkmate") window.setTimeout(runAiMove, 260);
      return;
    }
    if (piece?.color === state.turn) {
      state.selected = index;
      state.legalMoves = window.ChessGame.legalMoves(state, index);
    } else {
      state.selected = null;
      state.legalMoves = [];
    }
    render();
  }

  function runAiMove() {
    if (state.turn !== "black") return;
    const move = window.ChessAI.chooseMove(state);
    if (move) {
      window.ChessGame.applyMove(state, move);
      GameKit.playClick();
      render();
    }
  }

  function squareName(index) {
    return `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
  }
})();
