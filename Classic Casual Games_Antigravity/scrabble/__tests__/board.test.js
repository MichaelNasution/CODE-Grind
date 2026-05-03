require('../script/board.js');

describe('ScrabbleBoard', () => {
  const { createBoard, canPlace, place, isEmpty, getWordsFormed } = window.ScrabbleBoard;

  let board;

  beforeEach(() => {
    board = createBoard();
  });

  describe('createBoard & isEmpty', () => {
    test('createBoard should return a 15x15 empty grid', () => {
      expect(board).toHaveLength(15);
      board.forEach(row => {
        expect(row).toHaveLength(15);
        row.forEach(cell => expect(cell).toBeNull());
      });
    });

    test('isEmpty should return true for a new board', () => {
      expect(isEmpty(board)).toBe(true);
    });

    test('isEmpty should return false if board has tiles', () => {
      board[7][7] = { letter: 'A' };
      expect(isEmpty(board)).toBe(false);
    });
  });

  describe('place', () => {
    test('should place tiles on the board', () => {
      const tiles = [
        { row: 7, col: 7, tile: { letter: 'A' } },
        { row: 7, col: 8, tile: { letter: 'B' } }
      ];
      place(board, tiles);
      expect(board[7][7]).toEqual({ letter: 'A' });
      expect(board[7][8]).toEqual({ letter: 'B' });
      expect(board[7][9]).toBeNull();
    });
  });

  describe('canPlace', () => {
    test('first word must touch center (7,7)', () => {
      expect(canPlace(board, 'HI', 7, 7, 'horizontal')).toBe(true);
      expect(canPlace(board, 'HI', 0, 0, 'horizontal')).toBe(false); // Does not touch center
      expect(canPlace(board, 'HELLO', 7, 5, 'horizontal')).toBe(true); // Crosses center
    });

    test('cannot place out of bounds horizontally', () => {
      expect(canPlace(board, 'HELLO', 7, 12, 'horizontal')).toBe(false); // 12 + 5 = 17 > 15
    });

    test('cannot place out of bounds vertically', () => {
      expect(canPlace(board, 'HELLO', 12, 7, 'vertical')).toBe(false); // 12 + 5 = 17 > 15
    });

    test('subsequent words must touch existing tiles', () => {
      board[7][7] = { letter: 'H' };
      board[7][8] = { letter: 'I' };
      
      // Touching horizontally at the end
      expect(canPlace(board, 'IT', 7, 8, 'horizontal')).toBe(true); 
      // Touching perpendicularly
      expect(canPlace(board, 'IN', 7, 8, 'vertical')).toBe(true); 

      // Completely detached
      expect(canPlace(board, 'NO', 0, 0, 'horizontal')).toBe(false); 
    });

    test('must place at least one new tile', () => {
      board[7][7] = { letter: 'H' };
      board[7][8] = { letter: 'I' };
      // Word completely overlapping existing tiles without any new ones
      expect(canPlace(board, 'HI', 7, 7, 'horizontal')).toBe(false);
    });

    test('existing tiles must match the word letters', () => {
      board[7][7] = { letter: 'H' };
      board[7][8] = { letter: 'I' };
      
      // Trying to place 'HE' starting at 7,7. E != I
      expect(canPlace(board, 'HE', 7, 7, 'horizontal')).toBe(false);
    });
  });

  describe('getWordsFormed', () => {
    test('should extract primary horizontal word', () => {
      board[7][7] = { letter: 'H' };
      board[7][8] = { letter: 'I' };
      
      const newTiles = [
        { row: 7, col: 7, tile: { letter: 'H' } },
        { row: 7, col: 8, tile: { letter: 'I' } }
      ];

      const words = getWordsFormed(board, newTiles, 'horizontal');
      expect(words).toHaveLength(1);
      expect(words[0]).toHaveLength(2);
      expect(words[0][0].tile.letter).toBe('H');
      expect(words[0][1].tile.letter).toBe('I');
    });

    test('should extract cross words when placing perpendicularly', () => {
      // Setup existing word
      board[7][7] = { letter: 'H' };
      board[7][8] = { letter: 'I' };

      // We place N at 8,8 to form IN vertically
      board[8][8] = { letter: 'N' };
      const newTiles = [
        { row: 8, col: 8, tile: { letter: 'N' } }
      ];

      const words = getWordsFormed(board, newTiles, 'vertical');
      // Should find "IN" vertically. Because newTiles has length 1, it will add the primary word if length > 1
      expect(words).toHaveLength(1);
      expect(words[0]).toHaveLength(2);
      expect(words[0][0].tile.letter).toBe('I');
      expect(words[0][1].tile.letter).toBe('N');
    });

    test('should deduplicate words (negative scenario safety)', () => {
      // If the logic somehow tries to add the same word twice, it should only be one unique word array
      board[7][7] = { letter: 'A' };
      board[7][8] = { letter: 'T' };
      const newTiles = [
        { row: 7, col: 7, tile: { letter: 'A' } },
        { row: 7, col: 8, tile: { letter: 'T' } }
      ];
      // Force it to test cross check on horizontal which could hypothetically double count 
      // single horizontal primary word if it's broken, but our code uses seen.has
      const words = getWordsFormed(board, newTiles, 'horizontal');
      expect(words).toHaveLength(1);
    });
  });
});
