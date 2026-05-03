require('../script/game.js');

describe('ScrabbleGame', () => {
  const { buildPlacement, playWord } = window.ScrabbleGame;

  let state;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    window.ScrabbleBoard = {
      canPlace: jest.fn(),
      place: jest.fn(),
      getWordsFormed: jest.fn(),
    };
    
    window.ScrabbleDictionary = {
      isValid: jest.fn(),
    };

    window.ScrabbleScoring = {
      scorePlacement: jest.fn(),
    };

    window.ScrabbleRack = {
      removeTiles: jest.fn(),
      drawTiles: jest.fn(),
    };

    state = {
      board: Array.from({ length: 15 }, () => Array(15).fill(null)),
      racks: {
        player: [
          { id: 'H-1', letter: 'H', isBlank: false, value: 4 },
          { id: 'I-2', letter: 'I', isBlank: false, value: 1 },
          { id: 'BLANK-1', letter: ' ', isBlank: true, value: 0 }
        ],
        ai: []
      },
      scores: { player: 0, ai: 0 },
      bag: [{ id: 'X-1', letter: 'X' }],
      turn: 'player'
    };
  });

  describe('buildPlacement', () => {
    test('should build a valid placement object', () => {
      // Mocking getWordsFormed to return a mock word array
      window.ScrabbleBoard.getWordsFormed.mockReturnValue([[{ tile: { letter: 'H' } }, { tile: { letter: 'I' } }]]);
      window.ScrabbleDictionary.isValid.mockReturnValue(true);
      window.ScrabbleScoring.scorePlacement.mockReturnValue(15);

      const placement = buildPlacement(state, 'player', 'HI', 7, 7, 'horizontal');

      expect(placement).not.toBeNull();
      expect(placement.word).toBe('HI');
      expect(placement.tiles).toHaveLength(2);
      expect(placement.usedIds).toEqual(['H-1', 'I-2']);
      expect(placement.invalidWords).toEqual([]);
      expect(placement.score).toBe(15);
      expect(window.ScrabbleBoard.place).toHaveBeenCalled(); // temporarily places on temp board
    });

    test('should return null if rack lacks required letters', () => {
      const placement = buildPlacement(state, 'player', 'HELLO', 7, 7, 'horizontal');
      expect(placement).toBeNull();
    });

    test('should utilize blank tiles correctly', () => {
      // Rack has 'H', 'I', ' '. Word: 'HIT' (T uses blank)
      window.ScrabbleBoard.getWordsFormed.mockReturnValue([[{ tile: { letter: 'H' } }, { tile: { letter: 'I' } }, { tile: { letter: 'T' } }]]);
      window.ScrabbleDictionary.isValid.mockReturnValue(true);

      const placement = buildPlacement(state, 'player', 'HIT', 7, 7, 'horizontal');

      expect(placement).not.toBeNull();
      expect(placement.usedIds).toContain('BLANK-1');
      // The placed tile should have letter T but value 0
      const blankTilePlaced = placement.tiles.find(t => t.tile.id === 'BLANK-1');
      expect(blankTilePlaced.tile.letter).toBe('T');
      expect(blankTilePlaced.tile.value).toBe(0); // inherits value 0 from blank
    });

    test('should detect invalid dictionary words', () => {
      window.ScrabbleBoard.getWordsFormed.mockReturnValue([[{ tile: { letter: 'H' } }, { tile: { letter: 'Z' } }]]);
      window.ScrabbleDictionary.isValid.mockReturnValue(false); // 'HZ' is invalid
      
      // Assume rack had 'Z' for a moment to pass letter check
      state.racks.player.push({ id: 'Z-1', letter: 'Z', isBlank: false, value: 10 });
      
      const placement = buildPlacement(state, 'player', 'HZ', 7, 7, 'horizontal');

      expect(placement.invalidWords).toEqual(['HZ']);
      expect(placement.score).toBe(0);
    });

    test('should skip tiles already on the board', () => {
      state.board[7][7] = { letter: 'H' };
      window.ScrabbleBoard.getWordsFormed.mockReturnValue([[{ tile: { letter: 'H' } }, { tile: { letter: 'I' } }]]);
      window.ScrabbleDictionary.isValid.mockReturnValue(true);

      const placement = buildPlacement(state, 'player', 'HI', 7, 7, 'horizontal');

      expect(placement).not.toBeNull();
      // It only needed 'I' from the rack
      expect(placement.usedIds).toEqual(['I-2']);
      expect(placement.tiles).toHaveLength(1); // Only 1 new tile to place
    });

    test('should return null if trying to overlap mismatched tile', () => {
      state.board[7][7] = { letter: 'Z' }; // Mismatch
      const placement = buildPlacement(state, 'player', 'HI', 7, 7, 'horizontal');
      expect(placement).toBeNull();
    });

    test('should return null if out of bounds', () => {
      const placement = buildPlacement(state, 'player', 'HI', 15, 15, 'horizontal');
      expect(placement).toBeNull();
    });
  });

  describe('playWord', () => {
    test('should reject if canPlace returns false', () => {
      window.ScrabbleBoard.canPlace.mockReturnValue(false);
      const res = playWord(state, 'player', 'HI', 7, 7, 'horizontal');
      
      expect(res.ok).toBe(false);
      expect(res.reason).toMatch(/fit or connect legally/);
      expect(window.ScrabbleRack.removeTiles).not.toHaveBeenCalled();
    });

    test('should reject if placement is null (missing rack tiles)', () => {
      window.ScrabbleBoard.canPlace.mockReturnValue(true);
      // Rack lacks enough letters (only has H, I, and one blank)
      const res = playWord(state, 'player', 'HZZQ', 7, 7, 'horizontal');
      
      expect(res.ok).toBe(false);
      expect(res.reason).toMatch(/rack does not contain/);
    });

    test('should reject if dictionary words are invalid', () => {
      window.ScrabbleBoard.canPlace.mockReturnValue(true);
      state.racks.player.push({ id: 'Z-1', letter: 'Z', isBlank: false, value: 10 });
      window.ScrabbleBoard.getWordsFormed.mockReturnValue([[{ tile: { letter: 'H' } }, { tile: { letter: 'Z' } }]]);
      window.ScrabbleDictionary.isValid.mockReturnValue(false);

      const res = playWord(state, 'player', 'HZ', 7, 7, 'horizontal');
      
      expect(res.ok).toBe(false);
      expect(res.reason).toMatch(/Invalid dictionary word/);
    });

    test('should apply valid placement successfully', () => {
      window.ScrabbleBoard.canPlace.mockReturnValue(true);
      window.ScrabbleBoard.getWordsFormed.mockReturnValue([[{ tile: { letter: 'H' } }, { tile: { letter: 'I' } }]]);
      window.ScrabbleDictionary.isValid.mockReturnValue(true);
      window.ScrabbleScoring.scorePlacement.mockReturnValue(20);

      const res = playWord(state, 'player', 'HI', 7, 7, 'horizontal');

      expect(res.ok).toBe(true);
      expect(res.placement).not.toBeUndefined();
      expect(window.ScrabbleBoard.place).toHaveBeenCalled();
      expect(window.ScrabbleRack.removeTiles).toHaveBeenCalledWith(state.racks.player, ['H-1', 'I-2']);
      expect(state.scores.player).toBe(20);
      expect(window.ScrabbleRack.drawTiles).toHaveBeenCalledWith(state, 'player');
      expect(state.turn).toBe('ai');
    });

    test('should trigger gameover and tally unplayed tiles if bag is empty and rack is cleared', () => {
      window.ScrabbleBoard.canPlace.mockReturnValue(true);
      window.ScrabbleBoard.getWordsFormed.mockReturnValue([[{ tile: { letter: 'H' } }]]);
      window.ScrabbleDictionary.isValid.mockReturnValue(true);
      window.ScrabbleScoring.scorePlacement.mockReturnValue(10);
      
      state.bag = [];
      // Empty the rack explicitly as if removeTiles did it
      state.racks.player = [{ id: 'H-1', letter: 'H' }]; // will be removed
      window.ScrabbleRack.removeTiles.mockImplementation((rack) => {
        rack.length = 0; // Empty the rack
      });
      state.racks.ai = [{ id: 'Q-9', value: 10 }];

      const res = playWord(state, 'player', 'H', 7, 7, 'horizontal');

      expect(res.ok).toBe(true);
      expect(state.turn).toBe('gameover');
      // Player gets AI's unplayed score (10), plus their placement score (10) = 20
      expect(state.scores.player).toBe(20);
      // AI loses unplayed score
      expect(state.scores.ai).toBe(-10);
    });
  });
});
