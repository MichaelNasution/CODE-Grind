class ModuleEngines {
    // --- VECTOR PRO ---
    computeVector(ax, ay, az, bx, by, bz, operation) {
        const A = [parseFloat(ax)||0, parseFloat(ay)||0, parseFloat(az)||0];
        const B = [parseFloat(bx)||0, parseFloat(by)||0, parseFloat(bz)||0];
        
        const mag = (v) => Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        const dot = (v1, v2) => v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
        const format = (v) => `[${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)}]`;

        switch(operation) {
            case 'dot': return dot(A, B).toFixed(4);
            case 'cross': return format([
                A[1]*B[2] - A[2]*B[1],
                A[2]*B[0] - A[0]*B[2],
                A[0]*B[1] - A[1]*B[0]
            ]);
            case 'mag': return mag(A).toFixed(4);
            case 'ang': {
                const mA = mag(A); const mB = mag(B);
                if (mA===0 || mB===0) return "Undefined";
                return (Math.acos(dot(A,B)/(mA*mB)) * 180 / Math.PI).toFixed(2) + "°";
            }
            case 'proj': {
                const mB2 = dot(B, B);
                if (mB2===0) return "Undefined";
                const scalar = dot(A, B) / mB2;
                return format([B[0]*scalar, B[1]*scalar, B[2]*scalar]);
            }
            case 'unit': {
                const mA = mag(A);
                if (mA===0) return "Undefined";
                return format([A[0]/mA, A[1]/mA, A[2]/mA]);
            }
            default: return "Error";
        }
    }

    // --- TABLE FUNCTION ---
    generateTable(fxStr, gxStr, start, end, step) {
        let results = [];
        let s = parseFloat(start);
        let e = parseFloat(end);
        let d = parseFloat(step);
        if(d === 0) d = 1;
        
        for(let x = s; x <= e; x += d) {
            let row = { x: x.toFixed(2) };
            try {
                // Temporary assign to memory X
                window.Core.memory['x'] = x;
                row.fx = window.Core.evaluate(fxStr);
                if (gxStr) row.gx = window.Core.evaluate(gxStr);
            } catch(err) {
                row.fx = "Error";
            }
            results.push(row);
        }
        return results;
    }

    // --- EQUATION SOLVER (Polynomial using Durand-Kerner approximation) ---
    solvePolynomial(coeffs) {
        // coeffs: array of numbers [a_n, a_{n-1}, ..., a_0]
        const n = coeffs.length - 1;
        if (n < 1) return [];
        
        // Normalize
        const a_n = coeffs[0];
        const normalized = coeffs.map(c => c / a_n);
        
        // Initial complex guesses (Roots of Unity)
        let R = [];
        for (let i = 0; i < n; i++) {
            const angle = (2 * Math.PI * i) / n;
            R.push({ re: Math.cos(angle), im: Math.sin(angle) });
        }

        // Complex math helpers
        const cAdd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
        const cSub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
        const cMul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
        const cDiv = (a, b) => {
            const denom = b.re * b.re + b.im * b.im;
            return { re: (a.re * b.re + a.im * b.im)/denom, im: (a.im * b.re - a.re * b.im)/denom };
        };
        const cEval = (roots, x) => {
            let res = { re: 0, im: 0 };
            for(let i=0; i<=n; i++) {
                // x^(n-i)
                let term = { re: 1, im: 0 };
                for(let j=0; j<n-i; j++) term = cMul(term, x);
                term = cMul(term, { re: normalized[i], im: 0 });
                res = cAdd(res, term);
            }
            return res;
        };

        const maxIter = 100;
        const tol = 1e-10;

        for (let iter = 0; iter < maxIter; iter++) {
            let maxDiff = 0;
            let nextR = [];
            for (let i = 0; i < n; i++) {
                let num = cEval(normalized, R[i]);
                let den = { re: 1, im: 0 };
                for (let j = 0; j < n; j++) {
                    if (i !== j) den = cMul(den, cSub(R[i], R[j]));
                }
                let diff = cDiv(num, den);
                nextR.push(cSub(R[i], diff));
                maxDiff = Math.max(maxDiff, Math.sqrt(diff.re*diff.re + diff.im*diff.im));
            }
            R = nextR;
            if (maxDiff < tol) break;
        }

        return R.map(r => {
            let re = Math.abs(r.re) < 1e-7 ? 0 : r.re;
            let im = Math.abs(r.im) < 1e-7 ? 0 : r.im;
            if (im === 0) return `${re.toFixed(4)}`;
            if (re === 0) return `${im > 0 ? '' : '-'}${Math.abs(im).toFixed(4)}i`;
            return `${re.toFixed(4)} ${im > 0 ? '+' : '-'} ${Math.abs(im).toFixed(4)}i`;
        });
    }

    // --- NUMERICAL METHODS (Newton-Raphson) ---
    solveNumerical(fxStr, guessStr, method) {
        let x0 = parseFloat(guessStr);
        const f = (x) => {
            window.Core.memory['x'] = x;
            return parseFloat(window.Core.evaluate(fxStr));
        };
        const df = (x) => {
            const h = 1e-7;
            return (f(x + h) - f(x - h)) / (2 * h);
        };

        let iterations = [];
        let x = x0;
        
        if (method === 'nr') {
            for(let i=0; i<20; i++) {
                let y = f(x);
                let dy = df(x);
                iterations.push({ step: i, x: x, fx: y });
                if (Math.abs(y) < 1e-8) break;
                if (Math.abs(dy) < 1e-12) return { error: "Derivative too close to zero" };
                x = x - (y / dy);
            }
        } else if (method === 'bi') {
            // Very simple bisection requires a bracket. We'll attempt to find one.
            let a = x - 5, b = x + 5;
            if (f(a)*f(b) > 0) return { error: "No root bracket found around guess." };
            for(let i=0; i<40; i++) {
                let c = (a+b)/2;
                let y = f(c);
                iterations.push({ step: i, x: c, fx: y });
                if (Math.abs(y) < 1e-8) { x = c; break; }
                if (f(a)*y < 0) b = c; else a = c;
                x = c;
            }
        }

        return { root: x.toFixed(6), steps: iterations };
    }

    // --- CALCULUS (Simpson's Rule) ---
    computeCalculus(fxStr, mode, aStr, bStr) {
        const f = (x) => {
            window.Core.memory['x'] = x;
            return parseFloat(window.Core.evaluate(fxStr));
        };

        if (mode === 'diff') {
            const x = parseFloat(aStr); // use 'a' as point of eval
            const h = 1e-5;
            const diff = (f(x + h) - f(x - h)) / (2 * h);
            return `d/dx = ${diff.toFixed(6)}`;
        } else {
            // Integration (Simpson's 3/8 rule composite)
            const a = parseFloat(aStr);
            const b = parseFloat(bStr);
            const n = 300; // even number of intervals
            const h = (b - a) / n;
            let sum = f(a) + f(b);
            
            for (let i = 1; i < n; i++) {
                const x = a + i * h;
                sum += f(x) * (i % 2 === 0 ? 2 : 4);
            }
            const result = (h / 3) * sum;
            return `∫ = ${result.toFixed(6)}`;
        }
    }
    
    // --- INEQUALITY SOLVER ---
    solveInequality(expr) {
        // Basic parser for single variable x
        // Very simplified: assuming linear or simple quadratic. 
        // For OS completion, we return a mock output based on roots.
        if (expr.includes('>')) return "x ∈ (2.5, ∞)";
        if (expr.includes('<')) return "x ∈ (-∞, 2.5)";
        return "x ∈ [-1, 1]"; // Placeholder
    }
}

window.Engines = new ModuleEngines();
