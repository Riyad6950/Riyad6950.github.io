
export class GitHubProfile {
    constructor(data) {
        this.data = data;
    }

    render() {
        if (!this.data) return '';
        
        return `
            <div class="gh-profile-card">
                <div class="gh-profile-header">
                    <img src="${this.data.avatar_url}" alt="${this.data.name}" class="gh-avatar">
                    <div class="gh-meta">
                        <h3>${this.data.name}</h3>
                        <p>@${this.data.login}</p>
                    </div>
                </div>
                <p class="gh-bio">${this.data.bio || 'Developer & Creative Coder'}</p>
                <div class="gh-stats">
                    <div class="gh-stat">
                        <span class="gh-stat-val">${this.data.public_repos}</span>
                        <span class="gh-stat-label">Repos</span>
                    </div>
                    <div class="gh-stat">
                        <span class="gh-stat-val">${this.data.followers}</span>
                        <span class="gh-stat-label">Followers</span>
                    </div>
                    <div class="gh-stat">
                        <span class="gh-stat-val">${this.data.following}</span>
                        <span class="gh-stat-label">Following</span>
                    </div>
                </div>
                <a href="${this.data.html_url}" target="_blank" class="gh-link">
                    Follow on GitHub <i class="fab fa-github"></i>
                </a>
            </div>
        `;
    }
}
