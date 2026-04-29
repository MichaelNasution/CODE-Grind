(function () {
  "use strict";

  function drawTiles(state, player = "player") {
    const rack = state.racks[player];
    while (rack.length < 7 && state.bag.length) rack.push(state.bag.pop());
  }

  function removeTiles(rack, tileIds) {
    tileIds.forEach((id) => {
      const index = rack.findIndex((tile) => tile.id === id);
      if (index >= 0) rack.splice(index, 1);
    });
  }

  window.ScrabbleRack = { drawTiles, removeTiles };
})();
