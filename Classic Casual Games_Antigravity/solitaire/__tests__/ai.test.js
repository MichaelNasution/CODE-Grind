require('../script/game.js');
require('../script/ai.js');

describe('SolitaireAI', () => {
  const { findMove } = window.SolitaireAI;

  let state;

  beforeEach(() => {
    window.GameKit = {
      randomInt: jest.fn((min, max) => min) // returns first choice
    };

    state = {
      difficulty: 'easy',
      stock: [],
      waste: [],
      foundations: { hearts: [], diamonds: [], clubs: [], spades: [] },
      tableau: Array.from({ length: 7 }, () => [])
    };
  });

  describe('easy difficulty', () => {
    test('should return random move', () => {
      // With empty board, only valid move is draw
      expect(findMove(state)).toEqual({ type: 'draw' });
    });
  });

  describe('medium difficulty', () => {
    test('should prefer foundation moves over tableau moves', () => {
      state.difficulty = 'medium';
      
      // Setup a foundation move
      state.waste = [{ suit: 'hearts', value: 1 }]; // Ace of Hearts
      
      // Setup a tableau move
      state.tableau[0] = [{ suit: 'hearts', value: 2, faceUp: true, color: 'red' }];
      state.tableau[1] = [{ suit: 'spades', value: 3, faceUp: true, color: 'black' }];
      // 2 of Hearts can move to 3 of Spades

      const move = findMove(state);
      expect(move).toEqual({ type: 'waste-foundation', suit: 'hearts' });
    });

    test('should prefer tableau moves over draw', () => {
      state.difficulty = 'medium';
      
      // Setup a tableau move
      state.tableau[0] = [{ suit: 'hearts', value: 2, faceUp: true, color: 'red' }];
      state.tableau[1] = [{ suit: 'spades', value: 3, faceUp: true, color: 'black' }];

      const move = findMove(state);
      expect(move).toEqual({ type: 'tableau-tableau', from: 0, to: 1, count: 1 });
    });

    test('should fallback to draw', () => {
      state.difficulty = 'medium';
      expect(findMove(state)).toEqual({ type: 'draw' });
    });
  });

  describe('hard difficulty', () => {
    test('should always prioritize foundation move first', () => {
      state.difficulty = 'hard';
      state.waste = [{ suit: 'hearts', value: 1 }];
      expect(findMove(state)).toEqual({ type: 'waste-foundation', suit: 'hearts' });
    });

    test('should fallback to tableau moves', () => {
      state.difficulty = 'hard';
      state.tableau[0] = [{ suit: 'hearts', value: 2, faceUp: true, color: 'red' }];
      state.tableau[1] = [{ suit: 'spades', value: 3, faceUp: true, color: 'black' }];
      expect(findMove(state)).toEqual({ type: 'tableau-tableau', from: 0, to: 1, count: 1 });
    });
  });

  describe('Move generators', () => {
    test('should detect tableau to foundation', () => {
      state.difficulty = 'hard';
      state.tableau[0] = [{ suit: 'hearts', value: 1, faceUp: true }];
      
      const move = findMove(state);
      expect(move).toEqual({ type: 'tableau-foundation', from: 0, suit: 'hearts' });
    });

    test('should detect waste to tableau', () => {
      state.difficulty = 'hard';
      state.waste = [{ suit: 'hearts', value: 2, color: 'red', faceUp: true }];
      state.tableau[0] = [{ suit: 'spades', value: 3, color: 'black', faceUp: true }];
      
      const move = findMove(state);
      expect(move).toEqual({ type: 'waste-tableau', to: 0 });
    });
  });
});
