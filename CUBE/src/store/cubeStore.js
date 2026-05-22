import { create } from "zustand";
import {
  createSolvedCube, cloneCube, applyMove, applyMoves,
  generateScramble, solveByUndo, isSolved, parseMoves
} from "../engine/cube";

export const useCubeStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────
  cube: createSolvedCube(),
  history: [createSolvedCube()],
  historyIndex: 0,
  scrambleMoves: [],
  solutionMoves: [],
  solutionStep: -1,
  isPlaying: false,
  speed: 1,
  method: "CFOP",
  activeTab: "solver",
  selectedFormula: null,
  searchQuery: "",
  activeCategory: "All",
  playbackIntervalId: null,

  // ── Mutations ────────────────────────────────────────────
  applyMove: (move) => set(state => {
    const newCube = applyMove(state.cube, move);
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newCube);
    return { cube: newCube, history: newHistory, historyIndex: newHistory.length - 1 };
  }),

  applyMoveSequence: (moves) => set(state => {
    const parsed = typeof moves === "string" ? parseMoves(moves) : moves;
    const newCube = applyMoves(state.cube, parsed);
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newCube);
    return { cube: newCube, history: newHistory, historyIndex: newHistory.length - 1 };
  }),

  undo: () => set(state => {
    if (state.historyIndex <= 0) return state;
    const idx = state.historyIndex - 1;
    return { cube: cloneCube(state.history[idx]), historyIndex: idx };
  }),

  redo: () => set(state => {
    if (state.historyIndex >= state.history.length - 1) return state;
    const idx = state.historyIndex + 1;
    return { cube: cloneCube(state.history[idx]), historyIndex: idx };
  }),

  reset: () => set({
    cube: createSolvedCube(),
    history: [createSolvedCube()],
    historyIndex: 0,
    scrambleMoves: [],
    solutionMoves: [],
    solutionStep: -1,
    isPlaying: false,
  }),

  scramble: () => set(state => {
    const moves = generateScramble(20);
    const newCube = applyMoves(createSolvedCube(), moves);
    return {
      cube: newCube,
      history: [createSolvedCube(), newCube],
      historyIndex: 1,
      scrambleMoves: moves,
      solutionMoves: [],
      solutionStep: -1,
    };
  }),

  solve: () => set(state => {
    const sol = solveByUndo(state.scrambleMoves);
    return { solutionMoves: sol, solutionStep: 0 };
  }),

  stepSolution: () => set(state => {
    const { solutionMoves, solutionStep, cube } = state;
    if (solutionStep >= solutionMoves.length) return state;
    const move = solutionMoves[solutionStep];
    const newCube = applyMove(cube, move);
    return { cube: newCube, solutionStep: solutionStep + 1 };
  }),

  setSpeed: (speed) => set({ speed }),
  setMethod: (method) => set({ method }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedFormula: (selectedFormula) => set({ selectedFormula }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSolutionStep: (solutionStep) => set({ solutionStep }),
}));
