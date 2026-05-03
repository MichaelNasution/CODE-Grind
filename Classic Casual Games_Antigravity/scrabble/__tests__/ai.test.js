require('../script/ai.js');

describe('ScrabbleAI', () => {
  const { chooseMove } = window.ScrabbleAI;

  let state;

  beforeEach(() => {
    jest.clearAllMocks();

    window.ScrabbleDictionary = {
      fromRack: jest.fn(),
    };

    window.ScrabbleBoard = {
      canPlace: jest.fn(),
    };

    window.ScrabbleGame = {
      buildPlacement: jest.fn(),
    };

    window.ScrabbleScoring = {
      bonus: {
        '7,7': 'dw'
      }
    };

    window.GameKit = {
      randomInt: jest.fn((min, max) => min)
    };

    state = {
      board: [],
      racks: {
        ai: [{ letter: 'H' }, { letter: 'I' }]
      },
      difficulty: 'medium'
    };
  });

  test('should return null if no candidate words found', () => {
    window.ScrabbleDictionary.fromRack.mockReturnValue([]);
    expect(chooseMove(state)).toBeNull();
  });

  test('should return null if words cannot be placed anywhere', () => {
    window.ScrabbleDictionary.fromRack.mockReturnValue(['HI']);
    window.ScrabbleBoard.canPlace.mockReturnValue(false); // Can't be placed anywhere

    expect(chooseMove(state)).toBeNull();
    // It should check 15x15x2 = 450 times
    expect(window.ScrabbleBoard.canPlace).toHaveBeenCalledTimes(450);
  });

  test('should select a random move if difficulty is easy', () => {
    state.difficulty = 'easy';
    window.ScrabbleDictionary.fromRack.mockReturnValue(['HI']);
    
    // Allow placement at 0,0 horizontal only
    window.ScrabbleBoard.canPlace.mockImplementation((board, word, r, c, dir) => (r === 0 && c === 0 && dir === 'horizontal'));
    
    const mockPlacement = { tiles: [{row: 0, col: 0}], score: 10 };
    window.ScrabbleGame.buildPlacement.mockReturnValue(mockPlacement);

    const move = chooseMove(state);

    expect(move).not.toBeNull();
    expect(move.row).toBe(0);
    expect(move.col).toBe(0);
    expect(window.GameKit.randomInt).toHaveBeenCalled();
  });

  test('should select the best ranked move if difficulty is medium', () => {
    state.difficulty = 'medium';
    window.ScrabbleDictionary.fromRack.mockReturnValue(['HI']);
    
    // Allow placement at 0,0 and 7,7
    window.ScrabbleBoard.canPlace.mockImplementation((board, word, r, c, dir) => 
      (r === 0 && c === 0 && dir === 'horizontal') || 
      (r === 7 && c === 7 && dir === 'horizontal')
    );
    
    // Placement at 0,0 scores 10
    // Placement at 7,7 scores 10 but hits bonus and blocking criteria!
    window.ScrabbleGame.buildPlacement.mockImplementation((s, p, w, r, c, d) => {
      if (r === 0) return { tiles: [{row: 0, col: 0}], score: 10 };
      if (r === 7) return { tiles: [{row: 7, col: 7}], score: 10 }; // this one ranks higher
    });

    const move = chooseMove(state);

    expect(move).not.toBeNull();
    expect(move.row).toBe(7); // It should pick the one with better ranking
  });

  test('should select the best move >= 4 letters if difficulty is hard, fallback to best otherwise', () => {
    state.difficulty = 'hard';
    window.ScrabbleDictionary.fromRack.mockReturnValue(['HI', 'HELLO']);
    
    window.ScrabbleBoard.canPlace.mockReturnValue(true);
    
    window.ScrabbleGame.buildPlacement.mockImplementation((s, p, w, r, c, d) => {
      // HI scores 100, HELLO scores 10.
      if (w === 'HI') return { word: 'HI', tiles: [{}], score: 100 };
      if (w === 'HELLO') return { word: 'HELLO', tiles: [{}], score: 10 };
    });

    // In 'hard', it prefers words >= 4 letters. So even though HI scores more, it might pick HELLO.
    // wait, the sort order puts HI first. then it does: placements.find(m => m.word.length >= 4) || placements[0]
    // So it finds HELLO which is further down the list.
    const move = chooseMove(state);
    
    expect(move).not.toBeNull();
    expect(move.word).toBe('HELLO');
  });

  test('fallback to the highest score in hard if no word >= 4 letters exists', () => {
    state.difficulty = 'hard';
    window.ScrabbleDictionary.fromRack.mockReturnValue(['HI']);
    
    window.ScrabbleBoard.canPlace.mockReturnValue(true);
    
    window.ScrabbleGame.buildPlacement.mockImplementation((s, p, w, r, c, d) => {
      return { word: 'HI', tiles: [{}], score: 100 };
    });

    const move = chooseMove(state);
    expect(move.word).toBe('HI');
  });
});
