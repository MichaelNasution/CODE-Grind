(function () {
  "use strict";

  const WORKER_PATH = "script/stockfish-worker.js";

  let worker = null;
  let ready = false;
  let loading = false;
  let pendingResolve = null;
  let initPromise = null;

  function init() {
    if (worker && ready) return Promise.resolve();
    if (initPromise) return initPromise;

    loading = true;
    initPromise = new Promise((resolve, reject) => {
      try {
        worker = new Worker(WORKER_PATH);
      } catch (error) {
        loading = false;
        initPromise = null;
        reject(new Error("Failed to create Stockfish worker: " + error.message));
        return;
      }

      /* Timeout — if engine doesn't respond within 30s, bail */
      const timeout = setTimeout(() => {
        loading = false;
        initPromise = null;
        if (worker) { worker.terminate(); worker = null; }
        reject(new Error("Stockfish init timed out (30 s). Check your internet connection."));
      }, 30000);

      worker.onerror = (error) => {
        clearTimeout(timeout);
        loading = false;
        initPromise = null;
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
          clearTimeout(timeout);
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

    return initPromise;
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
      try { worker.postMessage("stop"); } catch (_) { /* ignore */ }
      try { worker.postMessage("quit"); } catch (_) { /* ignore */ }
      worker.terminate();
      worker = null;
      ready = false;
      loading = false;
      pendingResolve = null;
      initPromise = null;
    }
  }

  function isReady() { return ready; }
  function isLoading() { return loading; }

  window.StockfishEngine = { init, getBestMove, stop, isReady, isLoading };
})();
