require('../scripts/ai-utils.js');

describe('GameKit AI Utils', () => {
  const { minimax, alphaBeta, evaluateBoard } = window.GameKit;

  describe('minimax', () => {
    test('should return terminal score if terminal state', () => {
      const getMoves = jest.fn();
      const applyMove = jest.fn();
      const evaluate = jest.fn();
      const terminal = jest.fn().mockReturnValue(100);

      const score = minimax({}, 0, true, getMoves, applyMove, evaluate, terminal);
      expect(score).toBe(100);
      expect(getMoves).not.toHaveBeenCalled();
    });

    test('should return evaluate score if depth >= maxDepth', () => {
      const getMoves = jest.fn();
      const applyMove = jest.fn();
      const evaluate = jest.fn().mockReturnValue(50);
      const terminal = jest.fn().mockReturnValue(null);

      const score = minimax({}, 2, true, getMoves, applyMove, evaluate, terminal, 2);
      expect(score).toBe(50);
      expect(getMoves).not.toHaveBeenCalled();
    });

    test('should return evaluate score if no moves available', () => {
      const getMoves = jest.fn().mockReturnValue([]);
      const applyMove = jest.fn();
      const evaluate = jest.fn().mockReturnValue(10);
      const terminal = jest.fn().mockReturnValue(null);

      const score = minimax({}, 0, true, getMoves, applyMove, evaluate, terminal);
      expect(score).toBe(10);
    });

    test('should maximize score for maximizing player', () => {
      const getMoves = jest.fn().mockReturnValue(['A', 'B']);
      const applyMove = jest.fn((state, move) => move);
      const evaluate = jest.fn((state) => state === 'A' ? 10 : 20);
      const terminal = jest.fn().mockReturnValue(null);

      const score = minimax({}, 0, true, getMoves, applyMove, evaluate, terminal, 1);
      expect(score).toBe(20);
    });

    test('should minimize score for minimizing player', () => {
      const getMoves = jest.fn().mockReturnValue(['A', 'B']);
      const applyMove = jest.fn((state, move) => move);
      const evaluate = jest.fn((state) => state === 'A' ? 10 : 20);
      const terminal = jest.fn().mockReturnValue(null);

      const score = minimax({}, 0, false, getMoves, applyMove, evaluate, terminal, 1);
      expect(score).toBe(10);
    });
  });

  describe('alphaBeta', () => {
    test('should prune branches appropriately', () => {
      // Tree: 
      // Root (Max) -> A (Min), B (Min)
      // A -> A1(10), A2(5) => A returns 5
      // B -> B1(2), B2(20) => B should prune B2 because 2 < 5 (Alpha)
      
      const tree = {
        root: ['A', 'B'],
        A: ['A1', 'A2'],
        B: ['B1', 'B2']
      };
      const values = { A1: 10, A2: 5, B1: 2, B2: 20 };

      const getMoves = jest.fn((state) => tree[state] || []);
      const applyMove = jest.fn((state, move) => move);
      const evaluate = jest.fn((state) => values[state]);
      const terminal = jest.fn().mockReturnValue(null);

      const score = alphaBeta('root', 0, -Infinity, Infinity, true, getMoves, applyMove, evaluate, terminal, 2);
      
      expect(score).toBe(5);
      // B2 should not be evaluated because of pruning
      expect(evaluate).not.toHaveBeenCalledWith('B2', expect.anything());
    });
  });

  describe('evaluateBoard', () => {
    test('should sum weights appropriately', () => {
      const board = [
        { type: 'pawn', color: 'black' },
        { type: 'knight', color: 'white' },
        null,
        { player: 'ai' },
        { player: 'player' }
      ];
      
      const weights = { pawn: 10, knight: 30, '[object Object]': 5 }; // default object string representation if no type
      // black/ai adds score, white/player subtracts
      // pawn black: +10
      // knight white: -30
      // ai: +5
      // player: -5
      // Total: 10 - 30 + 5 - 5 = -20
      
      const score = evaluateBoard(board, weights);
      expect(score).toBe(-20);
    });
  });
});
