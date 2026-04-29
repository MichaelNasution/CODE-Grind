(function () {
  "use strict";

  const GameKit = window.GameKit || {};
  let audioContext;

  function getContext() {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
  }

  function playTone(frequency, duration, type = "sine", gainValue = 0.045) {
    try {
      const context = getContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.value = gainValue;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      return undefined;
    }
  }

  function playClick() {
    playTone(440, 0.055, "triangle", 0.035);
  }

  function playWin() {
    playTone(523.25, 0.09, "sine", 0.045);
    window.setTimeout(() => playTone(783.99, 0.12, "sine", 0.04), 80);
  }

  function playLose() {
    playTone(220, 0.16, "sawtooth", 0.03);
  }

  window.GameKit = {
    ...GameKit,
    playClick,
    playWin,
    playLose,
  };
})();
