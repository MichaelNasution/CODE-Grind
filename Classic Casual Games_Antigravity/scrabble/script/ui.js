(function () {
  "use strict";

  let state = window.ScrabbleState.create();
  const boardEl = GameKit.qs("#board");
  const rackEl = GameKit.qs("#rack");
  const aiRackEl = GameKit.qs("#ai-rack");
  
  const statusTitle = GameKit.qs("#status-title");
  const statusCopy = GameKit.qs("#status-copy");
  
  const playerScore = GameKit.qs("#player-score");
  const aiScore = GameKit.qs("#ai-score");
  const playerCard = GameKit.qs("#player-card");
  const aiCard = GameKit.qs("#ai-card");
  
  const bagCount = GameKit.qs("#bag-count");
  const vowelsCount = GameKit.qs("#vowels-count");
  const consonantsCount = GameKit.qs("#consonants-count");
  const bagGrid = GameKit.qs("#bag-grid");
  
  const historyList = GameKit.qs("#turn-history-list");
  
  const btnShuffle = GameKit.qs("#btn-shuffle");
  const btnRecall = GameKit.qs("#btn-recall");
  const btnSkip = GameKit.qs("#btn-skip");
  const btnSwap = GameKit.qs("#btn-swap");
  const btnSubmit = GameKit.qs("#btn-submit");
  const btnResign = GameKit.qs("#btn-resign");

  let locked = false;
  let draggedTileId = null;
  let draggedFrom = null;

  // Turn History Array
  let turnHistory = [];

  boot();

  function boot() {
    statusTitle.textContent = "Loading dictionary…";
    statusCopy.textContent = "Downloading 149k words";
    locked = true;
    window.ScrabbleDictionary.load().then(() => {
      locked = false;
      statusTitle.textContent = "Ready to Play";
      statusCopy.textContent = "Drag tiles to the board or type on your keyboard.";
      wireControls();
      wireKeyboard();
      render();
    });
  }

  function wireControls() {
    btnSubmit.addEventListener("click", submitWord);
    
    btnShuffle.addEventListener("click", () => {
      if (locked || state.turn !== "player") return;
      state.racks.player = GameKit.shuffle([...state.racks.player]);
      render();
    });
    
    btnRecall.addEventListener("click", () => {
      if (locked || state.turn !== "player") return;
      clearStaging();
      render();
    });

    btnSkip.addEventListener("click", () => {
      if (locked || state.turn !== "player") return;
      if (!confirm("Are you sure you want to pass your turn?")) return;
      clearStaging();
      logHistory("player", "Passed Turn", 0);
      state.turn = "ai";
      render();
      locked = true;
      setTimeout(() => { playAiMove(); locked = false; render(); }, 600);
    });
    
    btnResign.addEventListener("click", () => {
        if (!confirm("Resign the game?")) return;
        state.turn = "gameover";
        statusTitle.textContent = "Game Over";
        statusCopy.textContent = "You resigned.";
        render();
    });

    btnSwap.addEventListener("click", () => {
        if (locked || state.turn !== "player") return;
        alert("Tile swapping is not yet fully implemented in this demo.");
    });

    // Rack drop zone
    const rackPanel = GameKit.qs(".rack-container");
    rackPanel.addEventListener("dragover", (e) => {
      if (locked || state.turn !== "player") return;
      e.preventDefault();
    });
    rackPanel.addEventListener("drop", (e) => {
      if (locked || state.turn !== "player") return;
      e.preventDefault();
      if (draggedFrom !== "rack" && draggedTileId) {
        const stageIdx = state.staging.findIndex((st) => st.tile.id === draggedTileId);
        if (stageIdx >= 0) {
          const st = state.staging.splice(stageIdx, 1)[0];
          state.racks.player.push(st.tile);
          render();
        }
      }
      draggedTileId = null;
      draggedFrom = null;
    });
  }

  function clearStaging() {
    while (state.staging.length > 0) {
      const st = state.staging.pop();
      // If it was a blank tile, reset its letter visual
      if (st.tile.isBlank) st.tile.letter = " ";
      state.racks.player.push(st.tile);
    }
  }

  function wireKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (locked || state.turn !== "player") return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "Enter") {
        e.preventDefault();
        submitWord();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        if (state.staging.length > 0) {
          const st = state.staging.pop();
          if (st.tile.isBlank) st.tile.letter = " ";
          state.racks.player.push(st.tile);
          render();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        clearStaging();
        render();
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        let tileIndex = state.racks.player.findIndex((t) => t.letter === letter);
        let usedBlank = false;
        
        if (tileIndex < 0) {
            tileIndex = state.racks.player.findIndex((t) => t.isBlank);
            usedBlank = true;
        }
        
        if (tileIndex >= 0) {
          let r = state.selectedCell.row;
          let c = state.selectedCell.col;
          while (r < 15 && c < 15 && (state.board[r][c] || state.staging.some((st) => st.row === r && st.col === c))) {
            if (state.direction === "horizontal") c++;
            else r++;
          }
          if (r < 15 && c < 15) {
            const tile = state.racks.player.splice(tileIndex, 1)[0];
            if (usedBlank) {
               // Assign the typed letter
               tile.letter = letter;
            }
            state.staging.push({ row: r, col: c, tile });
            render();
          }
        }
      }
    });
  }

  function render() {
    renderBoard();
    renderRacks();
    renderBagTracking();
    renderHistory();
    
    playerScore.textContent = state.scores.player;
    aiScore.textContent = state.scores.ai;
    
    playerCard.classList.toggle("active", state.turn === "player");
    aiCard.classList.toggle("active", state.turn === "ai");
    
    if (state.turn === "gameover") {
        btnSubmit.disabled = true;
        btnShuffle.disabled = true;
        btnRecall.disabled = true;
        btnSkip.disabled = true;
        btnSwap.disabled = true;
    } else {
        const isPlayer = state.turn === "player";
        btnSubmit.disabled = locked || !isPlayer;
        btnShuffle.disabled = locked || !isPlayer;
        btnRecall.disabled = locked || !isPlayer;
        btnSkip.disabled = locked || !isPlayer;
        btnSwap.disabled = locked || !isPlayer;
    }
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    const lastKeys = new Set((state.lastMove?.tiles || []).map((item) => `${item.row},${item.col}`));

    for (let row = 0; row < 15; row += 1) {
      for (let col = 0; col < 15; col += 1) {
        const cell = document.createElement("div");
        const bonus = window.ScrabbleScoring.bonus[`${row},${col}`];
        const tile = state.board[row][col];
        const staged = state.staging.find((st) => st.row === row && st.col === col);

        cell.className = `scrabble-cell ${bonus ? `bonus-${bonus}` : ""}`;
        if (row === 7 && col === 7 && !tile && !staged) cell.classList.add("center-star");
        
        cell.classList.toggle("filled", Boolean(tile));
        cell.classList.toggle("last-move", lastKeys.has(`${row},${col}`));
        cell.classList.toggle("selected", state.selectedCell.row === row && state.selectedCell.col === col);
        
        if (staged) {
          cell.classList.add("staged");
          const tileEl = document.createElement("div");
          tileEl.innerHTML = tileMarkup(staged.tile);
          tileEl.draggable = true;
          tileEl.addEventListener("dragstart", (e) => handleDragStart(e, { row, col }, staged.tile.id));
          tileEl.addEventListener("click", (e) => {
             e.stopPropagation();
             if (locked || state.turn !== "player") return;
             const stageIdx = state.staging.findIndex((st) => st.tile.id === staged.tile.id);
             if (stageIdx >= 0) {
               const st = state.staging.splice(stageIdx, 1)[0];
               if (st.tile.isBlank) st.tile.letter = " ";
               state.racks.player.push(st.tile);
               render();
             }
          });
          cell.appendChild(tileEl.firstElementChild);
        } else if (tile) {
          cell.innerHTML = tileMarkup(tile);
        } else {
          if (row === 7 && col === 7) {
              cell.innerHTML = "★";
          } else {
              cell.innerHTML = bonusMarkup(bonus);
          }
        }

        cell.addEventListener("dragover", (e) => {
          if (locked || state.turn !== "player") return;
          e.preventDefault();
          if (!tile && !staged) cell.classList.add("drag-over");
        });
        cell.addEventListener("dragleave", () => cell.classList.remove("drag-over"));
        cell.addEventListener("drop", (e) => {
          cell.classList.remove("drag-over");
          handleDrop(e, row, col);
        });
        cell.addEventListener("click", () => {
          state.selectedCell = { row, col };
          render();
        });

        boardEl.appendChild(cell);
      }
    }
  }

  function renderRacks() {
    // Player Rack
    rackEl.innerHTML = "";
    state.racks.player.forEach((tile) => {
      const button = document.createElement("button");
      button.className = "rack-tile";
      button.draggable = true;
      button.innerHTML = tileMarkup(tile);
      
      button.addEventListener("dragstart", (e) => handleDragStart(e, "rack", tile.id));
      button.addEventListener("click", () => {
        if (locked || state.turn !== "player") return;
        let r = state.selectedCell.row;
        let c = state.selectedCell.col;
        while (r < 15 && c < 15 && (state.board[r][c] || state.staging.some((st) => st.row === r && st.col === c))) {
          if (state.direction === "horizontal") c++;
          else r++;
        }
        if (r < 15 && c < 15) {
          const idx = state.racks.player.findIndex((t) => t.id === tile.id);
          const t = state.racks.player.splice(idx, 1)[0];
          
          if (t.isBlank) {
              let letter = prompt("Assign letter for blank tile (A-Z):", "A");
              if (!letter || !/^[a-zA-Z]$/.test(letter)) {
                  // Revert if cancelled
                  state.racks.player.push(t);
                  return;
              }
              t.letter = letter.toUpperCase();
          }
          
          state.staging.push({ row: r, col: c, tile: t });
          render();
        }
      });
      rackEl.appendChild(button);
    });

    // AI Rack (Requested by user to be visible)
    aiRackEl.innerHTML = "";
    state.racks.ai.forEach((tile) => {
      const div = document.createElement("div");
      div.className = "rack-tile";
      div.innerHTML = tileMarkup(tile);
      aiRackEl.appendChild(div);
    });
  }

  function renderBagTracking() {
      bagCount.textContent = state.bag.length;
      
      let vowels = 0;
      let consonants = 0;
      const v = ['A','E','I','O','U'];
      const counts = {};
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ ".split("").forEach(char => counts[char] = 0);
      
      state.bag.forEach(tile => {
          counts[tile.letter]++;
          if (tile.isBlank) {
              // Blanks aren't vowels or consonants per se
          } else if (v.includes(tile.letter)) {
              vowels++;
          } else {
              consonants++;
          }
      });
      
      vowelsCount.textContent = vowels;
      consonantsCount.textContent = consonants;
      
      bagGrid.innerHTML = "";
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(char => {
         const group = document.createElement("div");
         group.className = "bag-letter-group";
         group.innerHTML = `<span style="width:10px">${char}</span><span style="color:#64748b">${counts[char]}</span>`;
         bagGrid.appendChild(group);
      });
      const groupBlank = document.createElement("div");
      groupBlank.className = "bag-letter-group";
      groupBlank.innerHTML = `<span style="width:10px">_</span><span style="color:#64748b">${counts[" "]}</span>`;
      bagGrid.appendChild(groupBlank);
  }
  
  function logHistory(player, word, score) {
      turnHistory.push({ player, word, score });
  }

  function getLetterValue(letter) {
      const values = {
          A:1, E:1, I:1, O:1, U:1, L:1, N:1, S:1, T:1, R:1,
          D:2, G:2,
          B:3, C:3, M:3, P:3,
          F:4, H:4, V:4, W:4, Y:4,
          K:5,
          J:8, X:8,
          Q:10, Z:10,
          " ":0
      };
      return values[letter.toUpperCase()] || 0;
  }

  function renderHistory() {
      if (turnHistory.length === 0) {
          historyList.innerHTML = `<li class="empty-state">No moves yet.</li>`;
          return;
      }
      historyList.innerHTML = "";
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      turnHistory.slice().reverse().forEach((turn, idx) => {
          const li = document.createElement("li");
          li.className = turn.player === "player" ? "player-move" : "ai-move";
          
          const playerInit = turn.player === "player" ? "V" : "Z";
          const playerName = turn.player === "player" ? "ViableUser708243" : "ZippyUser904344";
          
          let tilesHtml = turn.word.split('').map(char => {
              const val = getLetterValue(char);
              return `<div class="history-tile">${char}<sub>${val}</sub></div>`;
          }).join('');
          
          const turnNum = turnHistory.length - idx;

          li.innerHTML = `
            <div class="history-top">
              <div class="history-avatar">${playerInit}</div>
              <div class="history-details">
                <strong>${playerName}</strong><br>
                Turn #${turnNum}, ${dateStr} at ${timeStr} • 1 Word • ${turn.score} Points
              </div>
            </div>
            <div class="history-word-row">
              ${tilesHtml}
            </div>
          `;
          historyList.appendChild(li);
      });
  }

  function handleDragStart(e, source, tileId) {
    if (locked || state.turn !== "player") {
      e.preventDefault();
      return;
    }
    draggedTileId = tileId;
    draggedFrom = source;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tileId);
  }

  function handleDrop(e, targetRow, targetCol) {
    e.preventDefault();
    if (locked || state.turn !== "player") return;
    
    const tileId = draggedTileId;
    if (!tileId) return;

    if (state.board[targetRow][targetCol]) return;
    const existingStaged = state.staging.findIndex((st) => st.row === targetRow && st.col === targetCol);
    
    if (existingStaged >= 0 && (draggedFrom === "rack" || draggedFrom.row !== targetRow || draggedFrom.col !== targetCol)) {
       return; 
    }

    if (draggedFrom === "rack") {
       const rackIdx = state.racks.player.findIndex((t) => t.id === tileId);
       if (rackIdx >= 0) {
          const tile = state.racks.player.splice(rackIdx, 1)[0];
          
          if (tile.isBlank) {
              let letter = prompt("Assign letter for blank tile (A-Z):", "A");
              if (!letter || !/^[a-zA-Z]$/.test(letter)) {
                  state.racks.player.push(tile);
                  return;
              }
              tile.letter = letter.toUpperCase();
          }
          
          state.staging.push({ row: targetRow, col: targetCol, tile });
       }
    } else {
       const stageIdx = state.staging.findIndex((st) => st.tile.id === tileId);
       if (stageIdx >= 0) {
          state.staging[stageIdx].row = targetRow;
          state.staging[stageIdx].col = targetCol;
       }
    }
    
    draggedTileId = null;
    draggedFrom = null;
    state.selectedCell = { row: targetRow, col: targetCol };
    render();
  }

  function inferMoveFromStaging() {
    if (state.staging.length === 0) return null;
    let isHorizontal = true;
    let isVertical = true;
    const r0 = state.staging[0].row;
    const c0 = state.staging[0].col;

    for (const t of state.staging) {
      if (t.row !== r0) isHorizontal = false;
      if (t.col !== c0) isVertical = false;
    }

    if (!isHorizontal && !isVertical) return { error: "Tiles must be placed in a single row or column." };

    let direction = state.direction || "horizontal";
    if (state.staging.length > 1) {
      direction = isHorizontal ? "horizontal" : "vertical";
    }

    let minR = 15, maxR = -1, minC = 15, maxC = -1;
    for (const t of state.staging) {
      minR = Math.min(minR, t.row);
      maxR = Math.max(maxR, t.row);
      minC = Math.min(minC, t.col);
      maxC = Math.max(maxC, t.col);
    }

    if (direction === "horizontal") {
      let r = r0;
      let c1 = minC;
      while (c1 > 0 && state.board[r][c1 - 1]) c1--;
      let c2 = maxC;
      while (c2 < 14 && state.board[r][c2 + 1]) c2++;
      
      let word = "";
      for (let c = c1; c <= c2; c++) {
        const boardTile = state.board[r][c];
        const stagedTile = state.staging.find((t) => t.row === r && t.col === c);
        if (boardTile) word += boardTile.letter;
        else if (stagedTile) word += stagedTile.tile.letter;
        else return { error: "Word has gaps between tiles." };
      }
      return { word, row: r, col: c1, direction };
    } else {
      let c = c0;
      let r1 = minR;
      while (r1 > 0 && state.board[r1 - 1][c]) r1--;
      let r2 = maxR;
      while (r2 < 14 && state.board[r2 + 1][c]) r2++;
      
      let word = "";
      for (let r = r1; r <= r2; r++) {
        const boardTile = state.board[r][c];
        const stagedTile = state.staging.find((t) => t.row === r && t.col === c);
        if (boardTile) word += boardTile.letter;
        else if (stagedTile) word += stagedTile.tile.letter;
        else return { error: "Word has gaps between tiles." };
      }
      return { word, row: r1, col: c, direction };
    }
  }

  function submitWord() {
    if (locked || state.turn !== "player") return;
    
    if (state.staging.length === 0) {
      alert("Place tiles on the board first.");
      return;
    }

    const move = inferMoveFromStaging();
    if (move.error) {
      alert(move.error);
      return;
    }

    const stashedStaging = [...state.staging];
    clearStaging();

    const result = window.ScrabbleGame.playWord(
      state, "player", move.word, move.row, move.col, move.direction
    );

    if (result.ok) {
      statusTitle.textContent = `Played ${move.word}`;
      statusCopy.textContent = `Scored ${result.placement.score} points!`;
      logHistory("player", move.word, result.placement.score);
      GameKit.playClick();
      render();
      if (state.turn === "ai") {
        locked = true;
        render();
        window.setTimeout(() => {
          playAiMove();
          locked = false;
          render();
        }, 600);
      }
    } else {
      for (const st of stashedStaging) {
         const idx = state.racks.player.findIndex(t => t.id === st.tile.id);
         if (idx >= 0) state.racks.player.splice(idx, 1);
         state.staging.push(st);
      }
      alert(result.reason);
      render();
    }
  }

  function playAiMove() {
    const move = window.ScrabbleAI.chooseMove(state);
    if (!move) {
      statusTitle.textContent = "AI passed";
      statusCopy.textContent = "No valid move found.";
      logHistory("ai", "Passed Turn", 0);
      state.turn = "player";
      render();
      return;
    }
    const result = window.ScrabbleGame.playWord(state, "ai", move.word, move.row, move.col, move.direction);
    if (result.ok) {
      statusTitle.textContent = `AI played ${move.word}`;
      statusCopy.textContent = `AI scored ${result.placement.score} points.`;
      logHistory("ai", move.word, result.placement.score);
    } else {
      logHistory("ai", "Passed Turn", 0);
      state.turn = "player";
    }
    GameKit.playClick();
    render();
  }

  function tileMarkup(tile, extraClass = "") {
    // Blank tiles have a special visual: no value, and class blank
    const valHtml = tile.isBlank ? "" : `<span class="tile-value">${tile.value}</span>`;
    return `<span class="tile-face ${extraClass}"><span class="tile-letter">${tile.letter}</span>${valHtml}</span>`;
  }

  function bonusMarkup(bonus) {
    if (!bonus) return "";
    return `<span class="bonus-label">${bonus.toUpperCase()}</span>`;
  }
})();
