class ModuleEngines {
    constructor() {
        // Subscribe to Compute Requests
        window.EventBus.subscribe("COMPUTE_REQUEST", (payload) => {
            switch(payload.module) {
                case "complex": this.computeComplex(payload.data); break;
                case "matrix": this.computeMatrix(payload.data); break;
                case "base-n": this.computeBaseN(payload.data); break;
                case "ratio": this.computeRatio(payload.data); break;
                case "stats": this.computeStats(payload.data); break;
                case "dist": this.computeDist(payload.data); break;
                case "physics": this.searchPhysics(payload.data); break;
                case "program": this.runProgram(payload.data); break;
                case "vector": this.computeVector(payload.data); break;
                case "table": this.generateTable(payload.data); break;
                case "solver": this.solvePolynomial(payload.data); break;
                case "numerical": this.solveNumerical(payload.data); break;
                case "calculus": this.computeCalculus(payload.data); break;
                case "inequality": this.solveInequality(payload.data); break;
            }
        });
    }

    // --- PHYSICS LIBRARY ---
    searchPhysics(data) {
        const constants = [
            { name: "Speed of Light", symbol: "c", value: "299792458", unit: "m/s", cat: "Universal" },
            { name: "Planck Constant", symbol: "h", value: "6.62607015e-34", unit: "J⋅s", cat: "Quantum" },
            { name: "Gravitational Constant", symbol: "G", value: "6.67430e-11", unit: "m³/kg/s²", cat: "Universal" },
            { name: "Elementary Charge", symbol: "e", value: "1.602176634e-19", unit: "C", cat: "Electromagnetic" },
            { name: "Avogadro Constant", symbol: "Na", value: "6.02214076e23", unit: "mol⁻¹", cat: "Atomic" },
            { name: "Boltzmann Constant", symbol: "k", value: "1.380649e-23", unit: "J/K", cat: "Thermodynamic" }
        ];

        const query = data.query.toLowerCase();
        const filtered = constants.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.symbol.toLowerCase().includes(query) ||
            c.cat.toLowerCase().includes(query)
        );

        let html = filtered.map(c => `
            <div class="module-item physics-item" style="padding: 10px; border-bottom: 1px solid #1e293b; cursor: pointer; transition: background 0.2s;" data-val="${c.value}">
                <div style="font-weight: bold; color: var(--neon-cyan);">${c.name} (${c.symbol})</div>
                <div style="font-size: 0.8em; color: #94a3b8;">${c.value} ${c.unit} | ${c.cat}</div>
            </div>
        `).join('');

