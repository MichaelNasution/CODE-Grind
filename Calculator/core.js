class CoreEngine {
    constructor() {
        this.memory = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, Z: 0 };
        this.ansHistory = ['0'];
    }

    evaluate(expression) {
        try {
            let processed = expression
                .replace(/Ans/g, `(${this.ansHistory[0] || '0'})`)
                .replace(/π/g, 'Math.PI')
                .replace(/EXP/g, '*10^');

            // Handle memory variables
            for (const v in this.memory) {
                const regex = new RegExp(`\\b${v}\\b`, 'g');
                processed = processed.replace(regex, `(${this.memory[v]})`);
            }

            processed = this.processScientific(processed);
            
            const resultValue = eval(processed);
            
            if (isNaN(resultValue) || !isFinite(resultValue)) {
                throw new Error("Math ERROR");
            }
            
            const formatted = this.formatResult(resultValue);
            this.pushAns(formatted);
            return formatted;

        } catch (e) {
            console.error(e);
            throw new Error(e.message === "Math ERROR" ? "Math ERROR" : "Syntax ERROR");
        }
    }

    processScientific(expr) {
        // Handle powers (x^y)
        while(expr.includes('^')) {
            expr = expr.replace(/([0-9.e-]+|\([^)]+\))\^([0-9.e-]+|\([^)]+\))/g, 'Math.pow($1, $2)');
        }
        
        // Functions mapping
        const functions = { 
            'sin': 'Math.sin', 'cos': 'Math.cos', 'tan': 'Math.tan', 
            'log': 'Math.log10', 'ln': 'Math.log', 'sqrt': 'Math.sqrt', 
            'abs': 'Math.abs' 
        };
        
        for (let [key, val] of Object.entries(functions)) {
            // Need to handle nested parentheses better in a real parser, but this works for basic cases
            expr = expr.replace(new RegExp(`${key}\\(([^)]+)\\)`, 'g'), (m, p1) => {
                if (['sin', 'cos', 'tan'].includes(key)) {
                    return `${val}((${p1}) * Math.PI / 180)`; // Default to Degrees
                }
                return `${val}(${p1})`;
            });
        }
        return expr;
    }

    formatResult(num) {
        if (Math.abs(num) < 1e-12 && num !== 0) return '0';
        return num.toString().length > 12 ? parseFloat(num).toPrecision(10) : num.toString();
    }

    pushAns(val) {
        this.ansHistory.unshift(val);
        if (this.ansHistory.length > 10) this.ansHistory.pop();
    }
}

window.Core = new CoreEngine();
