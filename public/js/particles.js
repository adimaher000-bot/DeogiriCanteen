class Particles {
    constructor(options = {}) {
        this.options = Object.assign({
            selector: '.particles-canvas',
            quantity: 100,
            staticity: 50,
            ease: 50,
            size: 0.4,
            color: '#ffffff',
            vx: 0,
            vy: 0
        }, options);

        this.canvas = document.querySelector(this.options.selector);
        if (!this.canvas) {
            console.error('Particles: Canvas not found');
            return;
        }
        this.context = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.circles = [];
        this.mouse = { x: 0, y: 0 };
        this.canvasSize = { w: 0, h: 0 };
        this.mousePosition = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.hexToRgb();
        this.resizeCanvas();
        this.drawParticles();
        this.animate();

        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    hexToRgb() {
        let hex = this.options.color.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const hexInt = parseInt(hex, 16);
        this.rgb = [
            (hexInt >> 16) & 255,
            (hexInt >> 8) & 255,
            hexInt & 255
        ];
    }

    onMouseMove(event) {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const { w, h } = this.canvasSize;
            const x = event.clientX - rect.left - w / 2;
            const y = event.clientY - rect.top - h / 2;
            const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
            if (inside) {
                this.mouse.x = x;
                this.mouse.y = y;
            }
        }
    }

    resizeCanvas() {
        this.circles.length = 0;
        this.canvasSize.w = this.canvas.parentElement.offsetWidth;
        this.canvasSize.h = this.canvas.parentElement.offsetHeight;
        this.canvas.width = this.canvasSize.w * this.dpr;
        this.canvas.height = this.canvasSize.h * this.dpr;
        this.canvas.style.width = `${this.canvasSize.w}px`;
        this.canvas.style.height = `${this.canvasSize.h}px`;
        this.context.scale(this.dpr, this.dpr);
    }

    circleParams() {
        const x = Math.floor(Math.random() * this.canvasSize.w);
        const y = Math.floor(Math.random() * this.canvasSize.h);
        const translateX = 0;
        const translateY = 0;
        const pSize = Math.floor(Math.random() * 2) + this.options.size;
        const alpha = 0;
        const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.1;
        const dy = (Math.random() - 0.5) * 0.1;
        const magnetism = 0.1 + Math.random() * 4;
        return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism };
    }

    drawCircle(circle, update = false) {
        const { x, y, translateX, translateY, size, alpha } = circle;
        this.context.translate(translateX, translateY);
        this.context.beginPath();
        this.context.arc(x, y, size, 0, 2 * Math.PI);
        this.context.fillStyle = `rgba(${this.rgb.join(', ')}, ${alpha})`;
        this.context.fill();
        this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        if (!update) {
            this.circles.push(circle);
        }
    }

    clearContext() {
        this.context.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
    }

    drawParticles() {
        this.clearContext();
        for (let i = 0; i < this.options.quantity; i++) {
            const circle = this.circleParams();
            this.drawCircle(circle);
        }
    }

    remapValue(value, start1, end1, start2, end2) {
        const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
        return remapped > 0 ? remapped : 0;
    }

    animate() {
        this.clearContext();
        this.circles.forEach((circle, i) => {
            const edge = [
                circle.x + circle.translateX - circle.size,
                this.canvasSize.w - circle.x - circle.translateX - circle.size,
                circle.y + circle.translateY - circle.size,
                this.canvasSize.h - circle.y - circle.translateY - circle.size
            ];
            const closestEdge = edge.reduce((a, b) => Math.min(a, b));
            const remapClosestEdge = parseFloat(this.remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));

            if (remapClosestEdge > 1) {
                circle.alpha += 0.02;
                if (circle.alpha > circle.targetAlpha) {
                    circle.alpha = circle.targetAlpha;
                }
            } else {
                circle.alpha = circle.targetAlpha * remapClosestEdge;
            }

            circle.x += circle.dx + this.options.vx;
            circle.y += circle.dy + this.options.vy;

            circle.translateX += ((this.mouse.x / (this.options.staticity / circle.magnetism)) - circle.translateX) / this.options.ease;
            circle.translateY += ((this.mouse.y / (this.options.staticity / circle.magnetism)) - circle.translateY) / this.options.ease;

            this.drawCircle(circle, true);

            if (
                circle.x < -circle.size ||
                circle.x > this.canvasSize.w + circle.size ||
                circle.y < -circle.size ||
                circle.y > this.canvasSize.h + circle.size
            ) {
                this.circles.splice(i, 1);
                const newCircle = this.circleParams();
                this.drawCircle(newCircle);
            }
        });
        requestAnimationFrame(() => this.animate());
    }
}
