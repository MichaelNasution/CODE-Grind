require('../../shared/scripts/utils.js');
require('../script/game.js');

describe('SolitaireGame', () => {
  const { deal, drawStock, canMoveToFoundation, canMoveToTableau, moveWasteToFoundation, moveCard, revealTop, isWon } = window.SolitaireGame;

  let state;

  beforeEach(() => {
    state = {
      stock: [],
      waste: [],
      foundations: { hearts: [], diamonds: [], clubs: [], spades: [] },
      tableau: Array.from({ length: 7 }, () => []),
      score: 0,
      moves: 0
    };
  });

  describe('deal', () => {
    test('should deal cards to tableau and stock', () => {
      deal(state);
      
      let tableauCount = 0;
      state.tableau.forEach((pile, index) => {
        expect(pile.length).toBe(index + 1);
        expect(pile[pile.length - 1].faceUp).toBe(true); // top card is face up
        if (pile.length > 1) {
            expect(pile[0].faceUp).toBe(false); // bottom card is face down
        }
        tableauCount += pile.length;
      });
      
      expect(tableauCount).toBe(28); // 1+2+3+4+5+6+7
      expect(state.stock.length).toBe(52 - 28); // 24 cards in stock
    });
  });

  describe('drawStock', () => {
    test('should move one card from stock to waste and flip it', () => {
      state.stock = [{ id: '1', faceUp: false }];
      drawStock(state);
      
      expect(state.stock).toHaveLength(0);
      expect(state.waste).toHaveLength(1);
      expect(state.waste[0].faceUp).toBe(true);
      expect(state.moves).toBe(1);
    });

    test('should recycle waste to stock if stock is empty', () => {
      state.waste = [{ id: '1', faceUp: true }, { id: '2', faceUp: true }];
      drawStock(state);
      
      // Stock should be reversed waste, and face down
      expect(state.waste).toHaveLength(0);
      expect(state.stock).toHaveLength(2);
      expect(state.stock[0].id).toBe('2');
      expect(state.stock[0].faceUp).toBe(false);
      expect(state.stock[1].id).toBe('1');
      expect(state.stock[1].faceUp).toBe(false);
      expect(state.moves).toBe(1);
    });
  });

  describe('canMoveToFoundation', () => {
    test('should return true for Ace on empty foundation', () => {
      const card = { suit: 'hearts', value: 1 };
      expect(canMoveToFoundation(card, [])).toBe(true);
    });

    test('should return false for non-Ace on empty foundation', () => {
      const card = { suit: 'hearts', value: 2 };
      expect(canMoveToFoundation(card, [])).toBe(false);
    });

    test('should return true for next card in suit', () => {
      const pile = [{ suit: 'hearts', value: 1 }];
      const card = { suit: 'hearts', value: 2 };
      expect(canMoveToFoundation(card, pile)).toBe(true);
    });

    test('should return false for wrong suit', () => {
      const pile = [{ suit: 'hearts', value: 1 }];
      const card = { suit: 'diamonds', value: 2 };
      expect(canMoveToFoundation(card, pile)).toBe(false);
    });
  });

  describe('canMoveToTableau', () => {
    test('should return true for King on empty pile', () => {
      const card = { value: 13 };
      expect(canMoveToTableau(card, [])).toBe(true);
    });

    test('should return false for non-King on empty pile', () => {
      const card = { value: 12 };
      expect(canMoveToTableau(card, [])).toBe(false);
    });

    test('should return true for descending value, alternate color', () => {
      const pile = [{ faceUp: true, color: 'red', value: 5 }];
      const card = { color: 'black', value: 4 };
      expect(canMoveToTableau(card, pile)).toBe(true);
    });

    test('should return false for same color', () => {
      const pile = [{ faceUp: true, color: 'red', value: 5 }];
      const card = { color: 'red', value: 4 };
      expect(canMoveToTableau(card, pile)).toBe(false);
    });
  });

  describe('moveWasteToFoundation', () => {
    test('should move valid card', () => {
      state.waste = [{ suit: 'hearts', value: 1 }];
      const result = moveWasteToFoundation(state, 'hearts');
      expect(result).toBe(true);
      expect(state.foundations.hearts).toHaveLength(1);
      expect(state.waste).toHaveLength(0);
    });

    test('should return false for invalid card', () => {
      state.waste = [{ suit: 'hearts', value: 2 }]; // Needs Ace first
      const result = moveWasteToFoundation(state, 'hearts');
      expect(result).toBe(false);
      expect(state.waste).toHaveLength(1);
    });
  });

  describe('moveCard', () => {
    test('should move cards between piles, reveal new top, update score', () => {
      const source = [{ id: '1', faceUp: false }, { id: '2', faceUp: true }];
      const target = [];
      
      moveCard(source, target, 1, state);
      
      expect(source).toHaveLength(1);
      expect(source[0].faceUp).toBe(true); // newly revealed top
      expect(target).toHaveLength(1);
      expect(target[0].id).toBe('2');
      expect(state.moves).toBe(1);
      expect(state.score).toBe(5); // Not foundation
    });
  });

  describe('isWon', () => {
    test('should return true if all foundations have 13 cards', () => {
      state.foundations = {
        hearts: Array(13).fill({}),
        diamonds: Array(13).fill({}),
        clubs: Array(13).fill({}),
        spades: Array(13).fill({})
      };
      expect(isWon(state)).toBe(true);
    });

    test('should return false if any foundation is incomplete', () => {
      state.foundations = {
        hearts: Array(13).fill({}),
        diamonds: Array(12).fill({}),
        clubs: Array(13).fill({}),
        spades: Array(13).fill({})
      };
      expect(isWon(state)).toBe(false);
    });
  });
});
