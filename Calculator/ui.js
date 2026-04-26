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
                let formattedResult = state.lastResult;

                // Special formatters for complex results
                if (state.activeModule === 'table') {
                    const data = state.lastResult;
                    const gx = state.visualization?.data?.gxStr;
                    formattedResult = `<table style="width:100%; text-align:center; border-collapse: collapse;">
                                <tr><th style="border-bottom:1px solid #334155; padding:5px;">x</th>
                                <th style="border-bottom:1px solid #334155; padding:5px;">f(x)</th>`;
                    if(gx) formattedResult += `<th style="border-bottom:1px solid #334155; padding:5px;">g(x)</th>`;
                    formattedResult += `</tr>`;
                    data.forEach(r => {
                        formattedResult += `<tr><td>${r.x}</td><td>${r.fx}</td>`;
                        if(gx) formattedResult += `<td>${r.gx}</td>`;
                        formattedResult += `</tr>`;
                    });
                    formattedResult += `</table>`;
                } else if (state.activeModule === 'solver') {
                    formattedResult = state.lastResult.map((r, i) => `x${i+1} = ${r}`).join('<br>') || "No roots found";
                } else if (state.activeModule === 'numerical') {
                    let res = state.lastResult;
                    let html = `Root: <strong>${res.root}</strong><br><br>Steps:<br>`;
                    res.steps.forEach(s => html += `x${s.step}: ${s.x.toFixed(4)} (f(x)=${s.fx.toExponential(2)})<br>`);
                    formattedResult = `<div style="max-height:100px; overflow-y:auto; font-size:12px;">${html}</div>`;
                }

                this.showResult(`${state.activeModule}-result`, formattedResult);
            }
            
            // Loading State
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
            
            const activeResultBox = document.querySelector(`#${window.AppState.activeModule}-result`);
            if (window.AnimationSystem && window.FeedbackSystem) {
                setTimeout(() => { // Small delay to let Reactivity update DOM first
                    window.AnimationSystem.resultReveal(activeResultBox);
                    window.FeedbackSystem.success(activeResultBox);
                }, 50);
            }
        });

        window.EventBus.subscribe("COMPUTE_ERROR", (errorMsg) => {
            window.setState(state => {
                state.error = errorMsg;
                state.lastResult = null;
            });
            
            const activeResultBox = document.querySelector(`#${window.AppState.activeModule}-result`);
            if (window.FeedbackSystem) {
                setTimeout(() => {
                    window.FeedbackSystem.error(activeResultBox);
                    window.FeedbackSystem.hapticSimulate('heavy');
                }, 50);
            }
        });

        // Module Transition via Event
        window.EventBus.subscribe("MODULE_CHANGE", (payload) => {
            const oldEl = document.getElementById(`${payload.oldModule}-module`);
            const newEl = document.getElementById(`${payload.newModule}-module`);
            const navOld = document.querySelector(`[data-module="${payload.oldModule}"]`);
            const navNew = document.querySelector(`[data-module="${payload.newModule}"]`);
            
            if (navOld) navOld.classList.remove('active');
            if (navNew) navNew.classList.add('active');

            if (window.AnimationSystem) {
                window.AnimationSystem.moduleExit(oldEl);
                setTimeout(() => {
                    if(oldEl) oldEl.classList.remove('active');
                    if(newEl) {
                        newEl.classList.add('active');
                        window.AnimationSystem.moduleEnter(newEl);
                    }
                }, 200);
            } else {
                if(oldEl) oldEl.classList.remove('active');
                if(newEl) newEl.classList.add('active');
            }
        });
    }

    init() {
        // Apply Global Animations to Buttons
        document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .tab-item, .d-btn').forEach(btn => {
            if (window.MicroInteractionSystem) {
                window.MicroInteractionSystem.attachRipple(btn);
            }
            btn.addEventListener('mousedown', () => {
                if (window.AnimationSystem) window.AnimationSystem.buttonPress(btn);
                if (window.FeedbackSystem) window.FeedbackSystem.hapticSimulate('light');
            });
            btn.addEventListener('mouseup', () => {
                if (window.AnimationSystem) window.AnimationSystem.buttonRelease(btn);
            });
            btn.addEventListener('mouseleave', () => {
                if (window.AnimationSystem) window.AnimationSystem.buttonRelease(btn);
            });
        });

        // Apply Global Animations to Inputs
        document.querySelectorAll('.input-field').forEach(input => {
            if (window.MicroInteractionSystem) {
                window.MicroInteractionSystem.inputFocus(input);
            }
        });

        // Module Navigation
        document.querySelectorAll('.module-item').forEach(item => {
            item.addEventListener('click', () => {
                const newMod = item.getAttribute('data-module');
                const oldMod = window.AppState.activeModule;
                if (newMod === oldMod) return;
                
                this.switchModule(oldMod, newMod);
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

    switchModule(oldMod, newMod) {
            window.setState(state => { 
                state.activeModule = newMod; 
                state.lastResult = null; 
                state.error = null; 
            });
            window.EventBus.dispatch("MODULE_CHANGE", { oldModule: oldMod, newModule: newMod });
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
                // COMPLEX MODE
                case 'complex-solve': {
                    const payload = {
                        expr: document.getElementById('complex-expr').value,
                        format: document.getElementById('complex-format').value
                    };
                    window.setState(s => s.loading = true);
                    window.EventBus.dispatch("COMPUTE_REQUEST", { module: "complex", data: payload });
                    break;
                }

                // MATRIX PRO
                case 'mat-det':
                case 'mat-inv': {
                    const size = parseInt(document.getElementById('matrix-size').value);
                    const gridCells = document.querySelectorAll('#matrix-grid .grid-cell');
                    let matrixData = [];
                    let idx = 0;
                    for (let r = 0; r < size; r++) {
                        let row = [];
                        for (let c = 0; c < size; c++) {
                            row.push(parseFloat(gridCells[idx++].value) || 0);
                        }
                        matrixData.push(row);
                    }
                    const payload = {
                        matrix: matrixData,
                        operation: action === 'mat-det' ? 'determinant' : 'inverse'
                    };
                    window.setState(s => s.loading = true);
                    window.EventBus.dispatch("COMPUTE_REQUEST", { module: "matrix", data: payload });
                    break;
                }

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
                    const payload = {
                        fxStr: document.getElementById('table-fx').value,
                        gxStr: document.getElementById('table-gx').value,
                        start: document.getElementById('table-start').value,
                        end: document.getElementById('table-end').value,
                        step: document.getElementById('table-step').value
                    };
                    window.setState(s => s.loading = true);
                    window.EventBus.dispatch("COMPUTE_REQUEST", { module: "table", data: payload });
                    break;
                }

                // EQUATION SOLVER
                case 'solver-solve': {
                    const mode = document.getElementById('solver-mode').value;
                    if(mode.startsWith('poly')) {
                        const deg = parseInt(mode.replace('poly', ''));
                        let coeffs = [];
                        for(let i=deg; i>=0; i--) coeffs.push(parseFloat(document.getElementById(`poly-c${i}`).value)||0);
                        
                        window.setState(s => s.loading = true);
                        window.EventBus.dispatch("COMPUTE_REQUEST", { module: "solver", data: { coeffs } });
                    }
                    break;
                }

                // NUMERICAL N-R
                case 'num-solve': {
                    const payload = {
                        fxStr: document.getElementById('num-fx').value,
                        guessStr: document.getElementById('num-guess').value,
                        method: document.getElementById('num-method').value
                    };
                    window.setState(s => s.loading = true);
                    window.EventBus.dispatch("COMPUTE_REQUEST", { module: "numerical", data: payload });
                    break;
                }

                // CALCULUS
                case 'calc-solve': {
                    const payload = {
                        fxStr: document.getElementById('calc-fx').value,
                        mode: document.getElementById('calc-mode').value,
                        aStr: document.getElementById('calc-a').value,
                        bStr: document.getElementById('calc-b').value
                    };
                    window.setState(s => s.loading = true);
                    window.EventBus.dispatch("COMPUTE_REQUEST", { module: "calculus", data: payload });
                    break;
                }
                
                // INEQUALITY
                case 'ineq-solve': {
                    const payload = { expr: document.getElementById('ineq-expr').value };
                    window.setState(s => s.loading = true);
                    window.EventBus.dispatch("COMPUTE_REQUEST", { module: "inequality", data: payload });
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
