
export class ActivityFeed {
    constructor(events) {
        this.events = events;
    }

    render() {
        if (!this.events?.length) return '';

        return `
            <div class="gh-activity-feed">
                <h4>Recent Activity</h4>
                <div class="gh-events">
                    ${this.events.slice(0, 5).map(event => `
                        <div class="gh-event">
                            <div class="gh-event-icon">
                                ${this.getEventIcon(event.type)}
                            </div>
                            <div class="gh-event-content">
                                <p class="gh-event-text">${this.formatEvent(event)}</p>
                                <span class="gh-event-date">${this.timeAgo(event.created_at)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getEventIcon(type) {
        switch(type) {
            case 'PushEvent': return '<i class="fas fa-code-commit"></i>';
            case 'CreateEvent': return '<i class="fas fa-plus"></i>';
            case 'WatchEvent': return '<i class="fas fa-star"></i>';
            default: return '<i class="fas fa-bolt"></i>';
        }
    }

    formatEvent(event) {
        const repo = event.repo.name.split('/')[1];
        switch(event.type) {
            case 'PushEvent': 
                return `Pushed ${event.payload.size} commits to <strong>${repo}</strong>`;
            case 'CreateEvent':
                return `Created ${event.payload.ref_type} <strong>${repo}</strong>`;
            case 'WatchEvent':
                return `Starred <strong>${repo}</strong>`;
            default:
                return `Activity in <strong>${repo}</strong>`;
        }
    }

    timeAgo(dateString) {
        const date = new Date(dateString);
        const seconds = Math.floor((Date.now() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }
}
