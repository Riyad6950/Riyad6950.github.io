
export class InteractionSystem {
    constructor() {
        this.prefersReducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        this.injectStyles();
        if (!this.prefersReducedMotion) {
            this.initScrollReveal();
        }
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Button Press Depth */
            .btn-primary:active, .btn-secondary:active, .pm-btn:active {
                transform: translateY(2px) scale(0.98);
            }

            /* High-Contrast Focus: Border Thickening over Glow */
            input:focus, textarea:focus {
                outline: none;
                border-width: 3px !important;
                border-color: var(--accent-highlight, #FF0000) !important;
                background-color: var(--bg-soft, #FAFAFA);
            }

            /* Keyboard Focus: Clear Outline */
            :focus-visible {
                outline: 3px solid var(--accent-highlight, #FF0000);
                outline-offset: 4px;
            }

            /* Section Reveal: Opacity & Transform Only */
            .section {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 1s ease, transform 1s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .section.revealed {
                opacity: 1;
                transform: translateY(0);
            }

            /* Improved Stability Hover Effects (Scale & Shadow Tokens) */
            .project-card, .info-card, .skill-card, .education-card, .gh-repo-card, .gh-profile-card {
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-width 0.2s ease;
                will-change: transform, box-shadow;
                border-width: 2px;
            }

            .project-card:hover, .info-card:hover, .skill-card:hover, .education-card:hover, .gh-repo-card:hover, .gh-profile-card:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: var(--shadow-hover);
                border-width: 3px;
                border-color: var(--accent, #000);
            }
        `;
        document.head.appendChild(style);
    }

    initScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }
}
