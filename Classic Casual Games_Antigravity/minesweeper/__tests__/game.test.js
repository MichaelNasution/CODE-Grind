require('../../shared/scripts/utils.js');
require('../script/game.js');

describe('MinesweeperGame', () => {
  const { createBoard, neighbors, reveal, toggleFlag } = window.MinesweeperGame;

  let state;

  beforeEach(() => {
    state = {
      rows: 3,
      cols: 3,
      mines: 2,
      board: [],
      revealed: 0,
      flags: 0,
      status: "ready"
    };
  });

  describe('createBoard', () => {
    test('should initialize board with correct length', () => {
      createBoard(state);
      expect(state.board).toHaveLength(9);
    });

    test('should place correct number of mines', () => {
      createBoard(state);
      const mines = state.board.filter(t => t.mine);
      expect(mines).toHaveLength(2);
    });

    test('should not place mine at safeIndex', () => {
      // Create board many times to ensure safeIndex is always respected
      for (let i = 0; i < 10; i++) {
        createBoard(state, 4);
        expect(state.board[4].mine).toBe(false);
      }
    });

    test('should calculate correct neighbor counts', () => {
      // Mock random to predictably place mines at 0 and 1
      let randCount = 0;
      window.GameKit.randomInt = jest.fn(() => randCount++);
      createBoard(state);
      // Mines are at 0 and 1
      // Board:
      // X X .
      // . . .
      // . . .
      expect(state.board[2].count).toBe(1); // sees 1
      expect(state.board[3].count).toBe(2); // sees 0 and 1
      expect(state.board[4].count).toBe(2); // sees 0 and 1
      expect(state.board[5].count).toBe(1); // sees 1
    });
  });

  describe('neighbors', () => {
    test('should return correct neighbors for corner', () => {
      // 0  1  2
      // 3  4  5
      // 6  7  8
      // Neighbors of 0: 1, 3, 4
      const n = neighbors(state, 0);
      expect(n.sort()).toEqual([1, 3, 4]);
    });

    test('should return correct neighbors for center', () => {
      const n = neighbors(state, 4);
      expect(n.sort()).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
    });
  });

  describe('toggleFlag', () => {
    test('should toggle flag and update flag count', () => {
      createBoard(state);
      expect(state.board[0].flagged).toBe(false);
      toggleFlag(state, 0);
      expect(state.board[0].flagged).toBe(true);
      expect(state.flags).toBe(1);
      
      toggleFlag(state, 0);
      expect(state.board[0].flagged).toBe(false);
      expect(state.flags).toBe(0);
    });

    test('should not toggle if already revealed or game over', () => {
      createBoard(state);
      state.board[0].revealed = true;
      toggleFlag(state, 0);
      expect(state.board[0].flagged).toBe(false);

      state.status = 'won';
      toggleFlag(state, 1);
      expect(state.board[1].flagged).toBe(false);
    });
  });

  describe('reveal', () => {
    test('should create board if empty', () => {
      const changed = reveal(state, 4);
      expect(state.board).toHaveLength(9);
      expect(changed).toContain(4);
    });

    test('should recreate board if first click is a mine (status ready)', () => {
      state.board = Array(9).fill(0).map((_, i) => ({
          index: i, mine: i===0, revealed: false, count: 0
      }));
      // First click on mine 0
      reveal(state, 0);
      // It should recreate board avoiding index 0
      expect(state.board[0].mine).toBe(false);
    });

    test('should reveal single tile if count > 0', () => {
      state.board = Array(9).fill(0).map((_, i) => ({
          index: i, mine: i===8, revealed: false, count: 1
      }));
      const changed = reveal(state, 0);
      expect(changed).toEqual([0]);
      expect(state.board[0].revealed).toBe(true);
      expect(state.revealed).toBe(1);
    });

    test('should flood fill if count === 0', () => {
      // Board:
      // . . .
      // . . M
      // M M M
      state.board = Array(9).fill(0).map((_, i) => ({
          index: i, 
          mine: [5,6,7,8].includes(i), 
          revealed: false, 
          flagged: false,
          count: [5,6,7,8].includes(i) ? 0 : ([0,1].includes(i) ? 0 : 2)
      }));
      // 0 and 1 have 0 mines adjacent (wait, no. Let's just fake counts to test queue logic)
      state.board[0].count = 0;
      state.board[1].count = 0;
      state.board[2].count = 1;
      state.board[3].count = 1;
      state.board[4].count = 1;

      // Click 0
      const changed = reveal(state, 0);
      
      // 0 adds neighbors 1, 3, 4
      // 1 adds neighbors 0(rev), 2, 3(queued), 4(queued), 5(mine)
      expect(changed.sort()).toEqual([0, 1, 2, 3, 4]);
    });

    test('should set status to lost if clicking a mine (not ready state)', () => {
      state.status = 'playing';
      state.board = Array(9).fill(0).map((_, i) => ({
          index: i, mine: i===0, revealed: false, count: 0
      }));
      
      reveal(state, 0);
      expect(state.status).toBe('lost');
    });

    test('should set status to won if all non-mines revealed', () => {
      state.status = 'playing';
      state.mines = 1; // 8 safe tiles
      state.board = Array(9).fill(0).map((_, i) => ({
          index: i, mine: i===8, revealed: i>0 && i<8, count: 1
      }));
      
      // manually reveal 7 tiles (1 to 7)
      state.revealed = 7;
      
      // reveal the 8th safe tile (index 0)
      reveal(state, 0);
      
      expect(state.status).toBe('won');
    });

    test('should not reveal flagged tiles', () => {
      state.status = 'playing';
      state.board = Array(9).fill(0).map((_, i) => ({
          index: i, mine: false, revealed: false, count: 0, flagged: i===0
      }));
      
      const changed = reveal(state, 0);
      expect(changed).toEqual([]);
      expect(state.board[0].revealed).toBe(false);
    });
  });
});
