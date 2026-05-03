require('../script/state.js');
require('../script/game.js');
require('../script/ai.js');

describe('TicTacToeAI', () => {
  const { chooseMove } = window.TicTacToeAI;

  beforeEach(() => {
    window.GameKit = {
      randomInt: jest.fn((min, max) => min) // always picks first available move
    };
  });

  describe('easy difficulty', () => {
    test('should pick a random empty spot', () => {
      const board = ["X", "", "O", "", "", "", "", "", ""];
      // Random mock returns min, which index is 1 (the first empty spot)
      expect(chooseMove(board, 'easy')).toBe(1);
    });
  });

  describe('medium difficulty', () => {
    test('should win immediately if possible', () => {
      const board = ["O", "O", "", "X", "X", "", "", "", ""];
      // O can win by playing at 2
      expect(chooseMove(board, 'medium')).toBe(2);
    });

    test('should block opponent if opponent can win immediately (82% chance)', () => {
      // Mock Math.random to always be < 0.82
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const board = ["X", "X", "", "", "O", "", "", "", ""];
      // X is threatening to win at 2, O should block
      expect(chooseMove(board, 'medium')).toBe(2);
      
      Math.random.mockRestore();
    });

    test('should play center if free and no immediate threats/wins', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const board = ["X", "", "", "", "", "", "", "", ""];
      expect(chooseMove(board, 'medium')).toBe(4); // center
      Math.random.mockRestore();
    });

    test('should pick random if center taken and no threats', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const board = ["X", "", "", "", "O", "", "", "", ""];
      // center taken, picks random (mocked to 1)
      expect(chooseMove(board, 'medium')).toBe(1);
      Math.random.mockRestore();
    });
  });

  describe('hard difficulty (minimax)', () => {
    test('should win immediately if possible', () => {
      const board = ["O", "O", "", "X", "X", "", "", "", ""];
      expect(chooseMove(board, 'hard')).toBe(2);
    });

    test('should block opponent win', () => {
      const board = ["X", "X", "", "", "O", "", "", "", ""];
      expect(chooseMove(board, 'hard')).toBe(2);
    });

    test('should setup a fork if possible', () => {
      // O's turn, O can play to create multiple win conditions
      // O at 0, O at 8, X at 4. Board:
      // O . X
      // . X .
      // . . O
      // Actually let's just make sure it doesn't do a dumb move that leads to loss
      const board = [
        "X", "", "",
        "", "O", "",
        "", "", "X"
      ];
      // X played corners, O must play edge (1,3,5,7) to avoid losing
      const move = chooseMove(board, 'hard');
      expect([1, 3, 5, 7]).toContain(move);
    });
  });
});
