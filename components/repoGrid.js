
export class RepoGrid {
    constructor(repos) {
        this.repos = repos;
    }

    render() {
        if (!this.repos?.length) return '';

        return `
            <div class="gh-repo-grid">
                ${this.repos.map(repo => `
                    <a href="${repo.html_url}" target="_blank" class="gh-repo-card">
                        <div class="gh-repo-top">
                            <i class="far fa-folder"></i>
                            <div class="gh-repo-stars">
                                <i class="far fa-star"></i> ${repo.stargazers_count}
                            </div>
                        </div>
                        <h3>${repo.name}</h3>
                        <p>${repo.description || 'No description available'}</p>
                        <div class="gh-repo-footer">
                            <div class="gh-lang-breakdown">
                                ${this.renderLangBars(repo.languages)}
                            </div>
                            <span class="gh-repo-size">${(repo.size / 1024).toFixed(1)} MB</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }

    renderLangBars(langs) {
        if (!langs) return '';
        const total = Object.values(langs).reduce((a, b) => a + b, 0);
        if (total === 0) return '';

        // Only show top 3 or specific tracked langs to save space
        const tracked = ['HTML', 'CSS', 'JavaScript'];

        return `<div class="gh-lang-stack" style="display:flex; gap:8px; flex-wrap:wrap;">
            ${Object.entries(langs)
                .filter(([l]) => tracked.includes(l) || Object.keys(langs).length < 3)
                .map(([l, bytes]) => {
                    const pct = Math.round((bytes / total) * 100);
                    if (pct < 5) return ''; // Skip tiny amounts
                    return `<span style="font-size:0.7rem; font-weight:700; color:var(--text-muted); display:flex; align-items:center; gap:4px;">
                        ${l} ${pct}%
                    </span>`;
                }).join('')}
        </div>`;
    }
}
