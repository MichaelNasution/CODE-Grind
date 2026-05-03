// Mock GameKit before requiring the file
window.GameKit = {
  shuffle: jest.fn(array => [...array]) // just return a copy without shuffling for tests
};

require('../script/tile.js');

describe('ScrabbleTile', () => {
  const { values, createBag } = window.ScrabbleTile;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('values should be correctly mapped', () => {
    expect(values['A']).toBe(1);
    expect(values['Q']).toBe(10);
    expect(values[' ']).toBe(0);
    expect(values['Z']).toBe(10);
    expect(values['E']).toBe(1);
  });

  test('createBag should create a bag of 100 tiles', () => {
    const bag = createBag();
    expect(bag).toHaveLength(100);
    expect(window.GameKit.shuffle).toHaveBeenCalledTimes(1);
  });

  test('createBag should correctly format tiles', () => {
    const bag = createBag();
    const firstTile = bag[0]; // the un-shuffled first element is a blank ' ' according to the distribution string
    
    // First two are blanks
    expect(bag[0].letter).toBe(' ');
    expect(bag[0].isBlank).toBe(true);
    expect(bag[0].value).toBe(0);
    expect(bag[0].id).toBe('BLANK-0');

    expect(bag[1].letter).toBe(' ');
    expect(bag[1].isBlank).toBe(true);
    expect(bag[1].value).toBe(0);
    expect(bag[1].id).toBe('BLANK-1');

    // Then 12 Es
    expect(bag[2].letter).toBe('E');
    expect(bag[2].isBlank).toBe(false);
    expect(bag[2].value).toBe(1);
    expect(bag[2].id).toBe('E-2');
  });

  test('createBag handles unexpected empty inputs (if any modifications are made later)', () => {
    // Current createBag has no parameters, so it just returns 100 tiles.
    const bag = createBag();
    expect(bag).toBeDefined();
  });
});
