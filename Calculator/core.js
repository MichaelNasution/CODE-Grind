class CoreEngine {
    constructor() {
        this.ansHistory = ['0'];
    }

    get memory() {
        return window.AppState ? window.AppState.variables : {};
    }

    evaluate(expression) {
        try {
            // Build evaluation scope from AppState
            const scope = { ...this.memory };
            scope.Ans = parseFloat(this.ansHistory[0] || '0');
            
            // Allow shorthand π and EXP
            let processed = expression
                .replace(/π/g, 'pi')
                .replace(/EXP/g, '*10^');

            // Evaluate using robust math.js AST parser
            const resultValue = math.evaluate(processed, scope);
            
            // Sync any variable mutations back to AppState (e.g. if user types A = 5)
            if (window.AppState) {
                window.setState(state => {
                    for (const key in state.variables) {
                        if (scope[key] !== undefined) state.variables[key] = scope[key];
                    }
                    // Handle dynamic variable creation if needed
                    if (scope.x !== undefined) state.variables.x = scope.x;
                });
            }
            
            // Extract numeric value if result is a math.js object (e.g., Complex number)
            let numericResult;
            if (typeof resultValue === 'number') {
                numericResult = resultValue;
            } else if (resultValue && resultValue.isComplex) {
                numericResult = resultValue; // math.js handles complex formatting
            } else if (resultValue && typeof resultValue.valueOf === 'function') {
                numericResult = resultValue.valueOf();
            } else {
                numericResult = parseFloat(resultValue);
            }

            if (typeof numericResult === 'number' && (isNaN(numericResult) || !isFinite(numericResult))) {
                throw new Error("Math ERROR");
            }
            
            const formatted = this.formatResult(numericResult);
            this.pushAns(formatted);
            return formatted;

        } catch (e) {
            console.error(e);
            throw new Error(e.message.includes("Math ERROR") ? "Math ERROR" : "Syntax ERROR: " + e.message);
        }
    }

    // Pure functional evaluation without side effects
    evaluateWithLocal(expression, localScope) {
        try {
            const scope = { ...this.memory, ...localScope };
            scope.Ans = parseFloat(this.ansHistory[0] || '0');
            
            let processed = expression
                .replace(/π/g, 'pi')
                .replace(/EXP/g, '*10^');

            return math.evaluate(processed, scope);
        } catch (e) {
            return NaN; // Fail gracefully for plotting
        }
    }

    formatResult(result) {
        if (typeof result === 'number') {
            if (Math.abs(result) < 1e-12 && result !== 0) return '0';
            return result.toString().length > 12 ? parseFloat(result).toPrecision(10) : result.toString();
        }
        // Let math.js format complex numbers, matrices, etc.
        return math.format(result, { precision: 10 });
    }

    pushAns(val) {
        this.ansHistory.unshift(val);
        if (this.ansHistory.length > 10) this.ansHistory.pop();
    }
}

window.Core = new CoreEngine();
