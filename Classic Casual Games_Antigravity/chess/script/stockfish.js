(function () {
  "use strict";

  const CDN_URL = "https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish-nnue-16-single.js";

  let worker = null;
  let ready = false;
  let loading = false;
  let pendingResolve = null;

  function init() {
    if (worker) return Promise.resolve();
    if (loading) return new Promise((resolve) => { const check = setInterval(() => { if (ready) { clearInterval(check); resolve(); } }, 100); });

    loading = true;
    return new Promise((resolve, reject) => {
      try {
        worker = new Worker(CDN_URL);
      } catch (error) {
        loading = false;
        reject(new Error("Failed to create Stockfish worker: " + error.message));
        return;
      }

      worker.onerror = (error) => {
        loading = false;
        worker = null;
        reject(new Error("Stockfish worker error: " + (error.message || "unknown")));
      };

      let initStep = 0;

      worker.onmessage = (event) => {
        const line = typeof event.data === "string" ? event.data : String(event.data);

        /* Initialization handshake */
        if (initStep === 0 && line.indexOf("uciok") !== -1) {
          initStep = 1;
          worker.postMessage("isready");
          return;
        }
        if (initStep === 1 && line.indexOf("readyok") !== -1) {
          initStep = 2;
          ready = true;
          loading = false;
          resolve();
          return;
        }

        /* During play — listen for bestmove */
        if (pendingResolve && line.indexOf("bestmove") === 0) {
          const parts = line.split(" ");
          const moveStr = parts[1];
          const cb = pendingResolve;
          pendingResolve = null;
          cb(moveStr);
        }
      };

      /* Start UCI init */
      worker.postMessage("uci");
    });
  }

  function getBestMove(fen, depth) {
    if (!worker || !ready) return Promise.reject(new Error("Stockfish not initialized"));

    return new Promise((resolve) => {
      pendingResolve = resolve;
      worker.postMessage("position fen " + fen);
      worker.postMessage("go depth " + (depth || 15));
    });
  }

  function stop() {
    if (worker) {
      worker.postMessage("stop");
      worker.postMessage("quit");
      worker.terminate();
      worker = null;
      ready = false;
      loading = false;
      pendingResolve = null;
    }
  }

  function isReady() { return ready; }
  function isLoading() { return loading; }

  window.StockfishEngine = { init, getBestMove, stop, isReady, isLoading };
})();
