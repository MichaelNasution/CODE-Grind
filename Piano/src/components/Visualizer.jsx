import React, { useEffect, useRef } from 'react';

const FALL_SPEED = 0.15; // px per ms

export default function Visualizer({ visualEvent }) {
    const canvasRef = useRef(null);
    const activeBlocksRef = useRef(new Map()); // note -> { startTime, isBlack }
    const flyingBlocksRef = useRef([]);        // { x, width, yBottom, length, isBlack }
    const requestRef = useRef();
    const lastTimeRef = useRef();

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
                
                // We calculate x and width right when it stops to ensure accuracy if resized
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

        // Resize canvas if needed
        const wrapper = canvas.closest('#piano-wrapper');
        const piano = document.getElementById('piano');
        if (wrapper && piano) {
            if (canvas.width !== piano.scrollWidth) canvas.width = piano.scrollWidth;
            if (canvas.height !== wrapper.clientHeight - piano.clientHeight) {
                canvas.height = wrapper.clientHeight - piano.clientHeight;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const colorWhite = 'rgba(232, 200, 74, 0.8)';
        const colorBlack = 'rgba(184, 150, 46, 0.9)';

        // Draw flying blocks
        const flying = flyingBlocksRef.current;
        for (let i = flying.length - 1; i >= 0; i--) {
            const block = flying[i];
            block.yBottom -= FALL_SPEED * deltaTime;
            
            ctx.fillStyle = block.isBlack ? colorBlack : colorWhite;
            ctx.beginPath();
            ctx.roundRect(block.x, block.yBottom - block.length, block.width, block.length, 3);
            ctx.fill();

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
                
                ctx.fillStyle = block.isBlack ? colorBlack : colorWhite;
                ctx.beginPath();
                ctx.roundRect(x, canvas.height - length, rect.width, length, 3);
                ctx.fill();
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
