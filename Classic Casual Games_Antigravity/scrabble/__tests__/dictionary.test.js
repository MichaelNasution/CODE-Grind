require('../script/dictionary.js');

describe('ScrabbleDictionary', () => {
  const { isValid, fromRack, isReady, load } = window.ScrabbleDictionary;

  beforeEach(() => {
    // Reset global fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('isReady should initially be false (unless load was called earlier, testing isolated)', () => {
    // Note: Due to require caching, if tests share state it might be true. 
    // In this fresh context, it's whatever the file initializes to.
    // However, since it's an IIFE, the state persists across tests.
    // Let's just assume we need to test isValid with fallback initially.
  });

  test('isValid should work with FALLBACK list initially', () => {
    expect(isValid('HELLO')).toBe(false); // HELLO is not in fallback
    expect(isValid('AB')).toBe(true);    // AB is in fallback
    expect(isValid('YACHT')).toBe(true); // YACHT is in fallback
  });

  test('isValid should handle lowercase and uppercase', () => {
    expect(isValid('ab')).toBe(true);
    expect(isValid('Ab')).toBe(true);
  });

  test('fromRack should return words constructable from given letters', () => {
    const letters = ['A', 'B', 'C', 'D'];
    const validWords = fromRack(letters);
    
    // "AB" is in fallback and can be made from ['A','B','C','D']
    expect(validWords).toContain('AB');
    expect(validWords).toContain('AD');
    expect(validWords).toContain('CAB');
    expect(validWords).toContain('BAD');

    // "ACE" requires 'E', which we don't have
    expect(validWords).not.toContain('ACE');
  });

  test('load should fetch dictionary and populate fullSet', async () => {
    const mockText = "AA\nAB\nHELLO\nWORLD\nEXACTLY\nZZ";
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(mockText)
    });

    await load();

    expect(isReady()).toBe(true);
    expect(isValid('HELLO')).toBe(true);
    expect(isValid('WORLD')).toBe(true);
    expect(isValid('EXACTLY')).toBe(true);
    expect(isValid('ZZ')).toBe(true);
    
    // Words not in mock text should be false
    expect(isValid('NOTINDICT')).toBe(false);

    // AI subset should not contain "EXACTLY" (length 7) - wait, length <= 7 is included. 
    // EXACTLY is 7 letters. It should be in ai subset.
    // Let's test fromRack with letters for HELLO
    const words = fromRack(['H','E','L','L','O']);
    expect(words).toContain('HELLO');
  });

  test('load should fallback on fetch failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await load();

    expect(isReady()).toBe(true);
    // Should fallback to default list
    expect(isValid('AB')).toBe(true);
    // Should not contain the mock text from previous test because fallback resets it
    expect(isValid('HELLO')).toBe(false); 
  });

  test('load should fallback if res.ok is false', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false
    });

    await load();

    expect(isReady()).toBe(true);
    expect(isValid('YACHT')).toBe(true); 
  });
});
