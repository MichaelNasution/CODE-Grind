require('../../shared/scripts/storage.js');
require('../script/state.js');

describe('MinesweeperState', () => {
  const { create } = window.MinesweeperState;

  beforeEach(() => {
    localStorage.clear();
  });

  test('create should return initial state', () => {
    const state = create();
    expect(state.rows).toBe(10);
    expect(state.cols).toBe(10);
    expect(state.mines).toBe(14);
    expect(state.board).toEqual([]);
    expect(state.revealed).toBe(0);
    expect(state.flags).toBe(0);
    expect(state.status).toBe("ready");
    expect(state.mode).toBe("solo");
    expect(state.difficulty).toBe("medium");
    expect(state.seconds).toBe(0);
    expect(state.best).toBeNull();
  });

  test('create should load best score if exists', () => {
    window.GameKit.saveScore('minesweeper', { best: 42 });
    const state = create();
    expect(state.best).toBe(42);
  });
});
