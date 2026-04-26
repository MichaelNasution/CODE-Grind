// state.js
const EventBus = {
    listeners: {},
  
    subscribe(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    },
  
    dispatch(event, payload) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(cb => cb(payload));
    }
};
  
const AppState = {
    activeModule: "sci",
    variables: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, Z: 0 },
    lastResult: null,
    history: [],
    visualization: {
        type: null, // e.g., 'vector', 'graph', 'integral'
        data: null
    },
    error: null,
    loading: false
};
  
function setState(updater) {
    updater(AppState);
    EventBus.dispatch("STATE_UPDATED", AppState);
}

// Export to global scope for now (since we use script tags without type="module")
window.EventBus = EventBus;
window.AppState = AppState;
window.setState = setState;
