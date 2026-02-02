
export class LanguageSystem {
    constructor() {
        this.currentLang = localStorage.getItem('site_lang') || 'en';
        this.translations = {};
        this.supportedLangs = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'pt', name: 'Português', flag: '🇵🇹' },
            { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
            { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' },
            { code: 'zh', name: '中文', flag: '🇨🇳' },
            { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹' },
            { code: 'ne', name: 'नेपाली', flag: '🇳🇵' }
        ];

        // Mapping selectors to translation keys
        this.domMap = {
            'nav.about': '.main-nav a[href="#about"]',
            'nav.skills': '.main-nav a[href="#skills"]',
            'nav.projects': '.main-nav a[href="#projects"]',
            'nav.education': '.main-nav a[href="#education"]',
            'nav.contact': '.main-nav a[href="#contact"]',

            'hero.badge': '.badge',
            'hero.title': 'h1',
            'hero.subtitle': '.hero-subtitle',
            'hero.btn_explore': '.btn-primary',
            'hero.btn_contact': '.btn-secondary',

            'about.label': '#about .label',
            'about.title': '#about h2',
            'about.desc': '#about .header-right p',
            'about.card_focus': '.about-cards .info-card:not(.accent) h3',
            'about.card_focus_desc': '.about-cards .info-card:not(.accent) p',
            'about.card_goal': '.about-cards .info-card.accent h3',
            'about.card_goal_desc': '.about-cards .info-card.accent p',

            'skills.label': '#skills .label',
            'skills.title': '#skills h2',

            'projects.label': '#projects .label',
            'projects.title': '#projects h2',
            // 'projects.view_github': '.project-link-text', // Will handle multiple elements separately

            'education.label': '#education .label',
            'education.title': '#education h2',
            'education.ssc': '.education-card:nth-child(1) h3',
            'education.diploma': '.education-card:nth-child(2) h3',
            'education.ongoing': '.education-card:nth-child(2) .edu-year',

            'contact.label': '#contact .label',
            'contact.title': '#contact h2',
            'contact.btn_send': '#contact .btn-primary'
        };

        this.init();
    }

    init() {
        this.injectStyles();
        this.injectControls();
        this.loadLanguage(this.currentLang);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .nav-lang-item {
                display: flex;
                align-items: center;
                margin-left: 20px;
                border-left: 1px solid var(--border-color);
                padding-left: 20px;
            }
            .lang-switcher-nav {
                display: flex;
                gap: 8px;
                background: var(--bg-soft, #FAFAFA);
                padding: 4px;
                border-radius: var(--radius-pill);
                border: 2px solid var(--border-color);
            }
            .lang-btn {
                background: transparent;
                border: none;
                color: var(--text-main);
                font-weight: 700;
                padding: 6px 14px;
                border-radius: var(--radius-pill);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                font-size: 0.75rem;
                letter-spacing: 1px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 40px;
            }
            .lang-btn:hover {
                transform: scale(1.1);
                background: var(--bg-main);
            }
            .lang-btn.active {
                background: var(--bg-dark, #000000);
                color: var(--text-light, #FFFFFF);
            }
            .lang-btn i { color: currentColor; }
            
            /* Modal - High Contrast Overlay */
            .lang-modal-overlay {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.6); /* Force semi-transparent black overlay */
                opacity: 0;
                z-index: 10000;
                display: none;
                justify-content: center;
                align-items: center;
                transition: opacity 0.4s;
                backdrop-filter: blur(4px);
            }
            .lang-modal-overlay.open {
                display: flex;
                opacity: 1; 
            }
            .lang-modal {
                background: var(--bg-main); /* Ensure solid background */
                padding: 40px;
                border: 4px solid var(--border-color);
                border-radius: var(--radius-md);
                width: 90%;
                max-width: 550px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-hover);
                opacity: 1; /* Fully opaque */
            }
            .lang-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 20px;
                margin-top: 24px;
            }
            .lang-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                padding: 20px;
                border: 2px solid var(--border-color);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: transform 0.3s, border-width 0.2s, background-color 0.2s;
                background: var(--bg-main);
            }
            .lang-option:hover {
                transform: translateY(-8px) scale(1.05);
                border-width: 4px;
                background-color: var(--bg-soft);
            }
            .lang-icon-box {
                width: 44px;
                height: 44px;
                background: var(--bg-dark);
                color: var(--text-light);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 0.9rem;
            }
            .lang-name { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
            .lang-search {
                width: 100%;
                padding: 16px 24px;
                border-radius: var(--radius-pill);
                border: 3px solid var(--border-color);
                background: var(--bg-soft);
                color: var(--text-main);
                font-family: inherit;
                font-weight: 600;
                outline: none;
            }
            .lang-search:focus {
                border-color: var(--accent-highlight);
            }

            @media (max-width: 1024px) {
                .nav-lang-item {
                    margin-left: 10px;
                    padding-left: 10px;
                }
                .lang-btn {
                    padding: 6px 10px;
                    min-width: 35px;
                }
            }

            @media (max-width: 900px) {
                .nav-lang-item {
                    border-left: none;
                    margin-left: 5px;
                    padding-left: 5px;
                }
            }

            @media (max-width: 768px) {
                .nav-lang-item {
                    margin-left: 0; padding-left: 0;
                    border-left: none; border-top: 1px solid var(--border-color);
                    margin-top: 20px; padding-top: 20px;
                    width: 100%;
                    justify-content: center;
                }
                .lang-btn {
                    padding: 6px 8px;
                    min-width: 35px;
                    font-size: 0.7rem;
                }
                .lang-switcher-nav {
                    gap: 4px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectControls() {
        const navUl = document.querySelector('.main-nav ul');
        if (!navUl) return;

        const li = document.createElement('li');
        li.className = 'nav-lang-item';
        li.innerHTML = `
            <div class="lang-switcher-nav" role="group" aria-label="Language Selector">
                <button class="lang-btn" data-lang="en" aria-label="Switch to English">EN</button>
                <button class="lang-btn" data-lang="bn" aria-label="Switch to Bengali">BN</button>
                <button class="lang-btn" id="lang-more-btn" aria-label="More languages"><i class="fas fa-globe"></i></button>
            </div>
        `;
        navUl.appendChild(li);

        // Modal
        const modal = document.createElement('div');
        modal.className = 'lang-modal-overlay';
        modal.innerHTML = `
            <div class="lang-modal">
                <input type="text" class="lang-search" placeholder="Search language..." aria-label="Search language">
                <div class="lang-grid">
                    ${this.supportedLangs.map(l => `
                        <div class="lang-option" data-lang="${l.code}" role="button" tabindex="0">
                            <div class="lang-icon-box">${l.code.toUpperCase()}</div>
                            <span class="lang-name">${l.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Events
        li.querySelector('[data-lang="en"]').onclick = () => this.switchLanguage('en');
        li.querySelector('[data-lang="bn"]').onclick = () => this.switchLanguage('bn');

        const moreBtn = li.querySelector('#lang-more-btn');
        const modalEl = document.querySelector('.lang-modal-overlay');
        const searchInput = modal.querySelector('.lang-search');

        moreBtn.onclick = () => {
            modalEl.classList.add('open');
            searchInput.focus();
        };

        modalEl.onclick = (e) => {
            if (e.target === modalEl) modalEl.classList.remove('open');
        };

        // Modal Selection
        modal.querySelectorAll('.lang-option').forEach(opt => {
            const selectLang = () => {
                this.switchLanguage(opt.dataset.lang);
                modalEl.classList.remove('open');
            };
            opt.onclick = selectLang;
            opt.onkeypress = (e) => { if (e.key === 'Enter') selectLang(); };
        });

        // Search
        searchInput.oninput = (e) => {
            const val = e.target.value.toLowerCase();
            modal.querySelectorAll('.lang-option').forEach(opt => {
                const name = opt.textContent.toLowerCase();
                opt.style.display = name.includes(val) ? 'flex' : 'none';
            });
        };

        this.updateButtonsUI();
    }

    async switchLanguage(code) {
        this.currentLang = code;
        localStorage.setItem('site_lang', code);
        await this.loadLanguage(code);
        this.updateButtonsUI();
    }

    updateButtonsUI() {
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.lang-btn[data-lang="${this.currentLang}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        else {
            const moreBtn = document.querySelector('#lang-more-btn');
            if (moreBtn) moreBtn.classList.add('active');
        }
    }

    async loadLanguage(code) {
        // Fallback for RTL handling
        const langMeta = this.supportedLangs.find(l => l.code === code);
        if (langMeta && langMeta.dir === 'rtl') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.lang = 'ar';
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.lang = code;
        }

        try {
            const res = await fetch(`languages/${code}.json`);
            if (!res.ok) throw new Error('Lang file not found');
            const data = await res.json();
            this.replaceText(data);
        } catch (e) {
            console.warn(`Language ${code} not found, falling back to EN or partial.`);
            // If file doesn't exist, we just don't replace, effectively falling back to HTML static content
            // or we could load en.json first then override.
            // For now, if "es" is checked but no es.json, it stays as is (likely EN).
        }
    }

    replaceText(data) {
        // Simple Recursive Flattening or Direct Map Access
        // Doing direct map access from config

        for (const [key, selector] of Object.entries(this.domMap)) {
            const [section, id] = key.split('.');
            if (data[section] && data[section][id]) {
                const el = document.querySelector(selector);
                if (el) {
                    // Check if it has child nodes or text
                    // If element has children like icons (e.g. Buttons), we only want to replace text node
                    // But for simplicity in this constraints, we might just innerHTML if it contains <br> or just textContent

                    if (key === 'hero.title') {
                        el.innerHTML = data[section][id]; // Has <br>
                    } else if (selector.includes('btn') || selector.includes('project-link-text')) {
                        // Preserve icon
                        // Preserve icon logic if needed, but for now just appending text
                        if (el.childNodes[0]) el.childNodes[0].nodeValue = data[section][id] + ' ';
                    } else {
                        el.textContent = data[section][id];
                    }
                }
            }
        }

        // Handle repeating elements (Project Links)
        if (data.projects && data.projects.view_github) {
            document.querySelectorAll('.project-link-text').forEach(el => {
                // Assuming text is first child

                if (el.firstChild.nodeType === 3) { // Text node
                    el.firstChild.nodeValue = data.projects.view_github + ' ';
                }
            });
        }
    }
}
