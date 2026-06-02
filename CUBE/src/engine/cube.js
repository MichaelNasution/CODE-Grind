// ============================================================
// Cube 3x3 Engine — State, Moves, Scramble, Solve (Layer-by-Layer)
// ============================================================

// Face indices: U=0 R=1 F=2 D=3 L=4 B=5
// Each face: 9 stickers [0..8] in reading order (row-major)
// Colors: 0=White(U) 1=Red(R) 2=Green(F) 3=Yellow(D) 4=Orange(L) 5=Blue(B)

const SOLVED_COLORS = [0,1,2,3,4,5]; // face index → color

export function createSolvedCube() {
  const faces = [];
  for (let f = 0; f < 6; f++) {
    faces.push(new Array(9).fill(SOLVED_COLORS[f]));
  }
  return faces;
}

export function cloneCube(cube) {
  return cube.map(face => [...face]);
}

export function isSolved(cube) {
  for (let f = 0; f < 6; f++) {
    const c = cube[f][0];
    if (!cube[f].every(s => s === c)) return false;
  }
  return true;
}



// ─────── MOVE DEFINITIONS ────────────────────────────────────
// Each move mutates a clone of the cube
export function applyMove(cube, move) {
  switch(move) {
    case "R":  return applyBaseMove(cube, "R");
    case "R'": return applyMoves(cube, ["R", "R", "R"]);
    case "R2": return applyMoves(cube, ["R", "R"]);
    case "L":  return applyBaseMove(cube, "L");
    case "L'": return applyMoves(cube, ["L", "L", "L"]);
    case "L2": return applyMoves(cube, ["L", "L"]);
    case "U":  return applyBaseMove(cube, "U");
    case "U'": return applyMoves(cube, ["U", "U", "U"]);
    case "U2": return applyMoves(cube, ["U", "U"]);
    case "D":  return applyBaseMove(cube, "D");
    case "D'": return applyMoves(cube, ["D", "D", "D"]);
    case "D2": return applyMoves(cube, ["D", "D"]);
    case "F":  return applyBaseMove(cube, "F");
    case "F'": return applyMoves(cube, ["F", "F", "F"]);
    case "F2": return applyMoves(cube, ["F", "F"]);
    case "B":  return applyBaseMove(cube, "B");
    case "B'": return applyMoves(cube, ["B", "B", "B"]);
    case "B2": return applyMoves(cube, ["B", "B"]);
    default: return cube;
  }
}

function applyBaseMove(cube, move) {
  const c = cloneCube(cube);
  const old = cloneCube(cube);
  const [U,R,F,D,L,B] = [0,1,2,3,4,5];
  
  if (move === "R") {
    // Face U
    c[U][2] = old[B][0]; c[U][5] = old[B][3]; c[U][8] = old[B][6];
    // Face R
    c[R][0] = old[R][2]; c[R][1] = old[R][5]; c[R][2] = old[R][8];
    c[R][3] = old[R][1]; c[R][4] = old[R][4]; c[R][5] = old[R][7];
    c[R][6] = old[R][0]; c[R][7] = old[R][3]; c[R][8] = old[R][6];
    // Face F
    c[F][2] = old[U][8]; c[F][5] = old[U][5]; c[F][8] = old[U][2];
    // Face D
    c[D][2] = old[F][8]; c[D][5] = old[F][5]; c[D][8] = old[F][2];
    // Face B
    c[B][0] = old[D][2]; c[B][3] = old[D][5]; c[B][6] = old[D][8];
  } else if (move === "L") {
    // Face U
    c[U][0] = old[F][6]; c[U][3] = old[F][3]; c[U][6] = old[F][0];
    // Face F
    c[F][0] = old[D][6]; c[F][3] = old[D][3]; c[F][6] = old[D][0];
    // Face D
    c[D][0] = old[B][2]; c[D][3] = old[B][5]; c[D][6] = old[B][8];
    // Face L
    c[L][0] = old[L][2]; c[L][1] = old[L][5]; c[L][2] = old[L][8];
    c[L][3] = old[L][1]; c[L][4] = old[L][4]; c[L][5] = old[L][7];
    c[L][6] = old[L][0]; c[L][7] = old[L][3]; c[L][8] = old[L][6];
    // Face B
    c[B][2] = old[U][0]; c[B][5] = old[U][3]; c[B][8] = old[U][6];
  } else if (move === "U") {
    // Face U
    c[U][0] = old[U][6]; c[U][1] = old[U][3]; c[U][2] = old[U][0];
    c[U][3] = old[U][7]; c[U][4] = old[U][4]; c[U][5] = old[U][1];
    c[U][6] = old[U][8]; c[U][7] = old[U][5]; c[U][8] = old[U][2];
    // Face R
    c[R][0] = old[F][0]; c[R][1] = old[F][1]; c[R][2] = old[F][2];
    // Face F
    c[F][0] = old[L][0]; c[F][1] = old[L][1]; c[F][2] = old[L][2];
    // Face L
    c[L][0] = old[B][0]; c[L][1] = old[B][1]; c[L][2] = old[B][2];
    // Face B
    c[B][0] = old[R][0]; c[B][1] = old[R][1]; c[B][2] = old[R][2];
  } else if (move === "D") {
    // Face R
    c[R][6] = old[B][6]; c[R][7] = old[B][7]; c[R][8] = old[B][8];
    // Face F
    c[F][6] = old[R][6]; c[F][7] = old[R][7]; c[F][8] = old[R][8];
    // Face D
    c[D][0] = old[D][6]; c[D][1] = old[D][3]; c[D][2] = old[D][0];
    c[D][3] = old[D][7]; c[D][4] = old[D][4]; c[D][5] = old[D][1];
    c[D][6] = old[D][8]; c[D][7] = old[D][5]; c[D][8] = old[D][2];
    // Face L
    c[L][6] = old[F][6]; c[L][7] = old[F][7]; c[L][8] = old[F][8];
    // Face B
    c[B][6] = old[L][6]; c[B][7] = old[L][7]; c[B][8] = old[L][8];
  } else if (move === "F") {
    // Face U
    c[U][0] = old[R][0]; c[U][1] = old[R][3]; c[U][2] = old[R][6];
    // Face R
    c[R][0] = old[D][8]; c[R][3] = old[D][7]; c[R][6] = old[D][6];
    // Face F
    c[F][0] = old[F][2]; c[F][1] = old[F][5]; c[F][2] = old[F][8];
    c[F][3] = old[F][1]; c[F][4] = old[F][4]; c[F][5] = old[F][7];
    c[F][6] = old[F][0]; c[F][7] = old[F][3]; c[F][8] = old[F][6];
    // Face D
    c[D][6] = old[L][2]; c[D][7] = old[L][5]; c[D][8] = old[L][8];
    // Face L
    c[L][2] = old[U][2]; c[L][5] = old[U][1]; c[L][8] = old[U][0];
  } else if (move === "B") {
    // Face U
    c[U][6] = old[L][6]; c[U][7] = old[L][3]; c[U][8] = old[L][0];
    // Face R
    c[R][2] = old[U][6]; c[R][5] = old[U][7]; c[R][8] = old[U][8];
    // Face D
    c[D][0] = old[R][8]; c[D][1] = old[R][5]; c[D][2] = old[R][2];
    // Face L
    c[L][0] = old[D][0]; c[L][3] = old[D][1]; c[L][6] = old[D][2];
    // Face B
    c[B][0] = old[B][2]; c[B][1] = old[B][5]; c[B][2] = old[B][8];
    c[B][3] = old[B][1]; c[B][4] = old[B][4]; c[B][5] = old[B][7];
    c[B][6] = old[B][0]; c[B][7] = old[B][3]; c[B][8] = old[B][6];
  }
}

