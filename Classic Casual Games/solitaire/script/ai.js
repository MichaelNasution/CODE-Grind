(function () {
  "use strict";

  function findMove(state) {
    const foundationMove = foundationMoves(state)[0];
    if (state.difficulty === "hard" && foundationMove) return foundationMove;
    const tableauMove = tableauMoves(state)[0];
    if (state.difficulty === "medium") return foundationMove || tableauMove || { type: "draw" };
    const moves = [...foundationMoves(state), ...tableauMoves(state), { type: "draw" }];
    return moves[GameKit.randomInt(0, moves.length - 1)];
  }

  function foundationMoves(state) {
    const moves = [];
    const waste = state.waste[state.waste.length - 1];
    if (waste && window.SolitaireGame.canMoveToFoundation(waste, state.foundations[waste.suit])) {
      moves.push({ type: "waste-foundation", suit: waste.suit });
    }
    state.tableau.forEach((pile, index) => {
      const card = pile[pile.length - 1];
      if (card?.faceUp && window.SolitaireGame.canMoveToFoundation(card, state.foundations[card.suit])) {
        moves.push({ type: "tableau-foundation", from: index, suit: card.suit });
      }
    });
    return moves;
  }

  function tableauMoves(state) {
    const moves = [];
    const waste = state.waste[state.waste.length - 1];
    if (waste) {
      state.tableau.forEach((pile, to) => {
        if (window.SolitaireGame.canMoveToTableau(waste, pile)) moves.push({ type: "waste-tableau", to });
      });
    }
    state.tableau.forEach((source, from) => {
      source.forEach((card, cardIndex) => {
        if (!card.faceUp) return;
        const stack = source.slice(cardIndex);
        state.tableau.forEach((target, to) => {
          if (from !== to && window.SolitaireGame.canMoveToTableau(stack[0], target)) moves.push({ type: "tableau-tableau", from, to, count: stack.length });
        });
      });
    });
    return moves;
  }

  window.SolitaireAI = { findMove };
})();
