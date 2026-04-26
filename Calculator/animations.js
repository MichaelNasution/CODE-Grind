window.AnimationSystem = {
    buttonPress(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            scale: [1, 0.92], 
            duration: 100, 
            easing: 'easeOutCubic' 
        });
    },
    buttonRelease(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            scale: 1, 
            duration: 400, 
            easing: 'easeOutElastic(1, .6)' 
        });
    },
    moduleExit(el) {
        if(!el) return;
        anime({ 
            targets: el, 
            opacity: 0, 
            translateY: -10, 
            filter: 'blur(4px)', 
            duration: 200, 
            easing: 'easeOutCubic' 
        });
    },
    moduleEnter(el) {
        if(!el) return;
        el.style.opacity = 0; 
        el.style.filter = 'blur(4px)'; 
        el.style.display = 'block';
        anime({ 
            targets: el, 
            opacity: 1, 
            translateY: [20, 0], 
            filter: ['blur(4px)', 'blur(0px)'], 
            duration: 300, 
            easing: 'easeOutCubic' 
        });
    },
    resultReveal(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            opacity: [0, 1], 
            scale: [0.95, 1], 
            duration: 300, 
            easing: 'easeOutCubic' 
        });
    }
};
