
import { ProjectManager } from './projectManager.js';
import { LanguageSystem } from './languageSystem.js';
import { AIChat } from '../components/aiChat.js';

// Advanced UI Imports
import { CursorSystem } from '../components/cursor.js';
import { GitHubAPI } from '../services/githubAPI.js';
import { GitHubProfile } from '../components/githubProfile.js';
import { RepoGrid } from '../components/repoGrid.js';
import { ActivityFeed } from '../components/activityFeed.js';
import { InteractionSystem } from './interactions.js';

console.log('🚀 Loading Modular Systems...');

document.addEventListener('DOMContentLoaded', () => {
    // Basic Systems
    try { new ProjectManager(); } catch (e) { console.error(e); }
    try { new LanguageSystem(); } catch (e) { console.error(e); }
    try { new AIChat(); } catch (e) { console.error(e); }

    // Phase 1: Premium Cursor
    // try { new CursorSystem(); } catch (e) { console.error(e); }

    // Phase 2: GitHub Integration (deferred until section is visible)
    try {
        const root = document.getElementById('github-root');
        if (root) {
            if (!('IntersectionObserver' in window)) {
                loadGitHubData(root);
            } else {
                const observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(async entry => {
                        if (!entry.isIntersecting) return;
                        obs.disconnect();
                        await loadGitHubData(root);
                    });
                }, { rootMargin: '200px' });
                observer.observe(root);
            }
        }
    } catch (e) { console.error(e); }

    // Phase 3: Interactions
    try { new InteractionSystem(); } catch (e) { console.error(e); }
});

async function loadGitHubData(root) {
    try {
        const gh = new GitHubAPI();
        const data = await gh.getData();
        if (!data) {
            root.innerHTML = '<div class="gh-loader">Unable to load GitHub data right now.</div>';
            return;
        }
        injectGitHubStyles();
        root.innerHTML = `
            <div class="gh-dashboard-grid">
                <div class="gh-left-col">
                    ${new GitHubProfile(data.profile).render()}
                    ${renderTechUsage(data.langStats, data.repos.length)}
                    ${renderFollowers(data.followers)}
                </div>
                <div class="gh-right-col">
                    ${new ActivityFeed(data.activity).render()}
                    ${new RepoGrid(data.repos).render()}
                </div>
            </div>
        `;
        // Add tech badges to existing projects as well
        injectTechBadges();
    } catch (error) {
        console.error(error);
        root.innerHTML = '<div class="gh-loader">Unable to load GitHub data right now.</div>';
    }
}

function injectGitHubStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .gh-dashboard-grid { 
            display: grid; 
            /* Adjusted columns for better activity feed width */
            grid-template-columns: 350px 1fr; 
            gap: 40px; /* Task 1: Increased gap for better separation */
            margin-top: 50px; 
        }

        /* Tech Usage Bar Styles */
        .tech-usage-container {
            margin-top: 24px;
            padding: 20px;
            background: var(--bg-soft);
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-color);
        }
        .tech-usage-title {
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
        }
        .tech-bar-group {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
        }
        .tech-bar-label {
            width: 80px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .tech-track {
            flex: 1;
            height: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            overflow: hidden;
        }
        .tech-fill {
            height: 100%;
            background: var(--text-main); /* Monochrome fill */
        }
        .tech-pct {
            width: 35px;
            font-size: 0.75rem;
            text-align: right;
            font-weight: 700;
            color: var(--text-muted);
        }
        
        /* Task 2: Language Extension Area */
        .tech-summary-row {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        .tech-summary-item strong {
            display: block;
            font-size: 1.1rem;
            color: var(--text-main);
            margin-bottom: 4px;
        }

        .gh-profile-card, .gh-activity-feed, .gh-repo-card {
            background: var(--bg-card);
            border: 3px solid var(--border-color);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-soft);
            color: var(--text-main);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s, border-width 0.2s;
        }

        .gh-profile-card { 
            padding: 40px; 
            text-align: center; 
        }
        
        /* Profile header layout */
        .gh-profile-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
        }
        
        .gh-avatar { 
            width: 140px; 
            height: 140px; 
            border-radius: 50%; 
            border: 4px solid var(--border-color);
            margin: 0 auto 24px auto;
            /* Real color, proper fit */
            object-fit: cover;
            background: var(--bg-soft);
        }
        
        /* Mobile-specific: ensure image is centered in card */
        @media (max-width: 768px) {
            .gh-profile-card {
                padding: 30px 20px;
            }
            .gh-profile-header {
                width: 100%;
                justify-content: center;
            }
            .gh-avatar {
                display: block;
                margin: 0 auto 20px auto;
            }
        }
        
        .gh-meta h3 { font-family: var(--font-head); font-size: 1.8rem; margin: 0; color: var(--text-main); }
        .gh-meta p { color: var(--text-muted); font-weight: 700; margin-top: 8px; }
        .gh-bio { margin: 24px 0; font-size: 1rem; color: var(--text-main); }
        
        .gh-stats { 
            display: flex; justify-content: space-around; 
            padding: 24px 0; 
            border-top: 2px solid var(--border-color); 
            border-bottom: 2px solid var(--border-color); 
            margin-bottom: 24px; 
        }
        .gh-stat-val { font-weight: 800; font-size: 1.4rem; color: var(--text-main); }
        .gh-stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
        
        .gh-link { 
            display: inline-block; 
            padding: 12px 28px; 
            background: var(--bg-dark); 
            color: var(--text-light); 
            border-radius: var(--radius-pill); 
            text-decoration: none; 
            font-weight: 700; 
            transition: all 0.3s;
        }
        .gh-link:hover { transform: translateY(-3px) scale(1.05); }

        .gh-repo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .gh-repo-card { 
            padding: 30px; 
            text-decoration: none; 
            color: var(--text-main); 
            display: flex; 
            flex-direction: column; 
        }
        .gh-repo-card:hover { 
            transform: translateY(-8px) scale(1.02); 
            box-shadow: var(--shadow-hover);
            border-width: 4px;
        }
        .gh-repo-top { display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 15px; font-weight: 600; }
        .gh-repo-top i { color: currentColor; }
        
        .gh-repo-card h3 { color: var(--text-main); font-size: 1.25rem; margin-bottom: 12px; }
        .gh-repo-card p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; flex: 1; }
        
        .gh-repo-footer { display: flex; gap: 15px; font-size: 0.75rem; font-weight: 700; color: var(--text-main); margin-top: 25px; align-items: center; }
        .gh-repo-lang { 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
            padding: 4px 12px; 
            background: var(--bg-soft); 
            border: 2px solid var(--border-color);
            border-radius: var(--radius-pill);
        }
        .lang-dot { 
            width: 8px; height: 8px; border-radius: 50%; display: inline-block; 
            background: var(--text-main); 
        }

        .gh-activity-feed { 
            background: var(--bg-soft); 
            padding: 30px; 
            margin-top: 30px; 
            margin-bottom: 40px; /* Fix: Add space between Activity and Projects */
        }
        
        .gh-events {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 20px;
        }
        .gh-event { 
            display: flex; gap: 20px; padding: 20px; 
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-sm);
            color: var(--text-main);
        }
        .gh-event-icon { color: var(--accent-highlight); font-size: 1.2rem; }
        .gh-event-date { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block; }

        .tech-badges { display: flex; gap: 15px; margin-top: 25px; flex-wrap: wrap; }
        .tech-badge-icon { 
            font-size: 1.5rem; 
            color: currentColor; 
            transition: transform 0.2s, color 0.2s;
            cursor: help;
            position: relative;
        }
        .tech-badge-icon:hover { transform: scale(1.2); color: var(--accent-highlight); }
        
        /* Simple CSS Tooltip */
        .tech-badge-icon[data-tooltip]::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            background: var(--bg-dark);
            color: var(--text-light);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            font-family: var(--font-body);
            font-weight: 700;
            z-index: 100;
        }
        .tech-badge-icon:hover::after, .tech-badge-icon:focus::after { 
            opacity: 1; 
            transform: translateX(-50%) translateY(-5px);
        }
        .tech-badge-icon:focus { outline: none; color: var(--accent-highlight); }

        @media (max-width: 1024px) {
            .gh-dashboard-grid { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
}

function injectTechBadges() {
    const cards = document.querySelectorAll('.project-card');

    // Clear any existing badge containers to prevent duplication
    document.querySelectorAll('.tech-badges').forEach(el => el.remove());

    const techIconMap = {
        'HTML5': { icon: 'fab fa-html5', label: 'HTML5' },
        'HTML': { icon: 'fab fa-html5', label: 'HTML5' },
        'CSS3': { icon: 'fab fa-css3-alt', label: 'CSS3' },
        'CSS': { icon: 'fab fa-css3-alt', label: 'CSS3' },
        'JS': { icon: 'fab fa-js-square', label: 'JavaScript' },
        'JavaScript': { icon: 'fab fa-js-square', label: 'JavaScript' },
        'Vanilla JS': { icon: 'fab fa-js-square', label: 'JavaScript' },
        'Node.js': { icon: 'fab fa-node-js', label: 'Node.js' },
        'Crypto': { icon: 'fas fa-shield-halved', label: 'Security' },
        'Algorithms': { icon: 'fas fa-terminal', label: 'Logic' },
        'UI': { icon: 'fas fa-wand-magic-sparkles', label: 'UI Design' },
        'Figma': { icon: 'fab fa-figma', label: 'Figma' },
        'Web': { icon: 'fas fa-globe', label: 'Web' }
    };

    // Only show HTML, CSS, JavaScript - no extra frameworks or tools
    const techs = [
        ['HTML', 'CSS', 'JavaScript'],
        ['HTML', 'CSS', 'JavaScript'],
        ['HTML', 'CSS', 'JavaScript']
    ];

    cards.forEach((card, i) => {
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'tech-badges';
        const projectTechs = techs[i] || ['Web'];

        badgeContainer.innerHTML = projectTechs.map(t => {
            const config = techIconMap[t] || { icon: 'fas fa-code', label: t };
            return `<i class="${config.icon} tech-badge-icon" 
                       data-tooltip="${config.label}" 
                       aria-label="${config.label}" 
                       title="${config.label}" 
                       role="button" 
                       tabindex="0"></i>`;
        }).join('');

        const desc = card.querySelector('p');
        if (desc) desc.after(badgeContainer);
    });
}

function renderTechUsage(stats, totalProjects = 6) {
    if (!stats) return '';

    return `
        <div class="tech-usage-container">
            <div class="tech-usage-title">Top Languages (GitHub)</div>
            ${Object.entries(stats).map(([lang, pct]) => `
                <div class="tech-bar-group">
                   <div class="tech-bar-label">${lang}</div>
                   <div class="tech-track">
                       <div class="tech-fill" style="width: ${pct}%"></div>
                   </div>
                   <div class="tech-pct">${pct}%</div>
                </div>
            `).join('')}
            
            <div class="tech-summary-row">
                <div class="tech-summary-item">
                    <strong>${totalProjects}</strong>
                    Total Projects
                </div>
                <div class="tech-summary-item" style="text-align: right;">
                    <strong>${new Date().toLocaleDateString('en-GB')}</strong>
                    Last Updated
                </div>
            </div>
        </div>
    `;
}

function renderFollowers(followers) {
    if (!followers || followers.length === 0) return '';
    return `
        <div class="tech-usage-container" style="margin-top: 24px;">
            <div class="tech-usage-title">Recent Followers</div>
            <div class="gh-followers-list">
                ${followers.map(f => `
                    <a href="${f.html_url}" target="_blank" class="follower-item" style="display:flex; align-items:center; gap:12px; margin-bottom:12px; text-decoration:none; color:inherit;">
                        <img src="${f.avatar_url}" alt="${f.login}" style="width:36px; height:36px; border-radius:50%; border:2px solid var(--border-color);">
                        <span style="font-size:0.9rem; font-weight:700;">${f.login}</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}
