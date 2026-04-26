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
            if (!btn) return;

            const val = btn.getAttribute('data-val');
            const key = btn.getAttribute('data-key');
            const action = btn.getAttribute('data-action');
            
            this.handleInput(val, key, action);
            this.vibrate();
        });

        // Mode Switching
        if (this.modeToggle) {
            this.modeToggle.addEventListener('click', () => this.toggleAdvancedMode());
        }

        // Module Navigation
        document.querySelectorAll('.module-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchModule(item.getAttribute('data-module'));
            });
        });

        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
        if (this.ctx) this.drawGrid();
    }

    switchModule(moduleID) {
        document.querySelectorAll('.module-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`[data-module="${moduleID}"]`).classList.add('active');
        
        // Logic to hide/show module-specific UI elements would go here
        this.activeModule = moduleID;
        this.updateDisplay();
    }

    toggleAdvancedMode() {
        this.isAdvanced = !this.isAdvanced;
        this.appShell.classList.toggle('advanced-mode', this.isAdvanced);
        this.modeIndicator.textContent = this.isAdvanced ? 'ADV' : 'STD';
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
            case 'ac':
                this.expression = '';
                this.result = '0';
                break;
            case 'del':
                this.expression = this.expression.slice(0, -1);
                break;
            case 'equal':
                this.calculate();
                break;
            case 'shift':
                this.isShift = !this.isShift;
                this.isAlpha = false;
                break;
            case 'alpha':
                this.isAlpha = !this.isAlpha;
                this.isShift = false;
                break;
        }
        this.updateIndicators();
    }

    handleKey(key) {
        const keyMap = {
            'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(',
            'log': 'log(', 'ln': 'ln(', 'sqrt': 'sqrt(',
            'sqr': '^2', 'pow': '^', 'abs': 'abs(',
            'integral': '∫(', 'diff': 'd/dx(', 'nCr': 'C',
            'pol': 'Pol(', '(': '(', ')': ')'
        };
        if (keyMap[key]) this.appendToExpression(keyMap[key]);
    }

    appendToExpression(val) {
        if (val === 'ans') {
            this.expression += 'Ans';
        } else {
            this.expression += val;
        }
    }

    updateIndicators() {
        this.shiftIndicator.classList.toggle('active', this.isShift);
        this.alphaIndicator.classList.toggle('active', this.isAlpha);
        this.chassis.classList.toggle('shift-active', this.isShift);
        this.chassis.classList.toggle('alpha-active', this.isAlpha);
    }

    updateDisplay() {
        this.inputLine.innerHTML = this.expression + '<span class="cursor">|</span>';
        this.resultLine.textContent = this.result;
    }

    calculate() {
        try {
            let expr = this.expression;
            
            // Substitutions for Evaluation
            let processedExpr = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/π/g, 'Math.PI')
                .replace(/Ans/g, this.ansHistory[0]);

            // Advanced Math Processing
            processedExpr = this.processScientific(processedExpr);

            const resultValue = eval(processedExpr);
            
            if (isNaN(resultValue) || !isFinite(resultValue)) {
                this.result = 'Math ERROR';
            } else {
                this.result = this.formatResult(resultValue);
                this.ansHistory.unshift(this.result);
                if (this.ansHistory.length > 10) this.ansHistory.pop();
            }
        } catch (e) {
            this.result = 'Syntax ERROR';
        }
        this.updateDisplay();
    }

    processScientific(expr) {
        // Handle powers
        while(expr.includes('^')) {
            expr = expr.replace(/([0-9.]+|\([^)]+\))\^([0-9.]+|\([^)]+\))/g, 'Math.pow($1, $2)');
        }

        // Functions mapping
        const functions = {
            'sin': 'Math.sin', 'cos': 'Math.cos', 'tan': 'Math.tan',
            'log': 'Math.log10', 'ln': 'Math.log', 'sqrt': 'Math.sqrt',
            'abs': 'Math.abs'
        };

        for (let [key, val] of Object.entries(functions)) {
            let regex = new RegExp(`${key}\\(([^)]+)\\)`, 'g');
            expr = expr.replace(regex, (m, p1) => {
                // Convert trig to radians if in DEG mode
                if (['sin', 'cos', 'tan'].includes(key)) {
                    return `${val}((${p1}) * Math.PI / 180)`;
                }
                return `${val}(${p1})`;
            });
        }

        // Implicit multiplication (e.g., 2(3) -> 2*(3))
        expr = expr.replace(/(\d)\(/g, '$1*(');
        expr = expr.replace(/\)(\d)/g, ')*$1');

        return expr;
    }

    formatResult(num) {
        if (Math.abs(num) < 1e-12 && num !== 0) return '0';
        let str = num.toString();
        if (str.length > 12) return parseFloat(num).toPrecision(10);
        return str;
    }

    drawGrid() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;
        for(let i = 0; i < width; i += 20) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, height); this.ctx.stroke();
        }
        for(let i = 0; i < height; i += 20) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(width, i); this.ctx.stroke();
        }
    }

    handleKeyboard(e) {
        const key = e.key;
        if (/[0-9]/.test(key)) this.handleInput(key);
        if (['+', '-', '*', '/'].includes(key)) this.handleInput(key);
        if (key === 'Enter') this.calculate();
        if (key === 'Backspace') this.handleAction('del');
        if (key === 'Escape') this.handleAction('ac');
    }

    vibrate() {
        if (navigator.vibrate) navigator.vibrate(5);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.neofx = new NeoFXSystem();
});
