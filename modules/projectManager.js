
export class ProjectManager {
    constructor() {
        this.container = document.querySelector('.projects-grid');
        this.originalCards = Array.from(document.querySelectorAll('.project-card'));
        this.projects = [];
        this.filterState = {
            search: '',
            filter: 'all',
            sort: 'newest'
        };

        // Metadata mapping based on index or title
        this.metadata = [
            { id: 1, date: '2025-01-15', tags: ['tool', 'featured'], popularity: 85 }, // Password Generator
            { id: 2, date: '2024-12-20', tags: ['tool', 'beginner'], popularity: 90 }, // Calculator
            { id: 3, date: '2025-02-01', tags: ['web', 'design', 'featured'], popularity: 100 } // Portfolio
        ];

        this.init();
    }

    init() {
        if (!this.container) return;

        this.injectStyles();
        this.enrichProjects();
        this.injectControls();
        this.loadFavorites();
        this.attachEvents();
        this.applyLogic();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pm-controls {
                margin-bottom: 30px;
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                justify-content: space-between;
                align-items: center;
                background: var(--bg-soft);
                padding: 24px;
                border: 3px solid var(--border-color);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-soft);
            }
            .pm-search-group {
                flex: 1;
                min-width: 250px;
                position: relative;
            }
            .pm-input {
                width: 100%;
                padding: 12px 15px;
                padding-left: 45px;
                border: 2px solid var(--border-color);
                border-radius: var(--radius-pill);
                background: var(--bg-main);
                color: var(--text-main);
                font-family: inherit;
                font-weight: 600;
                transition: border-width 0.2s;
            }
            .pm-input:focus {
                outline: none;
                border-width: 4px;
                border-color: var(--accent-highlight);
            }
            .pm-icon {
                position: absolute;
                left: 18px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-main);
            }
            .pm-filters {
                display: flex;
                gap: 10px;
            }
            .pm-btn {
                padding: 10px 20px;
                border: 2px solid var(--border-color);
                background: var(--bg-main);
                border-radius: var(--radius-pill);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                color: var(--text-main);
                font-weight: 700;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .pm-btn.active {
                background: var(--bg-dark);
                color: var(--text-light);
                border-color: var(--border-dark);
            }
            .pm-btn:hover:not(.active) {
                transform: translateY(-2px);
                border-width: 3px;
                background: var(--bg-soft);
            }
            .pm-select {
                padding: 10px 15px;
                border-radius: var(--radius-pill);
                border: 2px solid var(--border-color);
                background: var(--bg-main);
                color: var(--text-main);
                font-weight: 600;
                cursor: pointer;
                outline: none;
            }
            
            
            /* Heart Icon - High Contrast */
            .pm-fav-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--bg-card);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 2px solid var(--border-color);
                box-shadow: var(--shadow-soft);
                transition: transform 0.2s, background-color 0.2s, border-width 0.2s;
                z-index: 10;
                color: var(--text-main);
            }
            .pm-fav-btn:hover {
                transform: scale(1.15);
                border-width: 3px;
                background-color: var(--bg-soft);
            }
            .pm-fav-btn.active {
                background: var(--bg-dark);
                color: var(--accent-highlight);
                border-color: var(--bg-dark);
            }
            @keyframes heartPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.4); }
                100% { transform: scale(1); }
            }
            .pm-fav-btn.animating {
                animation: heartPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            @media (max-width: 768px) {
                .pm-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
            }
        `;
        document.head.appendChild(style);
    }

    enrichProjects() {
        this.projects = this.originalCards.map((card, index) => {
            const title = card.querySelector('h3').innerText;
            const meta = this.metadata[index] || { date: '2020-01-01', tags: [], popularity: 0 };

            // Inject Heart Button
            const heartBtn = document.createElement('button');
            heartBtn.className = 'pm-fav-btn';
            heartBtn.setAttribute('aria-label', 'Favorite Project');
            heartBtn.innerHTML = '<i class="far fa-heart" role="img" aria-hidden="true"></i>';

            // Use event delegation or at least stop propagation
            heartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // CRITICAL: Prevent card navigation/re-render
                this.toggleFavorite(index, heartBtn);
            });

            card.style.position = 'relative';
            card.appendChild(heartBtn);

            return {
                element: card,
                title: title.toLowerCase(),
                date: new Date(meta.date),
                tags: meta.tags,
                popularity: meta.popularity,
                id: index,
                heartBtn: heartBtn
            };
        });
    }

    injectControls() {
        const controls = document.createElement('div');
        controls.className = 'pm-controls';

        controls.innerHTML = `
            <div class="pm-search-group">
                <i class="fas fa-search pm-icon" aria-hidden="true"></i>
                <input type="text" class="pm-input" placeholder="Search projects..." aria-label="Search projects">
            </div>
            <div class="pm-filters" role="group" aria-label="Filter Projects">
                <button class="pm-btn active" data-filter="all">All</button>
                <button class="pm-btn" data-filter="featured">Featured</button>
                <button class="pm-btn" data-filter="tool">Tools</button>
                <button class="pm-btn" data-filter="web">Web</button>
            </div>
            <select class="pm-select" aria-label="Sort projects">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">Name (A-Z)</option>
            </select>
        `;

        // Inject before grid
        this.container.parentNode.insertBefore(controls, this.container);

        // Bind elements
        this.searchInput = controls.querySelector('input');
        this.filterBtns = controls.querySelectorAll('.pm-btn');
        this.sortSelect = controls.querySelector('select');
    }

    attachEvents() {
        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.filterState.search = e.target.value.toLowerCase();
            this.applyLogic();
        });

        // Filter Buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterState.filter = btn.dataset.filter;
                this.applyLogic();
            });
        });

        // Sort
        this.sortSelect.addEventListener('change', (e) => {
            this.filterState.sort = e.target.value;
            this.applyLogic();
        });
    }

    toggleFavorite(index, btn) {
        let favorites = JSON.parse(localStorage.getItem('my_portfolio_favs') || '[]');
        const projectId = this.projects[index].title;

        const isActive = favorites.includes(projectId);
        if (isActive) {
            favorites = favorites.filter(id => id !== projectId);
            btn.classList.remove('active');
        } else {
            favorites.push(projectId);
            btn.classList.add('active', 'animating');
            setTimeout(() => btn.classList.remove('animating'), 300);
        }

        localStorage.setItem('my_portfolio_favs', JSON.stringify(favorites));
        this.updateHeartIcon(btn, !isActive);
    }

    loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('my_portfolio_favs') || '[]');
        this.projects.forEach(p => {
            if (favorites.includes(p.title)) {
                p.heartBtn.classList.add('active');
                this.updateHeartIcon(p.heartBtn, true);
            }
        });
    }

    updateHeartIcon(btn, isActive) {
        const icon = btn.querySelector('i');
        if (isActive) {
            icon.className = 'fas fa-heart';
        } else {
            icon.className = 'far fa-heart';
        }
    }

    applyLogic() {
        // Filter
        const visibleProjects = this.projects.filter(p => {
            const matchSearch = p.title.includes(this.filterState.search);
            const matchFilter = this.filterState.filter === 'all' || p.tags.includes(this.filterState.filter);
            return matchSearch && matchFilter;
        });

        // Sort
        visibleProjects.sort((a, b) => {
            if (this.filterState.sort === 'newest') return b.date - a.date;
            if (this.filterState.sort === 'oldest') return a.date - b.date;
            if (this.filterState.sort === 'az') return a.title.localeCompare(b.title);
            return 0;
        });

        // Optimized Rendering: Only adjust visibility and order without clearing
        this.projects.forEach(p => {
            const isVisible = visibleProjects.includes(p);
            // Use opacity/visibility or simple display toggle that doesn't trigger reflow if possible
            // But display flex/none is standard. To avoid "jump", we just manage DOM order carefully.
            if (isVisible) {
                p.element.classList.remove('pm-hidden');
                // Ensure correct order - appendChild moves existing nodes safely
                this.container.appendChild(p.element);
            } else {
                p.element.classList.add('pm-hidden');
                // Don't detach, just hide
            }
        });

        // Add CSS for pm-hidden if not already there
        if (!document.getElementById('pm-stability-styles')) {
            const s = document.createElement('style');
            s.id = 'pm-stability-styles';
            s.textContent = '.pm-hidden { display: none !important; }';
            document.head.appendChild(s);
        }
    }
}
