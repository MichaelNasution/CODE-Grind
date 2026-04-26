window.MicroInteractionSystem = {
    attachRipple(btn) {
        btn.addEventListener('mousedown', function(e) {
            // Remove old ripples
            const oldRipples = btn.querySelectorAll('.ripple');
            oldRipples.forEach(r => r.remove());

            // Create new ripple
            const circle = document.createElement('span');
            const diameter = Math.max(btn.clientWidth, btn.clientHeight);
            const radius = diameter / 2;

            const rect = btn.getBoundingClientRect();
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple');
            
            // Temporary styling for the ripple if CSS class is not yet added
            circle.style.position = 'absolute';
            circle.style.borderRadius = '50%';
            circle.style.transform = 'scale(0)';
            circle.style.background = 'rgba(255, 255, 255, 0.2)';
            circle.style.pointerEvents = 'none';

            btn.appendChild(circle);

            anime({
                targets: circle,
                scale: 3,
                opacity: 0,
                duration: 600,
                easing: 'easeOutCubic',
                complete: () => circle.remove()
            });
        });
        
        // Ensure parent button is relative and hides overflow
        if(window.getComputedStyle(btn).position === 'static') {
            btn.style.position = 'relative';
        }
        btn.style.overflow = 'hidden';
    },

    inputFocus(el) {
        el.addEventListener('focus', () => {
            anime({ 
                targets: el, 
                scale: 1.02, 
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.4)', 
                borderColor: '#22d3ee',
                duration: 200 
            });
        });
        el.addEventListener('blur', () => {
            anime({ 
                targets: el, 
                scale: 1, 
                boxShadow: '0 0 0px rgba(0,0,0,0)', 
                borderColor: '#334155',
                duration: 200 
            });
        });
    }
};
