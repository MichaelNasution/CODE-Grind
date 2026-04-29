(function () {
  "use strict";

  const GameKit = window.GameKit || {};
  const prefix = "miniPlatform";

  function keyFor(gameId) {
    return `${prefix}:${gameId}:scores`;
  }

  function saveScore(gameId, scoreData) {
    localStorage.setItem(keyFor(gameId), JSON.stringify(scoreData));
  }

  function loadScore(gameId, fallback = {}) {
    try {
      const stored = localStorage.getItem(keyFor(gameId));
      return stored ? { ...fallback, ...JSON.parse(stored) } : { ...fallback };
    } catch (error) {
      return { ...fallback };
    }
  }

  window.GameKit = {
    ...GameKit,
    saveScore,
    loadScore,
  };
})();
