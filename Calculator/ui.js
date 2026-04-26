class UIController {
    constructor() {
        this.init();
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        window.EventBus.subscribe("STATE_UPDATED", (state) => {
            // Render Result
            if (state.error) {
                this.showResult(`${state.activeModule}-result`, "ERROR: " + state.error, true);
            } else if (state.lastResult !== null) {
                this.showResult(`${state.activeModule}-result`, state.lastResult);
            }
            
            // Loading State (optional visual cue)
            if (state.loading) {
                this.showLoading(`${state.activeModule}-result`);
            }
        });

        window.EventBus.subscribe("COMPUTE_SUCCESS", (resultData) => {
            window.setState(state => {
                state.lastResult = resultData.result;
                state.error = null;
                state.visualization = {
                    type: resultData.vizData?.type,
                    data: resultData.vizData
                };
            });
        });

        window.EventBus.subscribe("COMPUTE_ERROR", (errorMsg) => {
            window.setState(state => {
                state.error = errorMsg;
                state.lastResult = null;
            });
        });
    }

    init() {
        // Module Navigation
        document.querySelectorAll('.module-item').forEach(item => {
            item.addEventListener('click', () => {
                const mod = item.getAttribute('data-module');
                this.switchModule(mod);
                window.setState(state => { state.activeModule = mod; state.lastResult = null; state.error = null; });
            });
        });

        // Scientific Keys
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSciKey(e.currentTarget));
        });

        // Module Action Buttons
        document.querySelectorAll('button[data-action]').forEach(btn => {
            if(!btn.classList.contains('btn')) { // skip sci buttons
                btn.addEventListener('click', (e) => this.handleModuleAction(e.currentTarget));
            }
        });

        // Enter key to compute
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                const activeMod = window.AppState.activeModule;
                if(activeMod === 'sci') this.executeSciCompute();
                else {
                    const activeContent = document.getElementById(`${activeMod}-module`);
                    if(!activeContent) return;
                    const primaryBtn = activeContent.querySelector('.btn-primary');
                    if(primaryBtn) primaryBtn.click();
                }
            }
        });

        // Setup dynamic matrices
        const matSizeSel = document.getElementById('matrix-size');
        if(matSizeSel) {
            matSizeSel.addEventListener('change', (e) => this.renderMatrixGrid(parseInt(e.target.value)));
            this.renderMatrixGrid(3);
        }

        // Draw initial grid
        window.Viz.clear();
    }

    switchModule(moduleID) {
        document.querySelectorAll('.module-item').forEach(i => i.classList.remove('active'));
        const navItem = document.querySelector(`[data-module="${moduleID}"]`);
        if(navItem) navItem.classList.add('active');
        
        document.querySelectorAll('.module-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`${moduleID}-module`);
        if (target) target.classList.add('active');

        window.Viz.clear(); // Reset canvas
    }

    showLoading(resultBoxId) {
        const box = document.getElementById(resultBoxId);
        if(box) {
            box.style.color = '#94a3b8';
            box.innerHTML = 'Computing <span class="cursor">...</span>';
        }
    }

    showResult(resultBoxId, htmlContent, isError = false) {
        const box = document.getElementById(resultBoxId);
        if(box) {
            box.style.color = isError ? '#f43f5e' : 'var(--neon-cyan)';
            box.innerHTML = htmlContent;
            box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    handleModuleAction(btn) {
        const action = btn.getAttribute('data-action');
        
        try {
            switch(action) {
                // VECTOR PRO
                case 'vec-dot':
                case 'vec-cross':
                case 'vec-mag':
                case 'vec-ang':
                case 'vec-proj':
                case 'vec-unit': {
                    const payload = {
                        ax: document.getElementById('vecA-x').value,
                        ay: document.getElementById('vecA-y').value,
                        az: document.getElementById('vecA-z').value,
                        bx: document.getElementById('vecB-x').value,
                        by: document.getElementById('vecB-y').value,
                        bz: document.getElementById('vecB-z').value,
                        operation: action.split('-')[1]
                    };
                    
                    window.setState(s => s.loading = true);
                    window.EventBus.dispatch("COMPUTE_REQUEST", {
                        module: "vector",
                        data: payload
                    });
                    break;
                }

                // TABLE FUNCTION
                case 'table-gen': {
                    const fx = document.getElementById('table-fx').value;
                    const gx = document.getElementById('table-gx').value;
                    const s = document.getElementById('table-start').value;
                    const e = document.getElementById('table-end').value;
                    const st = document.getElementById('table-step').value;
                    
                    const data = window.Engines.generateTable(fx, gx, s, e, st);
                    let html = `<table style="width:100%; text-align:center; border-collapse: collapse;">
                                <tr><th style="border-bottom:1px solid #334155; padding:5px;">x</th>
                                <th style="border-bottom:1px solid #334155; padding:5px;">f(x)</th>`;
                    if(gx) html += `<th style="border-bottom:1px solid #334155; padding:5px;">g(x)</th>`;
                    html += `</tr>`;
                    
                    data.forEach(r => {
                        html += `<tr><td>${r.x}</td><td>${r.fx}</td>`;
                        if(gx) html += `<td>${r.gx}</td>`;
                        html += `</tr>`;
                    });
                    html += `</table>`;
                    this.showResult('table-result', html);
                    window.Viz.drawFunctionGraph(fx, gx);
                    break;
                }

                // EQUATION SOLVER
                case 'solver-solve': {
                    this.showLoading('solver-result');
                    setTimeout(() => { // Simulate processing for complex roots
                        const mode = document.getElementById('solver-mode').value;
                        if(mode.startsWith('poly')) {
                            const deg = parseInt(mode.replace('poly', ''));
                            let coeffs = [];
                            for(let i=deg; i>=0; i--) {
                                coeffs.push(parseFloat(document.getElementById(`poly-c${i}`).value)||0);
                            }
                            const roots = window.Engines.solvePolynomial(coeffs);
                            let html = roots.map((r, i) => `x${i+1} = ${r}`).join('<br>');
                            this.showResult('solver-result', html || "No roots found");
                        }
                    }, 100);
                    break;
                }

                // NUMERICAL N-R
                case 'num-solve': {
                    const fx = document.getElementById('num-fx').value;
                    const g = document.getElementById('num-guess').value;
                    const m = document.getElementById('num-method').value;
                    const res = window.Engines.solveNumerical(fx, g, m);
                    
                    if(res.error) {
                        this.showResult('num-result', res.error, true);
                    } else {
                        let html = `Root: <strong>${res.root}</strong><br><br>Steps:<br>`;
                        res.steps.forEach(s => html += `x${s.step}: ${s.x.toFixed(4)} (f(x)=${s.fx.toExponential(2)})<br>`);
                        this.showResult('num-result', `<div style="max-height:100px; overflow-y:auto; font-size:12px;">${html}</div>`);
                        window.Viz.drawNewtonSteps(fx, res.root, res.steps);
                    }
                    break;
                }

                // CALCULUS
                case 'calc-solve': {
                    const fx = document.getElementById('calc-fx').value;
                    const m = document.getElementById('calc-mode').value;
                    const a = document.getElementById('calc-a').value;
                    const b = document.getElementById('calc-b').value;
                    const res = window.Engines.computeCalculus(fx, m, a, b);
                    this.showResult('calc-result', res);
                    if(m === 'int') window.Viz.drawIntegralArea(fx, parseFloat(a), parseFloat(b));
                    else window.Viz.drawFunctionGraph(fx);
                    break;
                }
                
                // INEQUALITY
                case 'ineq-solve': {
                    const expr = document.getElementById('ineq-expr').value;
                    const res = window.Engines.solveInequality(expr);
                    this.showResult('ineq-result', res);
                    window.Viz.drawNumberLine(res);
                    break;
                }
            }
        } catch(err) {
            this.showResult(`${this.activeModule}-result`, "Syntax ERROR: " + err.message, true);
        }
    }

    renderMatrixGrid(size) {
        const grid = document.getElementById('matrix-grid');
        const solverGrid = document.getElementById('solver-inputs');
        
        if(grid) {
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
            grid.style.gap = '5px';
            grid.innerHTML = '';
            for (let i = 0; i < size * size; i++) {
                grid.innerHTML += `<input type="number" class="grid-cell" value="0">`;
            }
        }
        
        // Also handle Solver inputs if mode changes
        const solverModeSel = document.getElementById('solver-mode');
        if(solverModeSel && solverGrid) {
            solverModeSel.addEventListener('change', (e) => {
                const m = e.target.value;
                solverGrid.innerHTML = '';
                if(m.startsWith('poly')) {
                    const deg = parseInt(m.replace('poly', ''));
                    solverGrid.style.display = 'flex';
                    solverGrid.style.gap = '5px';
                    for(let i=deg; i>=0; i--) {
                        solverGrid.innerHTML += `<input type="number" id="poly-c${i}" class="grid-cell" placeholder="x^${i}">`;
                    }
                }
            });
            solverModeSel.dispatchEvent(new Event('change'));
        }
    }

    // --- SCIENTIFIC CALCULATOR HANDLING ---
    handleSciKey(btn) {
        const val = btn.getAttribute('data-val');
        const key = btn.getAttribute('data-key');
        const action = btn.getAttribute('data-action');
        
        const exprElem = document.getElementById('input-line');
        if(action) {
            if(action === 'equal') this.executeSciCompute();
            if(action === 'ac') { window.sciExpr = ''; exprElem.innerHTML = '<span class="cursor">|</span>'; document.getElementById('result-line').textContent = '0'; }
            if(action === 'del') { window.sciExpr = window.sciExpr.slice(0, -1); exprElem.innerHTML = window.sciExpr + '<span class="cursor">|</span>'; }
        } else {
            if(!window.sciExpr) window.sciExpr = '';
            
            if(val) window.sciExpr += val === 'ans' ? 'Ans' : val;
            else if(key) {
                const km = {'sin':'sin(', 'cos':'cos(', 'tan':'tan(', 'log':'log(', 'ln':'ln(', 'sqrt':'sqrt(', 'sqr':'^2', 'pow':'^', '(':'(', ')':')', 'abs':'abs('};
                if(km[key]) window.sciExpr += km[key];
            }
            exprElem.innerHTML = window.sciExpr + '<span class="cursor">|</span>';
        }
    }

    executeSciCompute() {
        if(!window.sciExpr) return;
        try {
            const res = window.Core.evaluate(window.sciExpr);
            document.getElementById('result-line').textContent = res;
        } catch(err) {
            document.getElementById('result-line').textContent = err.message;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => { window.App = new UIController(); });
