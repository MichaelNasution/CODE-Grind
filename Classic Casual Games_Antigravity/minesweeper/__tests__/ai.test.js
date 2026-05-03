require('../script/ai.js');

describe('MinesweeperAI', () => {
  const { chooseTile } = window.MinesweeperAI;

  let state;

  beforeEach(() => {
    window.GameKit = {
      randomInt: jest.fn((min, max) => min)
    };
    
    window.MinesweeperGame = {
      neighbors: jest.fn((state, idx) => {
        // Simplified neighbors mock for a 3x3
        const n = [];
        for(let i=0; i<9; i++) if(i!==idx) n.push(i);
        return n;
      })
    };

    state = {
      difficulty: 'easy',
      board: Array(9).fill(0).map((_, i) => ({
        index: i,
        revealed: false,
        flagged: false,
        count: 0
      }))
    };
  });

  test('should return undefined if no hidden tiles', () => {
    state.board.forEach(t => t.revealed = true);
    expect(chooseTile(state)).toBeUndefined();
  });

  describe('easy difficulty', () => {
    test('should return random hidden tile', () => {
      // GameKit.randomInt returns min (0), so it should pick the first hidden tile
      expect(chooseTile(state)).toBe(0);

      state.board[0].revealed = true;
      expect(chooseTile(state)).toBe(1);
    });
  });

  describe('medium difficulty', () => {
    test('should find safe tile by neighbor counts', () => {
      state.difficulty = 'medium';
      
      // Setup a scenario where a tile is revealed, count is 1, and 1 flag exists around it.
      // So all other unrevealed neighbors are safe.
      state.board[4].revealed = true;
      state.board[4].count = 1;
      
      state.board[0].flagged = true; // Flag meets the count
      
      // All other tiles are hidden and unflagged. findSafeByNeighborCounts should find index 1 as safe.
      const move = chooseTile(state);
      expect(move).not.toBeUndefined();
      expect(move).not.toBe(0); // 0 is flagged
      expect(move).not.toBe(4); // 4 is revealed
    });

    test('should fallback to random if no safe tile found', () => {
      state.difficulty = 'medium';
      // No revealed tiles
      expect(chooseTile(state)).toBe(0);
    });
  });

  describe('hard difficulty', () => {
    test('should find safe tile by neighbor counts', () => {
      state.difficulty = 'hard';
      state.board[4].revealed = true;
      state.board[4].count = 1;
      state.board[0].flagged = true;
      
      expect(chooseTile(state)).not.toBeUndefined();
    });

    test('should fallback to lowest risk tile if no safe tile found', () => {
      state.difficulty = 'hard';
      // Setup: 4 is revealed, count 2. No flags. No 100% safe tiles.
      // 0, 1, 2, 3, 5, 6, 7, 8 are hidden.
      // Let's make tile 1 have fewer visible neighbors or lower risk than others.
      // Actually, all hidden tiles have tile 4 as visible neighbor.
      state.board[4].revealed = true;
      state.board[4].count = 2;

      // Make 8 have another visible neighbor (7) with count 1
      state.board[7].revealed = true;
      state.board[7].count = 1;

      window.MinesweeperGame.neighbors = jest.fn((state, idx) => {
        if (idx === 8) return [4, 7];
        return [4];
      });

      // Risk of 0: visible neighbors = [4]. Risk = 2 / 1 = 2
      // Risk of 8: visible neighbors = [4, 7]. Risk = (2+1) / 2 = 1.5
      // 8 has lower risk!
      expect(chooseTile(state)).toBe(8);
    });
  });
});
