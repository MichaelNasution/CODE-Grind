(function () {
  "use strict";

  function resetFood(state) {
    const occupied = new Set(state.snake.map(key));
    const open = [];
    for (let y = 0; y < state.size; y += 1) {
      for (let x = 0; x < state.size; x += 1) {
        if (!occupied.has(`${x},${y}`)) open.push({ x, y });
      }
    }
    state.food = open[GameKit.randomInt(0, open.length - 1)];
  }

  function key(cell) {
    return `${cell.x},${cell.y}`;
  }

  function changeDirection(state, direction) {
    if (direction.x + state.direction.x === 0 && direction.y + state.direction.y === 0) return;
    state.nextDirection = direction;
  }

  function step(state) {
    state.direction = state.nextDirection;
    const head = state.snake[0];
    const next = { x: head.x + state.direction.x, y: head.y + state.direction.y };
    const bodyKeys = new Set(state.snake.slice(0, -1).map(key));

    if (next.x < 0 || next.x >= state.size || next.y < 0 || next.y >= state.size || bodyKeys.has(key(next))) {
      state.status = "lost";
      return;
    }

    state.snake.unshift(next);
    if (next.x === state.food.x && next.y === state.food.y) {
      state.score += 10;
      state.speed = 1 + Math.floor(state.score / 50);
      resetFood(state);
    } else {
      state.snake.pop();
    }
  }

  window.SnakeGame = { resetFood, changeDirection, step, key };
})();
