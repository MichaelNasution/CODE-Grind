(function () {
  "use strict";

  let state = window.ChessState.create();
  const boardEl = GameKit.qs("#board");
  const turnEl = GameKit.qs("#turn");
  const modeLabel = GameKit.qs("#mode-label");
  const depthEl = GameKit.qs("#depth");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");

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
      square.classList.toggle("last", state.lastMove && (state.lastMove.from === index || state.lastMove.to === index));
      square.type = "button";
      square.dataset.index = index;
      if (piece) {
        square.textContent = window.ChessGame.symbols[piece.color][piece.type];
        square.classList.add(`piece-${piece.color}`);
      }
      square.addEventListener("click", () => onSquare(index));
      boardEl.appendChild(square);
    });
    turnEl.textContent = state.turn === "white" ? "White" : "Black";
    modeLabel.textContent = state.mode === "ai" ? "AI" : "PvP";
    depthEl.textContent = { easy: 1, medium: 2, hard: 3 }[state.difficulty];
    statusTitle.textContent = state.status === "checkmate" ? "Checkmate" : state.status === "stalemate" ? "Stalemate" : state.status === "check" ? "Check" : "Playing";
    statusCopy.textContent = state.mode === "ai" ? "You play white. The AI evaluates material, control, and king safety." : "Two players share the board locally.";
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
      if (state.mode === "ai" && state.turn === "black" && state.status !== "checkmate") window.setTimeout(runAiMove, 220);
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
})();
