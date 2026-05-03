require('../../shared/scripts/storage.js');
require('../script/state.js');

describe('SnakeState', () => {
  const { create } = window.SnakeState;

  beforeEach(() => {
    localStorage.clear();
  });

  test('create should return initial state', () => {
    const state = create();
    expect(state.size).toBe(18);
    expect(state.snake).toEqual([{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }]);
    expect(state.direction).toEqual({ x: 1, y: 0 });
    expect(state.nextDirection).toEqual({ x: 1, y: 0 });
    expect(state.food).toEqual({ x: 13, y: 9 });
    expect(state.score).toBe(0);
    expect(state.speed).toBe(1);
    expect(state.status).toBe("ready");
    expect(state.mode).toBe("solo");
    expect(state.difficulty).toBe("medium");
    expect(state.best).toBe(0);
  });

  test('create should load best score if exists', () => {
    window.GameKit.saveScore('snake', { best: 150 });
    const state = create();
    expect(state.best).toBe(150);
  });
});
