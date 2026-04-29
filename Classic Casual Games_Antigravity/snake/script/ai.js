(function () {
  "use strict";

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  function chooseDirection(state) {
    const safe = directions.filter((direction) => isSafe(state, direction));
    if (!safe.length) return state.direction;
    if (state.difficulty === "easy") return safe[GameKit.randomInt(0, safe.length - 1)];

    const foodRanked = safe.sort((a, b) => distanceAfter(state, a) - distanceAfter(state, b));
    if (state.difficulty === "medium") return Math.random() < 0.82 ? foodRanked[0] : safe[GameKit.randomInt(0, safe.length - 1)];
    return foodRanked.find((direction) => futureSafeCount(state, direction) > 1) || foodRanked[0];
  }

  function isSafe(state, direction) {
    if (direction.x + state.direction.x === 0 && direction.y + state.direction.y === 0) return false;
    const next = { x: state.snake[0].x + direction.x, y: state.snake[0].y + direction.y };
    const body = new Set(state.snake.slice(0, -1).map(window.SnakeGame.key));
    return next.x >= 0 && next.x < state.size && next.y >= 0 && next.y < state.size && !body.has(window.SnakeGame.key(next));
  }

  function distanceAfter(state, direction) {
    const next = { x: state.snake[0].x + direction.x, y: state.snake[0].y + direction.y };
    return Math.abs(next.x - state.food.x) + Math.abs(next.y - state.food.y);
  }

  function futureSafeCount(state, direction) {
    const fake = {
      ...state,
      snake: [{ x: state.snake[0].x + direction.x, y: state.snake[0].y + direction.y }, ...state.snake.slice(0, -1)],
      direction,
    };
    return directions.filter((nextDirection) => isSafe(fake, nextDirection)).length;
  }

  window.SnakeAI = { chooseDirection };
})();
