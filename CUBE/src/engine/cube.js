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

// Rotate a face 90° clockwise (indices)
function rotateFaceCW(face) {
  return [
    face[6], face[3], face[0],
    face[7], face[4], face[1],
    face[8], face[5], face[2],
  ];
}
function rotateFaceCCW(face) {
  return [
    face[2], face[5], face[8],
    face[1], face[4], face[7],
    face[0], face[3], face[6],
  ];
}
function rotateFace180(face) {
  return [...face].reverse();
}

// ─────── MOVE DEFINITIONS ────────────────────────────────────
// Each move mutates a clone of the cube
export function applyMove(cube, move) {
  const c = cloneCube(cube);
  const [U,R,F,D,L,B] = [0,1,2,3,4,5];
  switch(move) {
    case "R":  moveR(c,U,R,F,D,L,B,false,false); break;
    case "R'": moveR(c,U,R,F,D,L,B,true,false); break;
    case "R2": moveR(c,U,R,F,D,L,B,false,true); break;
    case "L":  moveL(c,U,R,F,D,L,B,false,false); break;
    case "L'": moveL(c,U,R,F,D,L,B,true,false); break;
    case "L2": moveL(c,U,R,F,D,L,B,false,true); break;
    case "U":  moveU(c,U,R,F,D,L,B,false,false); break;
    case "U'": moveU(c,U,R,F,D,L,B,true,false); break;
    case "U2": moveU(c,U,R,F,D,L,B,false,true); break;
    case "D":  moveD(c,U,R,F,D,L,B,false,false); break;
    case "D'": moveD(c,U,R,F,D,L,B,true,false); break;
    case "D2": moveD(c,U,R,F,D,L,B,false,true); break;
    case "F":  moveF(c,U,R,F,D,L,B,false,false); break;
    case "F'": moveF(c,U,R,F,D,L,B,true,false); break;
    case "F2": moveF(c,U,R,F,D,L,B,false,true); break;
    case "B":  moveB(c,U,R,F,D,L,B,false,false); break;
    case "B'": moveB(c,U,R,F,D,L,B,true,false); break;
    case "B2": moveB(c,U,R,F,D,L,B,false,true); break;
    default: break;
  }
  return c;
}

function moveR(c,U,R,F,D,L,B,prime,double) {
  if(double){
    c[R] = rotateFace180(c[R]);
    const tmp=[c[U][2],c[U][5],c[U][8]];
    [c[U][2],c[U][5],c[U][8]]=[c[D][2],c[D][5],c[D][8]];
    [c[D][2],c[D][5],c[D][8]]=tmp;
    const tmp2=[c[F][2],c[F][5],c[F][8]];
    [c[F][2],c[F][5],c[F][8]]=[c[B][6],c[B][3],c[B][0]];
    [c[B][6],c[B][3],c[B][0]]=tmp2;
    return;
  }
  if(!prime){ c[R]=rotateFaceCW(c[R]); } else { c[R]=rotateFaceCCW(c[R]); }
  const tmp=[c[U][2],c[U][5],c[U][8]];
  if(!prime){
    [c[U][2],c[U][5],c[U][8]]=[c[F][2],c[F][5],c[F][8]];
    [c[F][2],c[F][5],c[F][8]]=[c[D][2],c[D][5],c[D][8]];
    [c[D][2],c[D][5],c[D][8]]=[c[B][6],c[B][3],c[B][0]];
    [c[B][6],c[B][3],c[B][0]]=tmp;
  } else {
    [c[U][2],c[U][5],c[U][8]]=[c[B][6],c[B][3],c[B][0]];
    [c[B][6],c[B][3],c[B][0]]=[c[D][2],c[D][5],c[D][8]];
    [c[D][2],c[D][5],c[D][8]]=[c[F][2],c[F][5],c[F][8]];
    [c[F][2],c[F][5],c[F][8]]=tmp;
  }
}

