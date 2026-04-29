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
  let dragFrom = null;
  let suppressClick = false;
  let aiThinking = false;

  boot();

  function boot() {
    GameKit.qs("#new-game").addEventListener("click", () => {
      const mode = state.mode;
      const difficulty = state.difficulty;
      state = window.ChessState.create();
      state.mode = mode;
      state.difficulty = difficulty;
      aiThinking = false;
      render();
    });
    GameKit.qs("#ai-move").addEventListener("click", runAiMove);
    GameKit.qsa("[data-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      GameKit.setPressed(GameKit.qsa("[data-mode]"), state.mode, "mode");
      render();
    }));
    GameKit.qsa("[data-difficulty]").forEach((button) => button.addEventListener("click", async () => {
      state.difficulty = button.dataset.difficulty;
      GameKit.setPressed(GameKit.qsa("[data-difficulty]"), state.difficulty, "difficulty");

      /* Pre-load Stockfish engine when selected */
      if (state.difficulty === "stockfish" && !window.StockfishEngine.isReady() && !window.StockfishEngine.isLoading()) {
        state.engineLoading = true;
        render();
        try {
          await window.StockfishEngine.init();
          state.engineReady = true;
        } catch (error) {
          console.error("Stockfish init failed:", error);
          state.difficulty = "hard";
          GameKit.setPressed(GameKit.qsa("[data-difficulty]"), state.difficulty, "difficulty");
        }
        state.engineLoading = false;
      }
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
      square.classList.toggle("capture-target", state.legalMoves.some((move) => move.to === index && (state.board[index] || move.enPassant)));
      square.classList.toggle("last", Boolean(state.lastMove && (state.lastMove.from === index || state.lastMove.to === index)));
      square.type = "button";
      square.dataset.index = index;
      square.setAttribute("aria-label", piece ? `${piece.color} ${piece.type} on ${squareName(index)}` : `Empty square ${squareName(index)}`);
      if (aiThinking) square.disabled = true;
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

    /* Thinking overlay */
    if (aiThinking) {
      boardEl.classList.add("thinking");
    } else {
      boardEl.classList.remove("thinking");
    }

    turnEl.textContent = state.turn === "white" ? "White" : "Black";
    modeLabel.textContent = state.mode === "ai" ? "AI" : "PvP";
    depthEl.textContent = state.difficulty === "stockfish" ? "SF" : { easy: 1, medium: 2, hard: 3 }[state.difficulty];
    statusTitle.textContent = aiThinking
      ? (state.difficulty === "stockfish" ? "Stockfish Thinking…" : "AI Thinking…")
      : state.status === "checkmate" ? "Checkmate"
      : state.status === "stalemate" ? "Stalemate"
      : state.status === "check" ? "Check"
      : state.engineLoading ? "Loading Stockfish…"
      : "Playing";
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
    if (state.engineLoading) return "Downloading Stockfish NNUE engine (~2.5 MB)… This only happens once.";
    if (aiThinking) {
      return state.difficulty === "stockfish"
        ? "Stockfish 16 NNUE is analyzing the position at depth 15…"
        : "Built-in AI is calculating…";
    }
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
    if (aiThinking) return;
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
    if (index === from) return;
    executeMove(from, index);
  }

  function onPointerCancel() {
    dragFrom = null;
  }

  function onSquare(index) {
    if (aiThinking) return;
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (state.status === "checkmate" || state.status === "stalemate") return;
    if (state.mode === "ai" && state.turn === "black") return;
    const piece = state.board[index];
    const chosenMove = state.legalMoves.find((move) => move.to === index);
    if (chosenMove && state.selected !== null) {
      executeMove(state.selected, index);
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

  function executeMove(from, to) {
    const move = window.ChessGame.legalMoves(state, from).find((m) => m.to === to);
    if (!move) return;
    window.ChessGame.applyMove(state, { from, ...move });
    state.selected = null;
    state.legalMoves = [];
    GameKit.playClick();
    render();
    if (state.mode === "ai" && state.turn === "black" && state.status !== "checkmate" && state.status !== "stalemate") {
      window.setTimeout(runAiMove, 260);
    }
  }

  async function runAiMove() {
    if (state.turn !== "black") return;
    if (aiThinking) return;

    aiThinking = true;
    render();

    try {
      const move = await window.ChessAI.chooseMoveAsync(state);
      if (move) {
        window.ChessGame.applyMove(state, move);
        GameKit.playClick();
      }
    } catch (error) {
      console.error("AI move error:", error);
      /* Fallback to built-in AI */
      const fallback = window.ChessAI.chooseMove(state);
      if (fallback) {
        window.ChessGame.applyMove(state, fallback);
        GameKit.playClick();
      }
    }

    aiThinking = false;
    render();
  }

  function squareName(index) {
    return `${"abcdefgh"[index % 8]}${8 - Math.floor(index / 8)}`;
  }
})();
