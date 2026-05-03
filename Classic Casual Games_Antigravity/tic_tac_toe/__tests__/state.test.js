require('../../shared/scripts/storage.js');
require('../script/state.js');

describe('TicTacToeState', () => {
  const { create, wins, fallbackScores } = window.TicTacToeState;

  beforeEach(() => {
    localStorage.clear();
  });

  test('create should return initial state', () => {
    const state = create();
    expect(state.board).toHaveLength(9);
    expect(state.board.every(cell => cell === "")).toBe(true);
    expect(state.scores).toEqual({ X: 0, O: 0, draw: 0 });
    expect(state.currentPlayer).toBe("X");
    expect(state.starter).toBe("X");
    expect(state.mode).toBe("ai");
    expect(state.aiDifficulty).toBe("medium");
  });

  test('create should load scores from localStorage if available', () => {
    window.GameKit.saveScore('ticTacToe', { X: 5, O: 2, draw: 1 });
    const state = create();
    expect(state.scores).toEqual({ X: 5, O: 2, draw: 1 });
  });

  test('wins should contain 8 winning combinations', () => {
    expect(wins).toHaveLength(8);
  });
});