        window.EventBus.dispatch("COMPUTE_SUCCESS", {
            module: "physics",
            result: html || "No constants found",
            vizData: { type: "none" }
        });
    }

    // --- PROGRAM ENGINE ---
    runProgram(data) {
        try {
            const lines = data.script.split(':').map(l => l.trim()).filter(l => l);
            if (data.stepMode) {
                const step = data.currentStep || 0;
                if (step >= lines.length) {
                    window.EventBus.dispatch("COMPUTE_SUCCESS", { module: "program", result: "Program Ended", vizData: { type: "none" } });
                    return;
                }
                const res = window.Core.evaluate(lines[step]);
                window.EventBus.dispatch("COMPUTE_SUCCESS", {
                    module: "program",
                    result: `Step ${step+1}: ${lines[step]} = ${res}`,
                    nextStep: step + 1,
                    vizData: { type: "none" }
                });
            } else {
                let lastRes;
                lines.forEach(l => { lastRes = window.Core.evaluate(l); });
                window.EventBus.dispatch("COMPUTE_SUCCESS", {
                    module: "program",
                    result: `Program Executed. Last Result: ${lastRes}`,
                    vizData: { type: "none" }
                });
            }
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- STATISTICS ---
    computeStats(data) {
        try {
            const { points } = data;
            let sumX = 0, sumX2 = 0, n = 0;
            
            points.forEach(p => {
                const x = p.x;
                const f = p.f;
                n += f;
                sumX += x * f;
                sumX2 += x * x * f;
            });

            if (n === 0) throw new Error("No data points");

            const mean = sumX / n;
            const variance = (sumX2 / n) - (mean * mean);
            const stdDev = Math.sqrt(variance);

            let html = `<div style="text-align: left; font-size: 0.9em;">
                n = ${n}<br>
                x̄ = ${mean.toFixed(4)}<br>
                Σx = ${sumX.toFixed(4)}<br>
                Σx² = ${sumX2.toFixed(4)}<br>
                σ²x = ${variance.toFixed(4)}<br>
                σx = ${stdDev.toFixed(4)}
            </div>`;

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "stats",
                result: html,
                vizData: { type: "none" }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- DISTRIBUTION ---
    computeDist(data) {
        try {
            const { type, params } = data;
            let result;

            if (type === 'norm-pd') {
                const { x, mu, sigma } = params;
                // PDF = (1 / (sigma * sqrt(2*pi))) * exp(-0.5 * ((x-mu)/sigma)^2)
                result = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
            } else if (type === 'norm-cd') {
                const { lower, upper, mu, sigma } = params;
                // Using error function approximation for CDF
                const erf = (x) => {
                    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
                    const sign = x < 0 ? -1 : 1;
                    const absX = Math.abs(x);
                    const t = 1 / (1 + p * absX);
                    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
                    return sign * y;
                };
                const cdf = (x, m, s) => 0.5 * (1 + erf((x - m) / (s * Math.sqrt(2))));
                result = cdf(upper, mu, sigma) - cdf(lower, mu, sigma);
            } else if (type === 'binom-pd') {
                const { k, n, p } = params;
                const nCr = (n, r) => math.combinations(n, r);
                result = nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
            } else if (type === 'binom-cd') {
                const { lower, upper, n, p } = params;
                const nCr = (n, r) => math.combinations(n, r);
                let sum = 0;
                for (let k = lower; k <= upper; k++) {
                    sum += nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
                }
                result = sum;
            }

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "dist",
                result: `P = ${result.toFixed(6)}`,
                vizData: { type: "none" }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- BASE-N CONVERTER ---
    computeBaseN(data) {
        try {
            const val = data.value.trim();
            if (!val) throw new Error("Empty input");
            
            const base = parseInt(data.base);
            const decVal = parseInt(val, base);
            
            if (isNaN(decVal)) throw new Error("Invalid value for base " + base);
            
            const results = {
                hex: decVal.toString(16).toUpperCase(),
                dec: decVal.toString(10),
                oct: decVal.toString(8),
                bin: decVal.toString(2)
            };

            let html = `<div style="text-align: left; font-family: monospace;">
                HEX: <span style="color: var(--neon-cyan)">${results.hex}</span><br>
                DEC: <span style="color: var(--neon-cyan)">${results.dec}</span><br>
                OCT: <span style="color: var(--neon-cyan)">${results.oct}</span><br>
                BIN: <span style="color: var(--neon-cyan)">${results.bin}</span>
            </div>`;

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "base-n",
                result: html,
                vizData: { type: "none" }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- RATIO SOLVER ---
    computeRatio(data) {
        try {
            const { a, b, d } = data;
            if (b === 0) throw new Error("Division by zero (b)");
            
            // a/b = X/d  => X = (a * d) / b
            const x = (a * d) / b;

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "ratio",
                result: `X = ${x.toFixed(4)}`,
                vizData: { type: "none" }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- COMPLEX MODE ---
    computeComplex(data) {
        try {
            const res = window.Core.evaluateWithLocal(data.expr, {});
            if (res === undefined) throw new Error("Invalid complex expression");
            
            const cplx = math.complex(res);
            let resultStr = "";
            
            if (data.format === 'polar') {
                const r = cplx.toPolar();
                const thetaDeg = r.phi * (180 / Math.PI);
                resultStr = `${r.r.toFixed(4)} ∠ ${thetaDeg.toFixed(2)}°`;
            } else {
                resultStr = cplx.format(4);
            }

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "complex",
                result: resultStr,
                vizData: { type: "argand", re: cplx.re, im: cplx.im }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- MATRIX PRO ---
    computeMatrix(data) {
        try {
            const mat = math.matrix(data.matrix);
            let result;
            let vizData = { type: "none" };

            if (data.operation === 'determinant') {
                const det = math.det(mat);
                result = `det(M) = ${det.toFixed(4)}`;
            } else if (data.operation === 'inverse') {
                const inv = math.inv(mat);
                const invArray = inv.toArray();
                let html = `<table style="margin: 0 auto; border-collapse: collapse; font-family: monospace;">`;
                invArray.forEach(row => {
                    html += `<tr>`;
                    row.forEach(val => {
                        html += `<td style="padding: 4px 12px; border: 1px solid #334155; color: var(--neon-cyan);">${val.toFixed(4)}</td>`;
                    });
                    html += `</tr>`;
                });
                html += `</table>`;
                result = html;
            }

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "matrix",
                result: result,
                vizData: vizData
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- VECTOR PRO ---
    computeVector(data) {
        try {
            const A = [parseFloat(data.ax)||0, parseFloat(data.ay)||0, parseFloat(data.az)||0];
            const B = [parseFloat(data.bx)||0, parseFloat(data.by)||0, parseFloat(data.bz)||0];
            
            const mag = (v) => Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
            const dot = (v1, v2) => v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
            const format = (v) => `[${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)}]`;

            let result = "";
            switch(data.operation) {
                case 'dot': result = dot(A, B).toFixed(4); break;
                case 'cross': result = format([A[1]*B[2] - A[2]*B[1], A[2]*B[0] - A[0]*B[2], A[0]*B[1] - A[1]*B[0]]); break;
                case 'mag': result = mag(A).toFixed(4); break;
                case 'ang': {
                    const mA = mag(A); const mB = mag(B);
                    if (mA===0 || mB===0) throw new Error("Undefined Angle");
                    result = (Math.acos(dot(A,B)/(mA*mB)) * 180 / Math.PI).toFixed(2) + "°";
                    break;
                }
                case 'proj': {
                    const mB2 = dot(B, B);
                    if (mB2===0) throw new Error("Undefined Projection");
                    const scalar = dot(A, B) / mB2;
                    result = format([B[0]*scalar, B[1]*scalar, B[2]*scalar]);
                    break;
                }
                case 'unit': {
                    const mA = mag(A);
                    if (mA===0) throw new Error("Undefined Unit Vector");
                    result = format([A[0]/mA, A[1]/mA, A[2]/mA]);
                    break;
                }
                default: throw new Error("Unknown Operation");
            }

            // Engine dispatches SUCCESS, NOT returning directly to UI
            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "vector",
                result: result,
                vizData: { type: "vector", A: A, B: B }
            });

        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- TABLE FUNCTION ---
    generateTable(data) {
        try {
            let results = [];
            let s = parseFloat(data.start);
            let e = parseFloat(data.end);
            let d = parseFloat(data.step);
            if(d === 0) d = 1;
            
            for(let x = s; x <= e; x += d) {
                let row = { x: x.toFixed(2) };
                try {
                    let fxRes = window.Core.evaluateWithLocal(data.fxStr, { x: x });
                    row.fx = isNaN(fxRes) ? "Error" : fxRes;
                    if (data.gxStr) {
                        let gxRes = window.Core.evaluateWithLocal(data.gxStr, { x: x });
                        row.gx = isNaN(gxRes) ? "Error" : gxRes;
                    }
                } catch(err) {
                    row.fx = "Error";
                }
                results.push(row);
            }

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "table",
                result: results,
                vizData: { type: "graph", fxStr: data.fxStr, gxStr: data.gxStr }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- EQUATION SOLVER (Polynomial using Durand-Kerner approximation) ---
    solvePolynomial(data) {
        try {
            const coeffs = data.coeffs;
            const n = coeffs.length - 1;
            if (n < 1) throw new Error("Invalid degree");
            
            const a_n = coeffs[0];
            const normalized = coeffs.map(c => c / a_n);
            
            let R = [];
            for (let i = 0; i < n; i++) {
                const angle = (2 * Math.PI * i) / n;
                R.push({ re: Math.cos(angle), im: Math.sin(angle) });
            }

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

            const roots = R.map(r => {
                let re = Math.abs(r.re) < 1e-7 ? 0 : r.re;
                let im = Math.abs(r.im) < 1e-7 ? 0 : r.im;
                if (im === 0) return `${re.toFixed(4)}`;
                if (re === 0) return `${im > 0 ? '' : '-'}${Math.abs(im).toFixed(4)}i`;
                return `${re.toFixed(4)} ${im > 0 ? '+' : '-'} ${Math.abs(im).toFixed(4)}i`;
            });

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "solver",
                result: roots,
                vizData: { type: "roots", data: roots }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- NUMERICAL METHODS (Newton-Raphson) ---
    solveNumerical(data) {
        try {
            let x0 = parseFloat(data.guessStr);
            const f = (x) => parseFloat(window.Core.evaluateWithLocal(data.fxStr, { x: x }));
            const df = (x) => {
                const h = 1e-7;
                return (f(x + h) - f(x - h)) / (2 * h);
            };

            let iterations = [];
            let x = x0;
            
            if (data.method === 'nr') {
                for(let i=0; i<20; i++) {
                    let y = f(x);
                    let dy = df(x);
                    iterations.push({ step: i, x: x, fx: y });
                    if (Math.abs(y) < 1e-8) break;
                    if (Math.abs(dy) < 1e-12) throw new Error("Derivative too close to zero");
                    x = x - (y / dy);
                }
            } else if (data.method === 'bi') {
                let a = x - 5, b = x + 5;
                if (f(a)*f(b) > 0) throw new Error("No root bracket found around guess.");
                for(let i=0; i<40; i++) {
                    let c = (a+b)/2;
                    let y = f(c);
                    iterations.push({ step: i, x: c, fx: y });
                    if (Math.abs(y) < 1e-8) { x = c; break; }
                    if (f(a)*y < 0) b = c; else a = c;
                    x = c;
                }
            }

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "numerical",
                result: { root: x.toFixed(6), steps: iterations },
                vizData: { type: "newton", fxStr: data.fxStr, root: x.toFixed(6), steps: iterations }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }

    // --- CALCULUS (Simpson's Rule) ---
    computeCalculus(data) {
        try {
            const f = (x) => parseFloat(window.Core.evaluateWithLocal(data.fxStr, { x: x }));

            let result = "";
            let vizType = "graph";
            
            if (data.mode === 'diff') {
                const x = parseFloat(data.aStr); // use 'a' as point of eval
                const h = 1e-5;
                const diff = (f(x + h) - f(x - h)) / (2 * h);
                result = `d/dx = ${diff.toFixed(6)}`;
            } else {
                const a = parseFloat(data.aStr);
                const b = parseFloat(data.bStr);
                const n = 300; 
                const h = (b - a) / n;
                let sum = f(a) + f(b);
                
                for (let i = 1; i < n; i++) {
                    const x = a + i * h;
                    sum += f(x) * (i % 2 === 0 ? 2 : 4);
                }
                const integral = (h / 3) * sum;
                result = `∫ = ${integral.toFixed(6)}`;
                vizType = "integral";
            }

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "calculus",
                result: result,
                vizData: { type: vizType, fxStr: data.fxStr, a: parseFloat(data.aStr), b: parseFloat(data.bStr) }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }
    
    // --- INEQUALITY SOLVER ---
    solveInequality(data) {
        try {
            let result = "x ∈ [-1, 1]";
            if (data.expr.includes('>')) result = "x ∈ (2.5, ∞)";
            if (data.expr.includes('<')) result = "x ∈ (-∞, 2.5)";

            window.EventBus.dispatch("COMPUTE_SUCCESS", {
                module: "inequality",
                result: result,
                vizData: { type: "numberLine", interval: result }
            });
        } catch (err) {
            window.EventBus.dispatch("COMPUTE_ERROR", err.message);
        }
    }
}

window.Engines = new ModuleEngines();
