window.FeedbackSystem = {
    hapticSimulate(type) {
        // Web APIs don't easily do true haptics without Vibration API, 
        // which requires HTTPS and mobile device.
        // We simulate with a fast DOM pulse.
        const appShell = document.getElementById('app-shell');
        if (!appShell) return;
        
        const dur = type === 'light' ? 50 : 100;
        const scale = type === 'light' ? 0.998 : 0.99;
        
        anime({ 
            targets: appShell, 
            scale: [1, scale, 1], 
            duration: dur,
            easing: 'linear'
        });
        
        // If device supports vibration
        if (navigator.vibrate) {
            navigator.vibrate(type === 'light' ? 5 : 15);
        }
    },
    
    success(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            borderColor: ['#1e293b', '#22d3ee', '#1e293b'], 
            duration: 800,
            easing: 'easeOutCubic'
        });
    },
    
    error(el) {
        if (!el) return;
        anime({ 
            targets: el, 
            translateX: [0, -5, 5, -5, 5, 0], 
            borderColor: ['#1e293b', '#f43f5e', '#1e293b'], 
            duration: 400,
            easing: 'easeInOutSine'
        });
    }
};
