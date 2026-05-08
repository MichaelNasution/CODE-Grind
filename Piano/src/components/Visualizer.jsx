import React, { useEffect, useRef } from 'react';

const FALL_SPEED = 0.15; // px per ms

export default function Visualizer({ visualEvent }) {
    const canvasRef = useRef(null);
    const activeBlocksRef = useRef(new Map()); 
    const flyingBlocksRef = useRef([]);        
    const requestRef = useRef();
    const lastTimeRef = useRef();
    const cachedGridRef = useRef([]);

    useEffect(() => {
        if (!visualEvent) return;
        
        const { type, note, time } = visualEvent;
        
        if (type === 'start') {
            const el = document.querySelector(`[data-note="${note}"]`);
            if (el) {
                const isBlack = el.classList.contains('key-black');
                activeBlocksRef.current.set(note, { startTime: time, isBlack });
            }
        } else if (type === 'stop') {
            if (activeBlocksRef.current.has(note)) {
                const block = activeBlocksRef.current.get(note);
                const durationMs = time - block.startTime;
                
                const el = document.querySelector(`[data-note="${note}"]`);
                let x = 0, width = 0;
                if (el && canvasRef.current) {
                    const rect = el.getBoundingClientRect();
                    const wrapper = el.closest('#piano-wrapper');
                    const wrapperRect = wrapper.getBoundingClientRect();
                    x = rect.left - wrapperRect.left + wrapper.scrollLeft;
                    width = rect.width;
                }

                flyingBlocksRef.current.push({
                    x, width,
                    yBottom: canvasRef.current ? canvasRef.current.height : 0,
                    length: durationMs * FALL_SPEED,
                    isBlack: block.isBlack
                });
                activeBlocksRef.current.delete(note);
            }
        }
    }, [visualEvent]);

    const draw = (timestamp) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');

        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        const wrapper = canvas.closest('#piano-wrapper');
        const piano = document.getElementById('piano');
        if (wrapper && piano) {
            const targetWidth = piano.scrollWidth;
            const targetHeight = wrapper.clientHeight - piano.clientHeight;

            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                
                // Recalculate grid
                const xs = [];
                const keyWrappers = document.querySelectorAll('.key-wrapper');
                const wrapperRect = wrapper.getBoundingClientRect();
                keyWrappers.forEach(kw => {
                    const rect = kw.getBoundingClientRect();
                    xs.push(rect.left - wrapperRect.left + wrapper.scrollLeft);
                });
                if (keyWrappers.length > 0) {
                    const lastRect = keyWrappers[keyWrappers.length - 1].getBoundingClientRect();
                    xs.push(lastRect.right - wrapperRect.left + wrapper.scrollLeft);
                }
                cachedGridRef.current = xs;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        if (cachedGridRef.current.length > 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            cachedGridRef.current.forEach(x => {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            });
            ctx.stroke();
        }

        const drawBlock = (x, yBottom, width, length, isBlack) => {
            const y = yBottom - length;
            // Prevent negative length or coords from breaking gradient
            if (length <= 0) return;

            const gradient = ctx.createLinearGradient(0, y, 0, yBottom);
            if (isBlack) {
                gradient.addColorStop(0, '#d69631'); // warm amber
                gradient.addColorStop(1, '#ffc76b'); // bright gold
                ctx.shadowColor = 'rgba(214, 150, 49, 0.5)';
            } else {
                gradient.addColorStop(0, '#f0d37d');
                gradient.addColorStop(1, '#fff6d4');
                ctx.shadowColor = 'rgba(240, 211, 125, 0.5)';
            }
            
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 12;
            
            ctx.beginPath();
            ctx.roundRect(x, y, width, length, 4);
            ctx.fill();
            
            ctx.shadowBlur = 0; // reset for next drawing
        };

        // Draw flying blocks
        const flying = flyingBlocksRef.current;
        for (let i = flying.length - 1; i >= 0; i--) {
            const block = flying[i];
            block.yBottom -= FALL_SPEED * deltaTime;
            
            drawBlock(block.x, block.yBottom, block.width, block.length, block.isBlack);

            if (block.yBottom < 0) {
                flying.splice(i, 1);
            }
        }

        // Draw active blocks
        for (const [note, block] of activeBlocksRef.current.entries()) {
            const length = (timestamp - block.startTime) * FALL_SPEED;
            
            const el = document.querySelector(`[data-note="${note}"]`);
            if (el) {
                const rect = el.getBoundingClientRect();
                const wrapperRect = wrapper.getBoundingClientRect();
                const x = rect.left - wrapperRect.left + wrapper.scrollLeft;
                
                drawBlock(x, canvas.height, rect.width, length, block.isBlack);
            }
        }

        requestRef.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return <canvas id="visualizer" ref={canvasRef} />;
}
