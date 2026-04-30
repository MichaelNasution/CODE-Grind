(function () {
  "use strict";

  const STORAGE_KEY = "chess";
  let state = loadState();
  const boardEl = GameKit.qs("#board");
  const turnEl = GameKit.qs("#turn");
  const modeLabel = GameKit.qs("#mode-label");
  const depthEl = GameKit.qs("#depth");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");
  const whiteCaptures = GameKit.qs("#white-captures");
  const blackCaptures = GameKit.qs("#black-captures");
  let dragFrom = null;
  let suppressClick = false;

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
      square.addEventListener("pointerdown", (event) => onPointerDown(event, index));
      square.addEventListener("pointerup", (event) => onPointerUp(event, index));
      square.addEventListener("pointercancel", onPointerCancel);
      square.addEventListener("click", () => onSquare(index));
      boardEl.appendChild(square);
    });
    turnEl.textContent = state.turn === "white" ? "White" : "Black";
    modeLabel.textContent = state.mode === "ai" ? "AI" : "PvP";
    depthEl.textContent = { easy: 1, medium: 2, hard: 3 }[state.difficulty];
    statusTitle.textContent = state.status === "checkmate" ? "Checkmate" : state.status === "stalemate" ? "Stalemate" : state.status === "check" ? "Check" : "Playing";
    statusCopy.textContent = statusMessage();
    renderCaptures();
    saveState();
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


  function onPointerDown(event, index) {
    if (dragFrom !== null) return;
    if (state.status === "checkmate" || state.status === "stalemate") return;
    if (state.mode === "ai" && state.turn === "black") return;
    const piece = state.board[index];
    if (!piece || piece.color !== state.turn) return;
    dragFrom = index;
    state.selected = index;
    state.legalMoves = window.ChessGame.legalMoves(state, index);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    render();
  }

  function onPointerUp(event, index) {
    if (dragFrom === null) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const from = dragFrom;
    dragFrom = null;
    suppressClick = true;
    const dropIndex = resolveDropIndex(event, index);
    if (dropIndex === from) return;
    const move = window.ChessGame.legalMoves(state, from).find((candidate) => candidate.to === dropIndex);
    if (!move) return;
    window.ChessGame.applyMove(state, { from, to: dropIndex, promotion: move.promotion });
    state.selected = null;
    state.legalMoves = [];
    GameKit.playClick();
    render();
    if (state.mode === "ai" && state.turn === "black" && state.status !== "checkmate") window.setTimeout(runAiMove, 260);
  }

  function onPointerCancel() {
    dragFrom = null;
  }

  function onSquare(index) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
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

  function resolveDropIndex(event, fallbackIndex) {
    const touchPoint = event.changedTouches?.[0];
    const x = touchPoint ? touchPoint.clientX : event.clientX;
    const y = touchPoint ? touchPoint.clientY : event.clientY;
    if (typeof x === "number" && typeof y === "number") {
      const hit = document.elementFromPoint(x, y);
      const square = hit?.closest?.(".chess-square");
      const parsed = Number.parseInt(square?.dataset?.index ?? "", 10);
      if (Number.isInteger(parsed)) return parsed;
    }
    return fallbackIndex;
  }

  function loadState() {
    const fallback = window.ChessState.create();
    const persisted = GameKit.loadScore(STORAGE_KEY, {});
    if (!persisted || !Array.isArray(persisted.board) || persisted.board.length !== 64) return fallback;
    const next = window.ChessState.create();
    next.board = persisted.board.map((piece) => {
      if (!piece || typeof piece !== "object") return null;
      if (!piece.color || !piece.type) return null;
      return { color: piece.color, type: piece.type };
    });
    next.turn = persisted.turn === "black" ? "black" : "white";
    next.mode = persisted.mode === "local" ? "local" : "ai";
    next.difficulty = ["easy", "medium", "hard"].includes(persisted.difficulty) ? persisted.difficulty : "medium";
    next.selected = Number.isInteger(persisted.selected) ? persisted.selected : null;
    next.legalMoves = Array.isArray(persisted.legalMoves) ? persisted.legalMoves.filter((move) => Number.isInteger(move?.to)) : [];
    next.lastMove = persisted.lastMove && Number.isInteger(persisted.lastMove.from) && Number.isInteger(persisted.lastMove.to)
      ? { from: persisted.lastMove.from, to: persisted.lastMove.to, promotion: persisted.lastMove.promotion ?? null }
      : null;
    next.status = ["playing", "check", "checkmate", "stalemate"].includes(persisted.status) ? persisted.status : "playing";
    next.captured = {
      white: normalizeCaptured(persisted?.captured?.white),
      black: normalizeCaptured(persisted?.captured?.black),
    };
    return next;
  }

  function saveState() {
    GameKit.saveScore(STORAGE_KEY, {
      board: state.board,
      turn: state.turn,
      mode: state.mode,
      difficulty: state.difficulty,
      selected: state.selected,
      legalMoves: state.legalMoves,
      lastMove: state.lastMove,
      captured: state.captured,
      status: state.status,
    });
  }

  function normalizeCaptured(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((piece) => piece && piece.color && piece.type)
      .map((piece) => ({ color: piece.color, type: piece.type }));
  }
})();
