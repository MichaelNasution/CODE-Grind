(function () {
  "use strict";

  let state = window.SolitaireState.create();
  const tableauEl = GameKit.qs("#tableau");
  const foundationsEl = GameKit.qs("#foundations");
  const wasteEl = GameKit.qs("#waste");
  const stockEl = GameKit.qs("#stock");
  const scoreEl = GameKit.qs("#score");
  const movesEl = GameKit.qs("#moves");
  const bestEl = GameKit.qs("#best");
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");
  let dragPayload = null;

  boot();

  function boot() {
    wireControls();
    newGame();
  }

  function wireControls() {
    GameKit.qs("#new-game").addEventListener("click", newGame);
    GameKit.qs("#ai-move").addEventListener("click", runAiMove);
    GameKit.qs("#auto-stack").addEventListener("click", autoStack);
    stockEl.addEventListener("click", () => {
      window.SolitaireGame.drawStock(state);
      render();
    });
    GameKit.qsa("[data-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      GameKit.setPressed(GameKit.qsa("[data-mode]"), state.mode, "mode");
    }));
    GameKit.qsa("[data-difficulty]").forEach((button) => button.addEventListener("click", () => {
      state.difficulty = button.dataset.difficulty;
      GameKit.setPressed(GameKit.qsa("[data-difficulty]"), state.difficulty, "difficulty");
    }));
  }

  function newGame() {
    const mode = state.mode;
    const difficulty = state.difficulty;
    state = window.SolitaireState.create();
    state.mode = mode;
    state.difficulty = difficulty;
    window.SolitaireGame.deal(state);
    render();
  }

  function render() {
    foundationsEl.innerHTML = "";
    Object.keys(state.foundations).forEach((suit) => foundationsEl.appendChild(renderPile("foundation", suit, state.foundations[suit])));
    renderWaste();
    renderTableau();
    scoreEl.textContent = state.score;
    movesEl.textContent = state.moves;
    bestEl.textContent = state.best;
    statusTitle.textContent = window.SolitaireGame.isWon(state) ? "Completed" : "Playing";
    statusCopy.textContent = state.mode === "ai" ? `AI assist uses ${state.difficulty} move ranking.` : "Drag cards to highlighted legal piles.";
  }

  function renderWaste() {
    wasteEl.innerHTML = "";
    const card = state.waste[state.waste.length - 1];
    if (card) wasteEl.appendChild(renderCard(card, { type: "waste" }));
  }

  function renderTableau() {
    tableauEl.innerHTML = "";
    state.tableau.forEach((pile, pileIndex) => {
      const el = document.createElement("div");
      el.className = "tableau-pile";
      el.dataset.tableau = pileIndex;
      wireDrop(el, { type: "tableau", index: pileIndex });
      pile.forEach((card, cardIndex) => {
        const cardEl = renderCard(card, { type: "tableau", pileIndex, cardIndex });
        cardEl.style.top = `${cardIndex * 28}px`;
        el.appendChild(cardEl);
      });
      tableauEl.appendChild(el);
    });
  }

  function renderPile(type, key, pile) {
    const el = document.createElement("div");
    el.className = "pile";
    el.dataset[type] = key;
    wireDrop(el, { type, key });
    const top = pile[pile.length - 1];
    el.textContent = top ? "" : key[0].toUpperCase();
    if (top) el.appendChild(renderCard(top, { type: "foundation", key }));
    return el;
  }

  function renderCard(card, source) {
    const el = document.createElement("div");
    el.className = `playing-card ${card.color === "red" ? "red" : ""} ${card.faceUp ? "" : "face-down"}`;
    el.textContent = card.faceUp ? `${card.rank}\n${symbol(card.suit)}` : "";
    el.draggable = card.faceUp;
    el.addEventListener("dragstart", () => {
      dragPayload = source;
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", () => {
      dragPayload = null;
      GameKit.qsa(".valid-target").forEach((target) => target.classList.remove("valid-target"));
    });
    return el;
  }

  function wireDrop(el, target) {
    el.addEventListener("dragover", (event) => {
      if (dragPayload && canDrop(target)) {
        event.preventDefault();
        el.classList.add("valid-target");
      }
    });
    el.addEventListener("dragleave", () => el.classList.remove("valid-target"));
    el.addEventListener("drop", (event) => {
      event.preventDefault();
      if (dragPayload && canDrop(target)) applyDrop(target);
      render();
    });
  }

  function canDrop(target) {
    const moving = getMovingCards()[0];
    if (!moving) return false;
    if (target.type === "foundation") return getMovingCards().length === 1 && window.SolitaireGame.canMoveToFoundation(moving, state.foundations[target.key]);
    if (target.type === "tableau") return window.SolitaireGame.canMoveToTableau(moving, state.tableau[target.index]);
    return false;
  }

  function applyDrop(target) {
    const source = getSourcePile();
    const count = getMovingCards().length;
    const dest = target.type === "foundation" ? state.foundations[target.key] : state.tableau[target.index];
    window.SolitaireGame.moveCard(source, dest, count, state);
    finishCheck();
  }

  function getMovingCards() {
    if (!dragPayload) return [];
    if (dragPayload.type === "waste") return state.waste.slice(-1);
    if (dragPayload.type === "foundation") return state.foundations[dragPayload.key].slice(-1);
    return state.tableau[dragPayload.pileIndex].slice(dragPayload.cardIndex);
  }

  function getSourcePile() {
    if (dragPayload.type === "waste") return state.waste;
    if (dragPayload.type === "foundation") return state.foundations[dragPayload.key];
    return state.tableau[dragPayload.pileIndex];
  }

  function runAiMove() {
    applyAiMove(window.SolitaireAI.findMove(state));
    render();
  }

  function autoStack() {
    let moved = true;
    while (moved) moved = applyAiMove(window.SolitaireAI.findMove({ ...state, difficulty: "hard" }), true);
    render();
  }

  function applyAiMove(move, foundationOnly = false) {
    if (!move || (foundationOnly && !move.type.includes("foundation"))) return false;
    if (move.type === "draw") window.SolitaireGame.drawStock(state);
    if (move.type === "waste-foundation") window.SolitaireGame.moveWasteToFoundation(state, move.suit);
    if (move.type === "tableau-foundation") window.SolitaireGame.moveCard(state.tableau[move.from], state.foundations[move.suit], 1, state);
    if (move.type === "waste-tableau") window.SolitaireGame.moveCard(state.waste, state.tableau[move.to], 1, state);
    if (move.type === "tableau-tableau") window.SolitaireGame.moveCard(state.tableau[move.from], state.tableau[move.to], move.count, state);
    finishCheck();
    return true;
  }

  function finishCheck() {
    if (window.SolitaireGame.isWon(state)) {
      state.best = Math.max(state.best, state.score);
      GameKit.saveScore("solitaire", { best: state.best });
      GameKit.playWin();
    }
  }

  function symbol(suit) {
    return { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" }[suit];
  }
})();
