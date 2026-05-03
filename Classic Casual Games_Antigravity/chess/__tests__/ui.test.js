describe('ChessUI', () => {
  let uiModule;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    document.body.innerHTML = `
      <div id="board"></div>
      <span id="turn"></span>
      <span id="mode-label"></span>
      <span id="depth"></span>
      <span id="status-title"></span>
      <span id="status-copy"></span>
      <div id="white-captures"></div>
      <div id="black-captures"></div>
      <button id="new-game"></button>
      <button id="ai-move"></button>
      <button data-mode="ai"></button>
      <button data-mode="pvp"></button>
      <button data-difficulty="easy"></button>
      <button data-difficulty="stockfish"></button>
    `;

    // Mock dependencies
    window.GameKit = {
      qs: (selector) => document.querySelector(selector),
      qsa: (selector) => document.querySelectorAll(selector),
      setPressed: jest.fn(),
      playClick: jest.fn()
    };

    window.ChessState = {
      create: jest.fn(() => ({
        board: Array(64).fill(null).map((_, i) => (i === 0 ? { type: 'rook', color: 'black' } : null)),
        turn: 'white',
        mode: 'ai',
        difficulty: 'medium',
        selected: null,
        legalMoves: [],
        lastMove: null,
        captured: { white: [], black: [] },
        status: 'playing',
        engineLoading: false
      }))
    };

    window.ChessGame = {
      symbols: { white: { rook: 'R' }, black: { rook: 'r' } },
      legalMoves: jest.fn().mockReturnValue([{ to: 8 }]),
      applyMove: jest.fn()
    };

    window.ChessAI = {
      chooseMove: jest.fn().mockReturnValue({ from: 1, to: 2 }),
      chooseMoveAsync: jest.fn().mockResolvedValue({ from: 1, to: 2 })
    };

    window.StockfishEngine = {
      isReady: jest.fn().mockReturnValue(false),
      isLoading: jest.fn().mockReturnValue(false),
      init: jest.fn().mockResolvedValue()
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should boot and bind UI', () => {
    require('../script/ui.js');
    
    // Board rendered with 64 squares
    const board = document.querySelector('#board');
    expect(board.children.length).toBe(64);

    expect(document.querySelector('#turn').textContent).toBe('White');
    expect(document.querySelector('#mode-label').textContent).toBe('AI');
    expect(document.querySelector('#status-title').textContent).toBe('Playing');
  });

  test('clicking a square with a piece should select it', () => {
    require('../script/ui.js');
    
    // Set up state where it's black's turn to allow clicking the black rook at index 0
    window.ChessState.create.mockReturnValue({
        board: Array(64).fill(null).map((_, i) => (i === 0 ? { type: 'rook', color: 'black' } : null)),
        turn: 'black',
        mode: 'pvp', // ensure it doesn't block black turn in AI mode
        difficulty: 'medium',
        selected: null,
        legalMoves: [],
        lastMove: null,
        captured: { white: [], black: [] },
        status: 'playing'
    });

    // Re-require to re-initialize with new state
    jest.resetModules();
    require('../script/ui.js');

    const board = document.querySelector('#board');
    const square0 = board.children[0];

    // Click square 0 (Black rook)
    square0.click();

    expect(window.ChessGame.legalMoves).toHaveBeenCalled();
    // Square should get selected class when re-rendered
    expect(board.children[0].classList.contains('selected')).toBe(true);
  });

  test('clicking new game resets state', () => {
    require('../script/ui.js');
    
    document.querySelector('#new-game').click();
    
    expect(window.ChessState.create).toHaveBeenCalledTimes(2); // 1 for boot, 1 for click
  });
});
