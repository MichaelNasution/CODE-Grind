describe('SolitaireUI', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="tableau"></div>
      <div id="foundations"></div>
      <div id="waste"></div>
      <div id="stock"></div>
      <span id="score"></span>
      <span id="moves"></span>
      <span id="best"></span>
      <span id="status-title"></span>
      <span id="status-copy"></span>
      <button id="new-game"></button>
      <button id="ai-move"></button>
      <button id="auto-stack"></button>
      <button data-mode="solo"></button>
      <button data-mode="ai"></button>
      <button data-difficulty="easy"></button>
      <button data-difficulty="medium"></button>
      <button data-difficulty="hard"></button>
    `;

    // Mock dependencies
    window.GameKit = {
      qs: (selector) => document.querySelector(selector),
      qsa: (selector) => document.querySelectorAll(selector),
      setPressed: jest.fn(),
      playClick: jest.fn(),
      playWin: jest.fn(),
      saveScore: jest.fn(),
      loadScore: jest.fn().mockReturnValue({ best: 0 }),
      shuffle: jest.fn(arr => arr) // mock shuffle to keep order predictable
    };

    window.SolitaireState = {
      create: jest.fn(() => ({
        stock: [{ suit: 'hearts', value: 1, rank: 'A', color: 'red', faceUp: false }],
        waste: [{ suit: 'spades', value: 2, rank: '2', color: 'black', faceUp: true }],
        foundations: { hearts: [], diamonds: [], clubs: [], spades: [] },
        tableau: Array.from({ length: 7 }, () => []),
        score: 0,
        moves: 0,
        mode: "solo",
        difficulty: "medium",
        best: 0
      }))
    };

    window.SolitaireGame = {
      deal: jest.fn(),
      drawStock: jest.fn((state) => {
        state.waste.push(state.stock.pop());
      }),
      canMoveToFoundation: jest.fn(() => true),
      canMoveToTableau: jest.fn(() => true),
      moveWasteToFoundation: jest.fn(),
      moveCard: jest.fn(),
      revealTop: jest.fn(),
      isWon: jest.fn(() => false)
    };

    window.SolitaireAI = {
      findMove: jest.fn(() => ({ type: 'draw' }))
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should boot and render initial state', () => {
    require('../script/ui.js');
    expect(window.SolitaireGame.deal).toHaveBeenCalled();
    expect(document.querySelector('#foundations').children.length).toBe(4);
    expect(document.querySelector('#waste').children.length).toBe(1);
    expect(document.querySelector('#tableau').children.length).toBe(7);
  });

  test('stock click should draw card', () => {
    require('../script/ui.js');
    document.querySelector('#stock').click();
    expect(window.SolitaireGame.drawStock).toHaveBeenCalled();
  });

  test('ai-move click should execute AI move', () => {
    require('../script/ui.js');
    document.querySelector('#ai-move').click();
    expect(window.SolitaireAI.findMove).toHaveBeenCalled();
    expect(window.SolitaireGame.drawStock).toHaveBeenCalled(); // Since mocked AI returns 'draw'
  });

  test('auto-stack should repeatedly call AI with hard difficulty until no foundation moves', () => {
    // Setup AI to return a foundation move once, then non-foundation
    window.SolitaireAI.findMove = jest.fn()
      .mockReturnValueOnce({ type: 'waste-foundation', suit: 'hearts' })
      .mockReturnValueOnce({ type: 'draw' });

    require('../script/ui.js');
    document.querySelector('#auto-stack').click();

    expect(window.SolitaireAI.findMove).toHaveBeenCalledTimes(2);
    expect(window.SolitaireGame.moveWasteToFoundation).toHaveBeenCalled();
  });

  test('should handle win state', () => {
    window.SolitaireGame.isWon = jest.fn(() => true);
    
    // We need to trigger finishCheck. runAiMove triggers it.
    require('../script/ui.js');
    document.querySelector('#ai-move').click();

    expect(window.GameKit.playWin).toHaveBeenCalled();
    expect(document.querySelector('#status-title').textContent).toBe('Completed');
    expect(window.GameKit.saveScore).toHaveBeenCalled();
  });

  test('should handle drag and drop waste to foundation', () => {
    require('../script/ui.js');
    
    const wasteCard = document.querySelector('#waste .playing-card');
    const heartsFoundation = document.querySelector('[data-foundation="hearts"]');
    
    // Simulate drag start
    wasteCard.dispatchEvent(new Event('dragstart'));
    expect(wasteCard.classList.contains('dragging')).toBe(true);

    // Simulate drag over
    heartsFoundation.dispatchEvent(new Event('dragover'));
    
    // Simulate drop
    heartsFoundation.dispatchEvent(new Event('drop'));
    
    expect(window.SolitaireGame.moveCard).toHaveBeenCalled();
    
    // Simulate drag end
    wasteCard.dispatchEvent(new Event('dragend'));
  });
});
