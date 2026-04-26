window.AnimationSystem = {
    buttonPress(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            scale: [1, 0.92, 0.96], 
            backgroundColor: 'rgba(255,255,255,0.1)',
            duration: 150, 
            easing: 'easeOutQuad' 
        });
    },
    buttonRelease(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            scale: 1, 
            backgroundColor: 'rgba(255,255,255,0)',
            duration: 400, 
            easing: 'easeOutElastic(1, .5)' 
        });
    },
    moduleExit(el) {
        if(!el) return;
        anime({ 
            targets: el, 
            opacity: 0, 
            scale: 0.98,
            translateY: -10, 
            filter: 'blur(10px)', 
            duration: 300, 
            easing: 'easeInCubic' 
        });
    },
    moduleEnter(el) {
        if(!el) return;
        el.style.opacity = 0; 
        el.style.display = 'block';
        
        anime({ 
            targets: el, 
            opacity: [0, 1], 
            translateY: [30, 0], 
            scale: [0.95, 1],
            filter: ['blur(10px)', 'blur(0px)'], 
            duration: 600, 
            easing: 'easeOutExpo' 
        });

        // Stagger reveal buttons if they exist
        const buttons = el.querySelectorAll('.btn, .btn-primary, .btn-secondary, .grid-cell');
        if(buttons.length > 0) {
            anime({
                targets: buttons,
                opacity: [0, 1],
                scale: [0.5, 1],
                translateY: [20, 0],
                delay: anime.stagger(15, {start: 100}),
                duration: 500,
                easing: 'easeOutBack'
            });
        }
    },
    resultReveal(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            opacity: [0, 1], 
            translateX: [-20, 0],
            duration: 400, 
            easing: 'easeOutQuart' 
        });
    }
};