function moveL(c,U,R,F,D,L,B,prime,double) {
  if(double){
    c[L]=rotateFace180(c[L]);
    const tmp=[c[U][0],c[U][3],c[U][6]];
    [c[U][0],c[U][3],c[U][6]]=[c[D][0],c[D][3],c[D][6]];
    [c[D][0],c[D][3],c[D][6]]=tmp;
    const tmp2=[c[F][0],c[F][3],c[F][6]];
    [c[F][0],c[F][3],c[F][6]]=[c[B][8],c[B][5],c[B][2]];
    [c[B][8],c[B][5],c[B][2]]=tmp2;
    return;
  }
  if(!prime){ c[L]=rotateFaceCW(c[L]); } else { c[L]=rotateFaceCCW(c[L]); }
  const tmp=[c[U][0],c[U][3],c[U][6]];
  if(!prime){
    [c[U][0],c[U][3],c[U][6]]=[c[B][8],c[B][5],c[B][2]];
    [c[B][8],c[B][5],c[B][2]]=[c[D][0],c[D][3],c[D][6]];
    [c[D][0],c[D][3],c[D][6]]=[c[F][0],c[F][3],c[F][6]];
    [c[F][0],c[F][3],c[F][6]]=tmp;
  } else {
    [c[U][0],c[U][3],c[U][6]]=[c[F][0],c[F][3],c[F][6]];
    [c[F][0],c[F][3],c[F][6]]=[c[D][0],c[D][3],c[D][6]];
    [c[D][0],c[D][3],c[D][6]]=[c[B][8],c[B][5],c[B][2]];
    [c[B][8],c[B][5],c[B][2]]=tmp;
  }
}

function moveU(c,U,R,F,D,L,B,prime,double) {
  if(double){
    c[U]=rotateFace180(c[U]);
    const tmp=[c[F][0],c[F][1],c[F][2]];
    [c[F][0],c[F][1],c[F][2]]=[c[B][0],c[B][1],c[B][2]];
    [c[B][0],c[B][1],c[B][2]]=tmp;
    const tmp2=[c[R][0],c[R][1],c[R][2]];
    [c[R][0],c[R][1],c[R][2]]=[c[L][0],c[L][1],c[L][2]];
    [c[L][0],c[L][1],c[L][2]]=tmp2;
    return;
  }
  if(!prime){ c[U]=rotateFaceCW(c[U]); } else { c[U]=rotateFaceCCW(c[U]); }
  const tmp=[c[F][0],c[F][1],c[F][2]];
  if(!prime){
    [c[F][0],c[F][1],c[F][2]]=[c[R][0],c[R][1],c[R][2]];
    [c[R][0],c[R][1],c[R][2]]=[c[B][0],c[B][1],c[B][2]];
    [c[B][0],c[B][1],c[B][2]]=[c[L][0],c[L][1],c[L][2]];
    [c[L][0],c[L][1],c[L][2]]=tmp;
  } else {
    [c[F][0],c[F][1],c[F][2]]=[c[L][0],c[L][1],c[L][2]];
    [c[L][0],c[L][1],c[L][2]]=[c[B][0],c[B][1],c[B][2]];
    [c[B][0],c[B][1],c[B][2]]=[c[R][0],c[R][1],c[R][2]];
    [c[R][0],c[R][1],c[R][2]]=tmp;
  }
}

function moveD(c,U,R,F,D,L,B,prime,double) {
  if(double){
    c[D]=rotateFace180(c[D]);
    const tmp=[c[F][6],c[F][7],c[F][8]];
    [c[F][6],c[F][7],c[F][8]]=[c[B][6],c[B][7],c[B][8]];
    [c[B][6],c[B][7],c[B][8]]=tmp;
    const tmp2=[c[R][6],c[R][7],c[R][8]];
    [c[R][6],c[R][7],c[R][8]]=[c[L][6],c[L][7],c[L][8]];
    [c[L][6],c[L][7],c[L][8]]=tmp2;
    return;
  }
  if(!prime){ c[D]=rotateFaceCW(c[D]); } else { c[D]=rotateFaceCCW(c[D]); }
  const tmp=[c[F][6],c[F][7],c[F][8]];
  if(!prime){
    [c[F][6],c[F][7],c[F][8]]=[c[L][6],c[L][7],c[L][8]];
    [c[L][6],c[L][7],c[L][8]]=[c[B][6],c[B][7],c[B][8]];
    [c[B][6],c[B][7],c[B][8]]=[c[R][6],c[R][7],c[R][8]];
    [c[R][6],c[R][7],c[R][8]]=tmp;
  } else {
    [c[F][6],c[F][7],c[F][8]]=[c[R][6],c[R][7],c[R][8]];
    [c[R][6],c[R][7],c[R][8]]=[c[B][6],c[B][7],c[B][8]];
    [c[B][6],c[B][7],c[B][8]]=[c[L][6],c[L][7],c[L][8]];
    [c[L][6],c[L][7],c[L][8]]=tmp;
  }
}