// ─────── MOVE PARSER ─────────────────────────────────────────
export function parseMoves(notation) {
  if (!notation || notation === "—") return [];
  // Clean up parentheses and extra whitespace
  return notation.replace(/[()[\]]/g, " ")
    .trim().split(/\s+/)
    .filter(m => /^[RUFLBD][2']?$|^[xyz][2']?$|^M[2']?$/.test(m));
}

export function applyMoves(cube, moves) {
  let c = cloneCube(cube);
  for (const m of moves) {
    c = applyMove(c, m);
  }
  return c;
}

export function applyNotation(cube, notation) {
  return applyMoves(cube, parseMoves(notation));
}

// ─────── SCRAMBLE GENERATOR ──────────────────────────────────
const SCRAMBLE_MOVES = ["R","R'","R2","L","L'","L2","U","U'","U2","D","D'","D2","F","F'","F2","B","B'","B2"];
const getFace = m => m[0];

export function generateScramble(length = 20) {
  const moves = [];
  let lastFace = "", secondLastFace = "";
  for (let i = 0; i < length; i++) {
    let candidates = SCRAMBLE_MOVES.filter(m => {
      const f = getFace(m);
      return f !== lastFace && f !== secondLastFace;
    });
    if (!candidates.length) candidates = SCRAMBLE_MOVES;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    moves.push(pick);
    secondLastFace = lastFace;
    lastFace = getFace(pick);
  }
  return moves;
}

// ─────── SIMPLE BEGINNER SOLVER (stub) ───────────────────────
// Returns the scramble moves reversed as a baseline "undo" solver
// A full LBL/CFOP solver is complex — this gives visual feedback
export function solveByUndo(scrambleMoves) {
  const inverseMap = {"R":"R'","R'":"R","R2":"R2","L":"L'","L'":"L","L2":"L2",
    "U":"U'","U'":"U","U2":"U2","D":"D'","D'":"D","D2":"D2",
    "F":"F'","F'":"F","F2":"F2","B":"B'","B'":"B","B2":"B2"};
  return [...scrambleMoves].reverse().map(m => inverseMap[m] || m);
}

export const FACE_COLORS = {
  0:"#FFFFFF", // White (U)
  1:"#EF3B36", // Red (R)
  2:"#228B22", // Green (F)
  3:"#FFD700", // Yellow (D)
  4:"#FF8C42", // Orange (L)
  5:"#4169E1", // Blue (B)
};
export const FACE_NAMES = ["U","R","F","D","L","B"];
