(function () {
  "use strict";

  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  function newDeck() {
    return GameKit.shuffle(suits.flatMap((suit) => ranks.map((rank, index) => ({
      id: `${rank}-${suit}`,
      rank,
      suit,
      value: index + 1,
      faceUp: false,
      color: suit === "hearts" || suit === "diamonds" ? "red" : "black",
    }))));
  }

  function deal(state) {
    const deck = newDeck();
    state.tableau.forEach((pile, pileIndex) => {
      for (let count = 0; count <= pileIndex; count += 1) {
        const card = deck.pop();
        card.faceUp = count === pileIndex;
        pile.push(card);
      }
    });
    state.stock = deck;
  }

  function drawStock(state) {
    if (state.stock.length) {
      const card = state.stock.pop();
      card.faceUp = true;
      state.waste.push(card);
    } else {
      state.stock = state.waste.reverse().map((card) => ({ ...card, faceUp: false }));
      state.waste = [];
    }
    state.moves += 1;
  }

  function canMoveToFoundation(card, pile) {
    if (!card) return false;
    const top = pile[pile.length - 1];
    return top ? top.suit === card.suit && card.value === top.value + 1 : card.value === 1;
  }

  function canMoveToTableau(card, pile) {
    if (!card) return false;
    const top = pile[pile.length - 1];
    return top ? top.faceUp && top.color !== card.color && card.value === top.value - 1 : card.value === 13;
  }

  function moveWasteToFoundation(state, suit) {
    const card = state.waste[state.waste.length - 1];
    if (canMoveToFoundation(card, state.foundations[suit])) return moveCard(state.waste, state.foundations[suit], 1, state);
    return false;
  }

  function moveCard(source, target, count, state) {
    const cards = source.splice(source.length - count, count);
    target.push(...cards);
    revealTop(source);
    state.moves += 1;
    state.score += target.length && Object.values(state.foundations).includes(target) ? 10 : 5;
    return true;
  }

  function revealTop(pile) {
    const top = pile[pile.length - 1];
    if (top) top.faceUp = true;
  }

  function isWon(state) {
    return Object.values(state.foundations).every((pile) => pile.length === 13);
  }

  window.SolitaireGame = { deal, drawStock, canMoveToFoundation, canMoveToTableau, moveWasteToFoundation, moveCard, revealTop, isWon };
})();
