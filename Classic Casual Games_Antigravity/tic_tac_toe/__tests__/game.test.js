require('../script/state.js');
require('../script/game.js');

describe('TicTacToeGame', () => {
  const { getEmptyIndexes, getResult, applyMove } = window.TicTacToeGame;

  let board;

  beforeEach(() => {
    board = Array(9).fill("");
  });

  describe('getEmptyIndexes', () => {
    test('should return all indexes for empty board', () => {
      const empty = getEmptyIndexes(board);
      expect(empty).toHaveLength(9);
      expect(empty).toEqual([0,1,2,3,4,5,6,7,8]);
    });

    test('should return only empty indexes', () => {
      board[0] = "X";
      board[4] = "O";
      board[8] = "X";
      const empty = getEmptyIndexes(board);
      expect(empty).toHaveLength(6);
      expect(empty).toEqual([1,2,3,5,6,7]);
    });

    test('should return empty array if full', () => {
      board.fill("X");
      const empty = getEmptyIndexes(board);
      expect(empty).toHaveLength(0);
    });
  });

  describe('getResult', () => {
    test('should return null if game is ongoing', () => {
      board[0] = "X";
      expect(getResult(board)).toBeNull();
    });

    test('should return winner and combo for horizontal win', () => {
      board[0] = board[1] = board[2] = "X";
      const res = getResult(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe("X");
      expect(res.combo).toEqual([0, 1, 2]);
    });

    test('should return winner and combo for vertical win', () => {
      board[1] = board[4] = board[7] = "O";
      const res = getResult(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe("O");
      expect(res.combo).toEqual([1, 4, 7]);
    });

    test('should return winner and combo for diagonal win', () => {
      board[2] = board[4] = board[6] = "X";
      const res = getResult(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe("X");
      expect(res.combo).toEqual([2, 4, 6]);
    });

    test('should return draw if board is full without winner', () => {
      board = ["X", "O", "X", 
               "X", "O", "O", 
               "O", "X", "X"];
      const res = getResult(board);
      expect(res).not.toBeNull();
      expect(res.winner).toBe("draw");
      expect(res.combo).toEqual([]);
    });
  });

  describe('applyMove', () => {
    test('should update board and return result', () => {
      const state = { board: [...board] };
      const res = applyMove(state, 0, "X");
      
      expect(state.board[0]).toBe("X");
      expect(res).toBeNull();
    });

    test('should return winning result if move wins the game', () => {
      const state = { board: ["X", "X", "", "", "", "", "", "", ""] };
      const res = applyMove(state, 2, "X");
      
      expect(res).not.toBeNull();
      expect(res.winner).toBe("X");
      expect(res.combo).toEqual([0, 1, 2]);
    });
  });
});
