
document.addEventListener('DOMContentLoaded', () => {
    // Check if device has a fine pointer (mouse)
    if (window.matchMedia("(pointer: fine)").matches) {

        // Create elements
        const cursorDot = document.createElement('div');
        cursorDot.classList.add('cursor-dot');

        const cursorOutline = document.createElement('div');
        cursorOutline.classList.add('cursor-outline');

        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorOutline);

        // Styling via JS to ensure it works even if CSS is cached/laggy
        // specific styles will be in CSS, but base mechanics here
        const setBaseStyles = (el) => {
            el.style.position = 'fixed';
            el.style.top = '0';
            el.style.left = '0';
            el.style.pointerEvents = 'none'; // CRITICAL: Allows clicks to pass through
            el.style.borderRadius = '50%';
            el.style.zIndex = '9999';
            el.style.transform = 'translate(-50%, -50%)';
        };

        setBaseStyles(cursorDot);
        setBaseStyles(cursorOutline);

        // Movement
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with slight delay/animation (using simple animate here or CSS transition)
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Hover Effects
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .btn, .card');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
            });
        });
    }
});
