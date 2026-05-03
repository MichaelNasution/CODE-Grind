describe('ScrabbleUI', () => {
  let uiModule;

  beforeEach(() => {
    jest.resetModules(); // clears require cache to re-evaluate IIFE
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="board"></div>
      <div id="rack"></div>
      <div id="ai-rack"></div>
      <span id="status-title"></span>
      <span id="status-copy"></span>
      <strong id="player-score"></strong>
      <strong id="ai-score"></strong>
      <div id="player-card"></div>
      <div id="ai-card"></div>
      <span id="bag-count"></span>
      <strong id="vowels-count"></strong>
      <strong id="consonants-count"></strong>
      <div id="bag-grid"></div>
      <ul id="turn-history-list"></ul>
      <button id="btn-shuffle"></button>
      <button id="btn-recall"></button>
      <button id="btn-skip"></button>
      <button id="btn-swap"></button>
      <button id="btn-submit"></button>
      <button id="btn-resign"></button>
      <div class="rack-container"></div>
    `;

    // Mock dependencies
    window.GameKit = {
      qs: (selector) => document.querySelector(selector),
      shuffle: jest.fn(arr => [...arr]),
      playClick: jest.fn(),
      randomInt: jest.fn()
    };

    window.ScrabbleState = {
      create: jest.fn(() => ({
        board: Array.from({ length: 15 }, () => Array(15).fill(null)),
        racks: { player: [{id:'A-1', letter:'A'}], ai: [] },
        bag: [],
        scores: { player: 0, ai: 0 },
        turn: 'player',
        staging: [],
        selectedCell: { row: 7, col: 7 },
        direction: 'horizontal',
        lastMove: null
      }))
    };

    window.ScrabbleDictionary = {
      load: jest.fn().mockResolvedValue(true),
      isValid: jest.fn().mockReturnValue(true)
    };

    window.ScrabbleScoring = {
      bonus: {}
    };

    window.ScrabbleGame = {
      playWord: jest.fn().mockReturnValue({ ok: true, placement: { score: 10 } })
    };

    window.ScrabbleAI = {
      chooseMove: jest.fn().mockReturnValue({ word: 'HI', row: 7, col: 7, direction: 'horizontal' })
    };

    // Need to temporarily mock confirm/alert
    window.alert = jest.fn();
    window.confirm = jest.fn().mockReturnValue(true);
    window.prompt = jest.fn().mockReturnValue('A');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should boot and bind UI', async () => {
    require('../script/ui.js');
    
    // Status immediately sets to loading
    expect(document.querySelector('#status-title').textContent).toBe('Loading dictionary…');
    
    // flush microtasks to resolve dictionary.load()
    await Promise.resolve();

    expect(document.querySelector('#status-title').textContent).toBe('Ready to Play');
    
    // Checks if render happened
    expect(document.querySelector('#board').children.length).toBe(225); // 15x15
    expect(document.querySelector('#rack').children.length).toBe(1); // 1 tile in player rack
  });

  test('should handle skip button correctly', async () => {
    require('../script/ui.js');
    await Promise.resolve();

    const btnSkip = document.querySelector('#btn-skip');
    btnSkip.click();

    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to pass your turn?");
    
    // Triggers AI move via timeout
    jest.runAllTimers();
    expect(window.ScrabbleAI.chooseMove).toHaveBeenCalled();
  });
});
