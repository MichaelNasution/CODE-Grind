require('../scripts/storage.js');

describe('GameKit Storage', () => {
  const { saveScore, loadScore } = window.GameKit;

  beforeEach(() => {
    localStorage.clear();
  });

  test('saveScore should store data in localStorage under specific prefix', () => {
    saveScore('testgame', { points: 10 });
    const stored = localStorage.getItem('miniPlatform:testgame:scores');
    expect(stored).toBe('{"points":10}');
  });

  test('loadScore should retrieve data and merge with fallback', () => {
    saveScore('testgame', { points: 20 });
    const data = loadScore('testgame', { points: 0, level: 1 });
    expect(data.points).toBe(20);
    expect(data.level).toBe(1); // from fallback
  });

  test('loadScore should return fallback if nothing stored', () => {
    const data = loadScore('nogame', { points: 0 });
    expect(data.points).toBe(0);
  });

  test('loadScore should handle JSON parsing errors gracefully', () => {
    localStorage.setItem('miniPlatform:badgame:scores', '{bad json');
    const data = loadScore('badgame', { val: 5 });
    expect(data.val).toBe(5);
  });
});