function moveF(c,U,R,F,D,L,B,prime,double) {
  if(double){
    c[F]=rotateFace180(c[F]);
    const tmp=[c[U][6],c[U][7],c[U][8]];
    [c[U][6],c[U][7],c[U][8]]=[c[D][2],c[D][1],c[D][0]];
    [c[D][2],c[D][1],c[D][0]]=tmp;
    const tmp2=[c[R][0],c[R][3],c[R][6]];
    [c[R][0],c[R][3],c[R][6]]=[c[L][8],c[L][5],c[L][2]];
    [c[L][8],c[L][5],c[L][2]]=tmp2;
    return;
  }
  if(!prime){ c[F]=rotateFaceCW(c[F]); } else { c[F]=rotateFaceCCW(c[F]); }
  const tmp=[c[U][6],c[U][7],c[U][8]];
  if(!prime){
    [c[U][6],c[U][7],c[U][8]]=[c[L][8],c[L][5],c[L][2]];
    [c[L][8],c[L][5],c[L][2]]=[c[D][0],c[D][1],c[D][2]];
    [c[D][0],c[D][1],c[D][2]]=[c[R][0],c[R][3],c[R][6]];
    [c[R][0],c[R][3],c[R][6]]=tmp;
  } else {
    [c[U][6],c[U][7],c[U][8]]=[c[R][0],c[R][3],c[R][6]];
    [c[R][0],c[R][3],c[R][6]]=[c[D][2],c[D][1],c[D][0]];
    [c[D][2],c[D][1],c[D][0]]=[c[L][8],c[L][5],c[L][2]];
    [c[L][8],c[L][5],c[L][2]]=tmp;
  }
}

function moveB(c,U,R,F,D,L,B,prime,double) {
  if(double){
    c[B]=rotateFace180(c[B]);
    const tmp=[c[U][0],c[U][1],c[U][2]];
    [c[U][0],c[U][1],c[U][2]]=[c[D][8],c[D][7],c[D][6]];
    [c[D][8],c[D][7],c[D][6]]=tmp;
    const tmp2=[c[R][2],c[R][5],c[R][8]];
    [c[R][2],c[R][5],c[R][8]]=[c[L][6],c[L][3],c[L][0]];
    [c[L][6],c[L][3],c[L][0]]=tmp2;
    return;
  }
  if(!prime){ c[B]=rotateFaceCW(c[B]); } else { c[B]=rotateFaceCCW(c[B]); }
  const tmp=[c[U][0],c[U][1],c[U][2]];
  if(!prime){
    [c[U][0],c[U][1],c[U][2]]=[c[R][2],c[R][5],c[R][8]];
    [c[R][2],c[R][5],c[R][8]]=[c[D][8],c[D][7],c[D][6]];
    [c[D][8],c[D][7],c[D][6]]=[c[L][6],c[L][3],c[L][0]];
    [c[L][6],c[L][3],c[L][0]]=tmp;
  } else {
    [c[U][0],c[U][1],c[U][2]]=[c[L][6],c[L][3],c[L][0]];
    [c[L][6],c[L][3],c[L][0]]=[c[D][8],c[D][7],c[D][6]];
    [c[D][8],c[D][7],c[D][6]]=[c[R][2],c[R][5],c[R][8]];
    [c[R][2],c[R][5],c[R][8]]=tmp;
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
const FACE_OF = {R:"R",L:"L",U:"U",D:"D",F:"F",B:"B"};
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
