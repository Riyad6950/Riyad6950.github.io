
export class CursorSystem {
    constructor() {
        if (this.isTouchDevice()) return;

        this.dot = null;
        this.ring = null;
        
        this.mouse = { x: 0, y: 0 };
        this.dotPos = { x: 0, y: 0 };
        this.ringPos = { x: 0, y: 0 };
        
        this.isHovering = false;
        this.isClicking = false;
        
        this.init();
    }

    isTouchDevice() {
        return globalThis.matchMedia('(pointer: coarse)').matches;
    }


    init() {
        this.createElements();
        this.injectStyles();
        this.addEventListeners();
        this.animate();
    }

    createElements() {
        this.dot = document.createElement('div');
        this.dot.className = 'premium-cursor-dot';
        
        this.ring = document.createElement('div');
        this.ring.className = 'premium-cursor-ring';
        
        document.body.appendChild(this.dot);
        document.body.appendChild(this.ring);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Hide existing cursor if present */
            .custom-cursor { display: none !important; }

            .premium-cursor-dot, .premium-cursor-ring {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 10001;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                will-change: transform, width, height, background-color, border-color;
            }

            .premium-cursor-dot {
                width: 6px;
                height: 6px;
                background-color: var(--text-main);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s;
            }

            .premium-cursor-ring {
                width: 32px;
                height: 32px;
                border: 2px solid var(--border-color);
                transition: width 0.3s, height 0.3s, border-width 0.3s, border-color 0.3s, transform 0.3s;
            }

            /* Hover States - STRICT: Scale and Border Thickness only */
            body:has(.premium-hover) .premium-cursor-dot {
                transform: translate(-50%, -50%) scale(1.5);
                background-color: var(--accent-highlight);
            }

            body:has(.premium-hover) .premium-cursor-ring {
                width: 64px;
                height: 64px;
                border-width: 3px;
                border-color: var(--accent-highlight);
            }

            /* Active State */
            body:active .premium-cursor-dot {
                transform: translate(-50%, -50%) scale(0.5);
            }
            body:active .premium-cursor-ring {
                border-width: 4px;
            }

            /* No Click Ripples with hardcoded colors - use border scale instead */
            .cursor-ripple {
                position: fixed;
                border: 2px solid var(--accent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                transform: translate(-50%, -50%);
                animation: rippleOut 0.6s ease-out forwards;
            }

            @keyframes rippleOut {
                0% { width: 0; height: 0; opacity: 1; border-width: 5px; }
                100% { width: 100px; height: 100px; opacity: 0; border-width: 1px; }
            }
        `;
        document.head.appendChild(style);
    }

    addEventListeners() {
        globalThis.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }, { passive: true });

        globalThis.addEventListener('mousedown', () => {
            this.createRipple();
            this.ring.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });

        globalThis.addEventListener('mouseup', () => {
            this.ring.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Hover Detection
        const selectors = 'a, button, .project-card, .skill-card, .info-card, .education-card, input, textarea, .lang-option, .pm-fav-btn';
        
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest(selectors)) {
                e.target.closest(selectors).classList.add('premium-hover');
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest(selectors)) {
                e.target.closest(selectors).classList.remove('premium-hover');
            }
        });
    }

    createRipple() {
        const ripple = document.createElement('div');
        ripple.className = 'cursor-ripple';
        ripple.style.left = `${this.mouse.x}px`;
        ripple.style.top = `${this.mouse.y}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    animate() {
        // Instant response for dot (1:1 speed)
        this.dotPos.x = this.mouse.x;
        this.dotPos.y = this.mouse.y;

        // Subtle trailing for ring (Fast LERP)
        this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.25;
        this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.25;

        // Use translate3d for better performance
        this.dot.style.transform = `translate3d(${this.dotPos.x}px, ${this.dotPos.y}px, 0) translate(-50%, -50%)`;
        this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(() => this.animate());
    }
}
