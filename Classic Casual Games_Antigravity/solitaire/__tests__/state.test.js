require('../../shared/scripts/storage.js');
require('../script/state.js');

describe('SolitaireState', () => {
  const { create } = window.SolitaireState;

  beforeEach(() => {
    localStorage.clear();
  });

  test('create should return initial state', () => {
    const state = create();
    expect(state.stock).toEqual([]);
    expect(state.waste).toEqual([]);
    expect(state.foundations).toEqual({ hearts: [], diamonds: [], clubs: [], spades: [] });
    expect(state.tableau).toHaveLength(7);
    state.tableau.forEach(pile => expect(pile).toEqual([]));
    expect(state.score).toBe(0);
    expect(state.moves).toBe(0);
    expect(state.mode).toBe("solo");
    expect(state.difficulty).toBe("medium");
    expect(state.best).toBe(0);
  });

  test('create should load best score if exists', () => {
    window.GameKit.saveScore('solitaire', { best: 1500 });
    const state = create();
    expect(state.best).toBe(1500);
  });
});
