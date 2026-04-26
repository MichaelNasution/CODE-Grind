class VisualizationEngine {
    constructor() {
        this.canvas = document.getElementById('graph-canvas');
        if(this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.width = this.canvas.width = this.canvas.offsetWidth;
            this.height = this.canvas.height = this.canvas.offsetHeight;
        }

        // Event-Driven Visualization
        window.EventBus.subscribe("STATE_UPDATED", (state) => {
            if (state.visualization && state.visualization.type) {
                this.render(state.visualization);
            } else {
                this.clear(); // Clear canvas if no viz data
            }
        });
    }

    render(viz) {
        switch(viz.type) {
            case 'vector':
                this.drawVector(viz.data.A[0], viz.data.A[1], viz.data.B[0], viz.data.B[1]);
                break;
            case 'argand':
                this.drawArgand(viz.data.re, viz.data.im);
                break;
            case 'graph':
                this.drawFunctionGraph(viz.data.fxStr, viz.data.gxStr);
                break;
            case 'integral':
                this.drawIntegralArea(viz.data.fxStr, viz.data.a, viz.data.b);
                break;
            case 'newton':
                this.drawNewtonSteps(viz.data.fxStr, viz.data.root, viz.data.steps);
                break;
            case 'numberLine':
                this.drawNumberLine(viz.data.interval);
                break;
            case 'roots':
                // In a full implementation, this would plot the complex roots on a plane
                // For now, we clear the canvas as polynomials don't have a simple 2D f(x) graph payload
                this.clear(); 
                break;
        }
    }

    clear() {
        if(!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;
        for(let i = 0; i < this.width; i += 20) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.height); this.ctx.stroke();
        }
        for(let i = 0; i < this.height; i += 20) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.width, i); this.ctx.stroke();
        }
        // Axes
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(this.width/2, 0); this.ctx.lineTo(this.width/2, this.height); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.moveTo(0, this.height/2); this.ctx.lineTo(this.width, this.height/2); this.ctx.stroke();
    }

    // Maps math coordinates to canvas pixels
    mapPt(x, y, scale = 20) {
        return {
            px: this.width/2 + x * scale,
            py: this.height/2 - y * scale
        };
    }

    drawFunctionGraph(fxStr, gxStr = null) {
        this.clear();
        const f = (x) => parseFloat(window.Core.evaluateWithLocal(fxStr, { x: x }));
        let g = null;
        if(gxStr) g = (x) => parseFloat(window.Core.evaluateWithLocal(gxStr, { x: x }));
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#38bdf8'; // Cyan
        this.ctx.lineWidth = 2;
        for(let px = 0; px < this.width; px++) {
            let x = (px - this.width/2) / 20;
            try {
                let y = f(x);
                let p = this.mapPt(x, y);
                if(px === 0) this.ctx.moveTo(p.px, p.py);
                else this.ctx.lineTo(p.px, p.py);
            } catch(e) { /* discontinuity */ }
        }
        this.ctx.stroke();
    }

    drawVector(ax, ay, bx, by) {
        this.clear();
        
        const drawArrow = (x, y, color) => {
            let pt = this.mapPt(x, y);
            let origin = this.mapPt(0,0);
            
            this.ctx.beginPath();
            this.ctx.moveTo(origin.px, origin.py);
            this.ctx.lineTo(pt.px, pt.py);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Arrow head
            let angle = Math.atan2(origin.py - pt.py, origin.px - pt.px);
            this.ctx.beginPath();
            this.ctx.moveTo(pt.px, pt.py);
            this.ctx.lineTo(pt.px + 10 * Math.cos(angle - Math.PI/6), pt.py + 10 * Math.sin(angle - Math.PI/6));
            this.ctx.lineTo(pt.px + 10 * Math.cos(angle + Math.PI/6), pt.py + 10 * Math.sin(angle + Math.PI/6));
            this.ctx.fillStyle = color;
            this.ctx.fill();
        };

        if(ax !== undefined && ay !== undefined) drawArrow(ax, ay, '#38bdf8');
        if(bx !== undefined && by !== undefined) drawArrow(bx, by, '#f43f5e');
    }

    drawArgand(re, im) {
        this.clear();
        let pt = this.mapPt(re, im, 20);
        let origin = this.mapPt(0,0);
        
        // Draw dashed projection lines
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 5]);
        this.ctx.moveTo(pt.px, origin.py);
        this.ctx.lineTo(pt.px, pt.py);
        this.ctx.lineTo(origin.px, pt.py);
        this.ctx.strokeStyle = '#475569';
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw Vector from Origin
        this.ctx.beginPath();
        this.ctx.moveTo(origin.px, origin.py);
        this.ctx.lineTo(pt.px, pt.py);
        this.ctx.strokeStyle = '#22d3ee'; // Cyan
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw point
        this.ctx.beginPath();
        this.ctx.arc(pt.px, pt.py, 5, 0, Math.PI*2);
        this.ctx.fillStyle = '#f43f5e'; // Rose
        this.ctx.fill();

        // Labels
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.font = '12px Inter';
        this.ctx.fillText(`${re.toFixed(1)} + ${im.toFixed(1)}i`, pt.px + 10, pt.py - 10);
    }

    drawNumberLine(interval) {
        this.clear();
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 4;
        // Simple mock visualization
        this.ctx.beginPath();
        this.ctx.moveTo(this.width/2, this.height/2);
        this.ctx.lineTo(this.width, this.height/2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.width/2, this.height/2, 6, 0, 2*Math.PI);
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawIntegralArea(fxStr, a, b) {
        this.clear();
        const f = (x) => parseFloat(window.Core.evaluateWithLocal(fxStr, { x: x }));
        
        // Draw area
        this.ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        this.ctx.beginPath();
        let startPt = this.mapPt(a, 0);
        this.ctx.moveTo(startPt.px, startPt.py);
        
        for(let x = a; x <= b; x += 0.1) {
            let pt = this.mapPt(x, f(x));
            this.ctx.lineTo(pt.px, pt.py);
        }
        let endPt = this.mapPt(b, 0);
        this.ctx.lineTo(endPt.px, endPt.py);
        this.ctx.fill();

        // Draw curve over it
        this.drawFunctionGraph(fxStr);
    }

    drawNewtonSteps(fxStr, root, steps) {
        this.drawFunctionGraph(fxStr);
        // Draw tangent steps (simplified to just drawing points for now)
        this.ctx.fillStyle = '#fbbf24';
        steps.forEach(s => {
            let p = this.mapPt(s.x, s.fx);
            this.ctx.beginPath();
            this.ctx.arc(p.px, p.py, 3, 0, Math.PI*2);
            this.ctx.fill();
        });
    }
}

window.Viz = new VisualizationEngine();
