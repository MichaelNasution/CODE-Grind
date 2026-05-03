// Mock dependencies
window.ScrabbleBoard = {
  createBoard: jest.fn(() => 'mock_board')
};

window.ScrabbleTile = {
  createBag: jest.fn(() => ['mock_tile_1', 'mock_tile_2'])
};

window.ScrabbleRack = {
  drawTiles: jest.fn()
};

require('../script/state.js');

describe('ScrabbleState', () => {
  const { create } = window.ScrabbleState;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create should initialize all state properties correctly', () => {
    const state = create();

    expect(window.ScrabbleBoard.createBoard).toHaveBeenCalledTimes(1);
    expect(window.ScrabbleTile.createBag).toHaveBeenCalledTimes(1);

    // Initial properties
    expect(state.board).toBe('mock_board');
    expect(state.bag).toEqual(['mock_tile_1', 'mock_tile_2']);
    expect(state.racks).toEqual({ player: [], ai: [] });
    expect(state.scores).toEqual({ player: 0, ai: 0 });
    expect(state.mode).toBe('ai');
    expect(state.difficulty).toBe('medium');
    expect(state.direction).toBe('horizontal');
    expect(state.selectedRackIds).toEqual([]);
    expect(state.selectedCell).toEqual({ row: 7, col: 7 });
    expect(state.staging).toEqual([]);
    expect(state.lastMove).toBeNull();
    expect(state.turn).toBe('player');
  });

  test('create should draw tiles for both player and AI initially', () => {
    const state = create();

    expect(window.ScrabbleRack.drawTiles).toHaveBeenCalledTimes(2);
    expect(window.ScrabbleRack.drawTiles).toHaveBeenNthCalledWith(1, state, 'player');
    expect(window.ScrabbleRack.drawTiles).toHaveBeenNthCalledWith(2, state, 'ai');
  });
});
