require('../scripts/sound.js');

describe('GameKit Sound', () => {
  const { playClick, playWin, playLose } = window.GameKit;
  
  let mockOscillator;
  let mockGain;
  let mockAudioContext;

  beforeEach(() => {
    jest.useFakeTimers();

    mockOscillator = {
      type: '',
      frequency: { value: 0 },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };

    mockGain = {
      gain: { value: 0, exponentialRampToValueAtTime: jest.fn() },
      connect: jest.fn()
    };

    mockAudioContext = {
      createOscillator: jest.fn(() => mockOscillator),
      createGain: jest.fn(() => mockGain),
      destination: {},
      currentTime: 100
    };

    window.AudioContext = jest.fn(() => mockAudioContext);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('playClick should create oscillator, connect, start and stop', () => {
    playClick();
    expect(window.AudioContext).toHaveBeenCalled();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.type).toBe('triangle');
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalledWith(100.055);
  });

  test('playWin should play two tones (staggered)', () => {
    playWin();
    // first tone immediately
    expect(mockOscillator.type).toBe('sine');
    expect(mockOscillator.start).toHaveBeenCalledTimes(1);

    // wait for timeout
    jest.runAllTimers();
    expect(mockOscillator.start).toHaveBeenCalledTimes(2);
  });

  test('playLose should play a sawtooth tone', () => {
    playLose();
    expect(mockOscillator.type).toBe('sawtooth');
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  test('should fail gracefully if AudioContext is not supported', () => {
    window.AudioContext = undefined;
    window.webkitAudioContext = undefined;
    // Should not throw
    expect(() => playClick()).not.toThrow();
  });
});
