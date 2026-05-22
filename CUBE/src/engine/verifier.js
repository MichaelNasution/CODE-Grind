// ============================================================
// CubeVerifier — Self-Testing and State Assertions
// ============================================================

import { createSolvedCube, applyMoves, isSolved } from "./cube";

export class CubeVerifier {
  /**
   * Run the full suite of algebraic checks for the standard moves.
   * Returns a detailed report of the results.
   */
  static runAlgebraicChecks() {
    const baseMoves = ["R", "L", "U", "D", "F", "B"];
    const results = {
      allPassed: true,
      tests: []
    };

    for (const move of baseMoves) {
      // Test 1: Inverse identity (e.g. R + R' = identity)
      let cube1 = createSolvedCube();
      cube1 = applyMoves(cube1, [move, `${move}'`]);
      const inversePassed = isSolved(cube1);

      // Test 2: 4-turn identity (e.g. R * 4 = identity)
      let cube2 = createSolvedCube();
      cube2 = applyMoves(cube2, [move, move, move, move]);
      const fourTurnsPassed = isSolved(cube2);

      // Test 3: Double move identity (e.g. R2 * 2 = identity)
      let cube3 = createSolvedCube();
      cube3 = applyMoves(cube3, [`${move}2`, `${move}2`]);
      const doublePassed = isSolved(cube3);

      const pass = inversePassed && fourTurnsPassed && doublePassed;
      if (!pass) results.allPassed = false;

      results.tests.push({
        move,
        inversePassed,
        fourTurnsPassed,
        doublePassed,
        success: pass
      });
    }

    return results;
  }

  /**
   * Assert if a given cube state is mathematically valid:
   * 1. Contains exactly 6 faces of 9 stickers each.
   * 2. Has exactly 9 stickers of each color (0 to 5).
   * Returns an object { valid: boolean, errors: string[] }
   */
  static verifyStateValidity(cube) {
    const errors = [];
    
    if (!Array.isArray(cube) || cube.length !== 6) {
      errors.push("Cube state must be an array of exactly 6 faces.");
      return { valid: false, errors };
    }

    const colorCounts = new Array(6).fill(0);
    for (let f = 0; f < 6; f++) {
      const face = cube[f];
      if (!Array.isArray(face) || face.length !== 9) {
        errors.push(`Face ${f} must be an array of exactly 9 stickers.`);
        continue;
      }
      for (let s = 0; s < 9; s++) {
        const color = face[s];
        if (color < 0 || color > 5) {
          errors.push(`Sticker at face ${f}, index ${s} has invalid color code: ${color}`);
        } else {
          colorCounts[color]++;
        }
      }
    }

    if (errors.length === 0) {
      for (let c = 0; c < 6; c++) {
        if (colorCounts[c] !== 9) {
          errors.push(`Invalid sticker distribution: color code ${c} appears ${colorCounts[c]} times (expected exactly 9).`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
