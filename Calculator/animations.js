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
        // The CSS transition handles the base exit (opacity/scale)
        // We can add extra flair here if needed, but keeping it simple for stability
    },
    moduleEnter(el) {
        if(!el) return;
        
        // Stagger reveal buttons if they exist
        const buttons = el.querySelectorAll('.btn, .btn-primary, .btn-secondary, .grid-cell');
        if(buttons.length > 0) {
            anime({
                targets: buttons,
                opacity: [0, 1],
                scale: [0.8, 1],
                translateY: [10, 0],
                delay: anime.stagger(15, {start: 100}),
                duration: 400,
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
