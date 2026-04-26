class NeoFXSystem {
    constructor() {
        this.inputLine = document.getElementById('input-line');
        this.resultLine = document.getElementById('result-line');
        this.shiftIndicator = document.getElementById('shift-indicator');
        this.alphaIndicator = document.getElementById('alpha-indicator');
        this.modeIndicator = document.getElementById('mode-indicator');
        this.chassis = document.querySelector('.calculator-chassis');
        this.appShell = document.getElementById('app-shell');
        this.modeToggle = document.getElementById('mode-toggle');
        this.canvas = document.getElementById('graph-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        // Global State
        this.expression = '';
        this.result = '0';
        this.ansHistory = ['0'];
        this.memory = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, Z: 0 };
        this.isShift = false;
        this.isAlpha = false;
        this.isAdvanced = false;
        this.activeModule = 'sci';
        this.cursorPos = 0;

        this.init();
    }

    init() {
        // Universal Button Listener
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (btn) {
                const val = btn.getAttribute('data-val');
                const key = btn.getAttribute('data-key');
                const action = btn.getAttribute('data-action');
                this.handleInput(val, key, action);
                this.vibrate();
            }

            const vizBtn = e.target.closest('.viz-btn');
            if (vizBtn) {
                const action = vizBtn.getAttribute('data-action');
                this.handleVizAction(action);
            }

            const tab = e.target.closest('.tab-item');
            if (tab) {
                this.handleTabSwitch(tab);
            }
        });

        if (this.modeToggle) this.modeToggle.addEventListener('click', () => this.toggleAdvancedMode());

        document.querySelectorAll('.module-item').forEach(item => {
            item.addEventListener('click', () => this.switchModule(item.getAttribute('data-module')));
        });

        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
        if (this.ctx) this.drawGrid();

        // Initial setup for specific modules
        this.initMatrix(3);
        this.initPhysics();
    }

    switchModule(moduleID) {
        document.querySelectorAll('.module-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`[data-module="${moduleID}"]`).classList.add('active');
        
        document.querySelectorAll('.module-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`${moduleID}-module`);
        if (target) target.classList.add('active');

        this.activeModule = moduleID;
        this.updateDisplay();
    }

    // Matrix Module Logic
    initMatrix(size) {
        const grid = document.getElementById('matrix-grid');
        if (!grid) return;
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        grid.innerHTML = '';
        for (let i = 0; i < size * size; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'grid-cell';
            input.value = '0';
            grid.appendChild(input);
        }
    }

    // Physics Constants Logic
    initPhysics() {
        const list = document.getElementById('const-list');
        if (!list) return;
        const constants = [
            { name: "Speed of Light (c)", val: 299792458 },
            { name: "Planck Constant (h)", val: "6.626e-34" },
            { name: "Gravitational (G)", val: "6.674e-11" },
            { name: "Electron Mass (me)", val: "9.109e-31" },
            { name: "Avogadro (Na)", val: "6.022e23" }
        ];
        list.innerHTML = constants.map(c => `
            <div class="module-item" onclick="neofx.insertConstant('${c.val}')">
                <span>${c.name}</span>
                <span style="color: #444; font-size: 10px;">${c.val}</span>
            </div>
        `).join('');
    }

    insertConstant(val) {
        this.expression += val;
        this.switchModule('sci');
        this.updateDisplay();
    }

    handleInput(val, key, action) {
        if (action) {
            this.handleAction(action);
        } else if (val) {
            this.appendToExpression(val);
        } else if (key) {
            this.handleKey(key);
        }
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'ac': this.expression = ''; this.result = '0'; break;
            case 'del': this.expression = this.expression.slice(0, -1); break;
            case 'equal': this.calculate(); break;
            case 'shift': this.isShift = !this.isShift; this.isAlpha = false; break;
            case 'alpha': this.isAlpha = !this.isAlpha; this.isShift = false; break;
        }
        this.updateIndicators();
    }

    handleKey(key) {
        const keyMap = {
            'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(',
            'log': 'log(', 'ln': 'ln(', 'sqrt': 'sqrt(',
            'sqr': '^2', 'pow': '^', 'abs': 'abs(',
            'nCr': 'C', 'pol': 'Pol(', '(': '(', ')': ')'
        };
        if (keyMap[key]) this.appendToExpression(keyMap[key]);
    }

    appendToExpression(val) {
        if (val === 'ans') this.expression += 'Ans';
        else this.expression += val;
    }

    updateDisplay() {
        if (this.activeModule === 'sci') {
            this.inputLine.innerHTML = this.expression + '<span class="cursor">|</span>';
            this.resultLine.textContent = this.result;
        }
    }

    calculate() {
        try {
            let processedExpr = this.expression
                .replace(/Ans/g, this.ansHistory[0])
                .replace(/π/g, 'Math.PI')
                .replace(/EXP/g, '*10^');

            processedExpr = this.processScientific(processedExpr);
            const resultValue = eval(processedExpr);
            
            if (isNaN(resultValue) || !isFinite(resultValue)) {
                this.result = 'Math ERROR';
            } else {
                this.result = this.formatResult(resultValue);
                this.ansHistory.unshift(this.result);
                if (this.ansHistory.length > 10) this.ansHistory.pop();
            }
        } catch (e) { this.result = 'Syntax ERROR'; }
        this.updateDisplay();
    }

    processScientific(expr) {
        while(expr.includes('^')) {
            expr = expr.replace(/([0-9.e-]+|\([^)]+\))\^([0-9.e-]+|\([^)]+\))/g, 'Math.pow($1, $2)');
        }
        const functions = { 'sin': 'Math.sin', 'cos': 'Math.cos', 'tan': 'Math.tan', 'log': 'Math.log10', 'ln': 'Math.log', 'sqrt': 'Math.sqrt', 'abs': 'Math.abs' };
        for (let [key, val] of Object.entries(functions)) {
            expr = expr.replace(new RegExp(`${key}\\(([^)]+)\\)`, 'g'), (m, p1) => `${val}((${p1}) * Math.PI / 180)`);
        }
        return expr;
    }

    formatResult(num) {
        if (Math.abs(num) < 1e-12 && num !== 0) return '0';
        return num.toString().length > 12 ? parseFloat(num).toPrecision(10) : num.toString();
    }

    handleKeyboard(e) {
        const key = e.key;
        if (/[0-9]/.test(key) || ['+', '-', '*', '/', '(', ')', '^'].includes(key)) this.handleInput(key);
        if (key === 'Enter') this.calculate();
        if (key === 'Backspace') this.handleAction('del');
        if (key === 'Escape') this.handleAction('ac');
    }

    vibrate() { if (navigator.vibrate) navigator.vibrate(5); }
}

document.addEventListener('DOMContentLoaded', () => { window.neofx = new NeoFXSystem(); });
