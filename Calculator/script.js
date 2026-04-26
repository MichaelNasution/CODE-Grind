class Calculator {
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
        this.ctx = this.canvas.getContext('2d');

        this.expression = '';
        this.result = '0';
        this.ans = '0';
        this.isShift = false;
        this.isAlpha = false;
        this.isAdvanced = false;

        this.init();
        this.drawGrid();
    }

    init() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = btn.getAttribute('data-val');
                const key = btn.getAttribute('data-key');
                const action = btn.getAttribute('data-action');
                
                this.handleInput(val, key, action);
                this.vibrate();
            });
        });

        if (this.modeToggle) {
            this.modeToggle.addEventListener('click', () => this.toggleAdvancedMode());
        }

        // Module switching
        document.querySelectorAll('.module-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.module-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
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
            return;
        }

        if (val) {
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
                this.updateDisplay();
                break;
            case 'del':
                this.expression = this.expression.slice(0, -1);
                this.updateDisplay();
                break;
            case 'equal':
                this.calculate();
                break;
            case 'shift':
                this.toggleShift();
                break;
            case 'alpha':
                this.toggleAlpha();
                break;
        }
    }

    handleKey(key) {
        switch (key) {
            case 'sin': this.appendToExpression('sin('); break;
            case 'cos': this.appendToExpression('cos('); break;
            case 'tan': this.appendToExpression('tan('); break;
            case 'log': this.appendToExpression('log('); break;
            case 'ln': this.appendToExpression('ln('); break;
            case 'sqrt': this.appendToExpression('sqrt('); break;
            case 'sqr': this.appendToExpression('^2'); break;
            case 'pow': this.appendToExpression('^'); break;
            case '(': this.appendToExpression('('); break;
            case ')': this.appendToExpression(')'); break;
            case 'optn': if(this.isAdvanced) this.appendToExpression(':'); break;
        }
    }

    appendToExpression(val) {
        if (val === 'ans') {
            this.expression += 'Ans';
        } else {
            this.expression += val;
        }
    }

    toggleShift() {
        this.isShift = !this.isShift;
        this.isAlpha = false;
        this.updateIndicators();
    }

    toggleAlpha() {
        this.isAlpha = !this.isAlpha;
        this.isShift = false;
        this.updateIndicators();
    }

    updateIndicators() {
        this.shiftIndicator.classList.toggle('active', this.isShift);
        this.alphaIndicator.classList.toggle('active', this.isAlpha);
        this.chassis.classList.toggle('shift-active', this.isShift);
        this.chassis.classList.toggle('alpha-active', this.isAlpha);
    }

    updateDisplay() {
        this.inputLine.textContent = this.expression;
        this.resultLine.textContent = this.result;
        if (this.isAdvanced && this.expression.includes('x')) {
            this.drawGraph();
        }
    }

    calculate() {
        try {
            // Support multi-statement using :
            const statements = this.expression.split(':');
            let finalResult = 0;

            statements.forEach(stmt => {
                let processedExpr = stmt
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/−/g, '-')
                    .replace(/π/g, 'Math.PI')
                    .replace(/Ans/g, this.ans);

                // Handle power operator ^
                while(processedExpr.includes('^')) {
                    processedExpr = processedExpr.replace(/([0-9.]+|\([^)]+\))\^([0-9.]+|\([^)]+\))/g, 'Math.pow($1, $2)');
                }

                // Scientific functions
                processedExpr = processedExpr.replace(/sin\(([^)]+)\)/g, (m, p1) => `Math.sin((${p1}) * Math.PI / 180)`);
                processedExpr = processedExpr.replace(/cos\(([^)]+)\)/g, (m, p1) => `Math.cos((${p1}) * Math.PI / 180)`);
                processedExpr = processedExpr.replace(/tan\(([^)]+)\)/g, (m, p1) => `Math.tan((${p1}) * Math.PI / 180)`);
                processedExpr = processedExpr.replace(/log\(([^)]+)\)/g, (m, p1) => `Math.log10(${p1})`);
                processedExpr = processedExpr.replace(/ln\(([^)]+)\)/g, (m, p1) => `Math.log(${p1})`);
                processedExpr = processedExpr.replace(/sqrt\(([^)]+)\)/g, (m, p1) => `Math.sqrt(${p1})`);

                // Implicit multiplication
                processedExpr = processedExpr.replace(/(\d)\(/g, '$1*(');
                processedExpr = processedExpr.replace(/\)(\d)/g, ')*$1');

                finalResult = eval(processedExpr);
                this.ans = finalResult; // Update Ans for next statement
            });
            
            if (isNaN(finalResult) || !isFinite(finalResult)) {
                this.result = 'Math ERROR';
            } else {
                this.result = this.formatResult(finalResult);
                this.ans = this.result;
            }
            this.updateDisplay();
        } catch (e) {
            console.error(e);
            this.result = 'Syntax ERROR';
            this.updateDisplay();
        }
    }

    formatResult(num) {
        if (Math.abs(num) < 1e-10 && num !== 0) return '0';
        const str = num.toString();
        if (str.length > 12) {
            return parseFloat(num).toPrecision(8);
        }
        return str;
    }

    drawGrid() {
        if (!this.canvas) return;
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        
        for(let i = 0; i < width; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, height);
            this.ctx.stroke();
        }
        for(let i = 0; i < height; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(width, i);
            this.ctx.stroke();
        }
    }

    drawGraph() {
        this.drawGrid();
        // Visualization placeholder
    }

    handleKeyboard(e) {
        const key = e.key;
        if (/[0-9]/.test(key)) this.handleInput(key);
        if (key === '.') this.handleInput('.');
        if (key === '+') this.handleInput('+');
        if (key === '-') this.handleInput('-');
        if (key === '*') this.handleInput('*');
        if (key === '/') this.handleInput('/');
        if (key === 'Enter') this.calculate();
        if (key === 'Backspace') this.handleAction('del');
        if (key === 'Escape') this.handleAction('ac');
    }

    vibrate() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});
