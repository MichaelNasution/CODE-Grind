require('../script/state.js');

describe('ChessState', () => {
  const { create } = window.ChessState;

  test('create() should initialize all properties correctly', () => {
    const state = create();
    
    expect(state.turn).toBe('white');
    expect(state.mode).toBe('ai');
    expect(state.difficulty).toBe('medium');
    expect(state.selected).toBeNull();
    expect(state.legalMoves).toEqual([]);
    expect(state.lastMove).toBeNull();
    expect(state.captured).toEqual({ white: [], black: [] });
    expect(state.status).toBe('playing');
    expect(state.castling).toEqual({ K: true, Q: true, k: true, q: true });
    expect(state.enPassant).toBeNull();
    expect(state.halfMoveClock).toBe(0);
    expect(state.fullMoveNumber).toBe(1);
    expect(state.engineLoading).toBe(false);
    expect(state.engineReady).toBe(false);
  });

  test('initialBoard should return a 64-length array', () => {
    const state = create();
    expect(state.board.length).toBe(64);
  });

  test('initialBoard should set up black pieces correctly at the top', () => {
    const state = create();
    const board = state.board;

    // Row 0: Black back rank
    const expectedBackRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
    expectedBackRank.forEach((type, file) => {
      expect(board[file]).toEqual({ type, color: 'black' });
    });

    // Row 1: Black pawns
    for (let file = 0; file < 8; file++) {
      expect(board[8 + file]).toEqual({ type: 'pawn', color: 'black' });
    }
  });

  test('initialBoard should set up white pieces correctly at the bottom', () => {
    const state = create();
    const board = state.board;

    // Row 6: White pawns
    for (let file = 0; file < 8; file++) {
      expect(board[48 + file]).toEqual({ type: 'pawn', color: 'white' });
    }

    // Row 7: White back rank
    const expectedBackRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
    expectedBackRank.forEach((type, file) => {
      expect(board[56 + file]).toEqual({ type, color: 'white' });
    });
  });

  test('initialBoard should leave empty squares in the middle (ranks 3, 4, 5, 6)', () => {
    const state = create();
    const board = state.board;

    for (let i = 16; i < 48; i++) {
      expect(board[i]).toBeNull();
    }
  });

  test('create() should return a fresh state object each time (no mutation sharing)', () => {
    const state1 = create();
    const state2 = create();

    // Modify state1
    state1.turn = 'black';
    state1.board[0] = null;
    state1.castling.K = false;

    // Verify state2 is unaffected
    expect(state2.turn).toBe('white');
    expect(state2.board[0]).not.toBeNull();
    expect(state2.castling.K).toBe(true);
  });
});
