
export class GitHubAPI {
    constructor(username = 'Riyad6950') {
        this.username = username;
        this.baseURL = 'https://api.github.com';
        this.cacheKey = `github_data_v2_${username}`; // V2 to force fresh fetch for new logic
        this.cacheTTL = 3600 * 1000; // 1 hour
    }

    async getData() {
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < this.cacheTTL) {
                console.log('📦 Using GitHub cached data');
                return data;
            }
        }

        try {
            console.log('🌐 Fetching fresh GitHub data...');
            const [profile, repos, activity, followers] = await Promise.all([
                fetch(`${this.baseURL}/users/${this.username}`).then(r => r.json()),
                fetch(`${this.baseURL}/users/${this.username}/repos?sort=updated&per_page=6`).then(r => r.json()),
                fetch(`${this.baseURL}/users/${this.username}/events/public?per_page=10`).then(r => r.json()),
                fetch(`${this.baseURL}/users/${this.username}/followers?per_page=5`).then(r => r.json())
            ]);

            // Fetch languages for all repos in parallel
            const langPromises = repos.map(repo =>
                fetch(repo.languages_url).then(r => r.json())
            );
            const langData = await Promise.all(langPromises);

            // Calculate aggregate language usage
            const totalStats = { HTML: 0, CSS: 0, JavaScript: 0, Others: 0 };
            let grandTotal = 0;

            langData.forEach((repoLangs, index) => {
                // Attach to repo object for Task 3
                repos[index].languages = repoLangs;

                for (const [lang, bytes] of Object.entries(repoLangs)) {
                    if (totalStats[lang] !== undefined) {
                        totalStats[lang] += bytes;
                    } else {
                        totalStats.Others += bytes; // Group everything else
                    }
                    grandTotal += bytes;
                }
            });

            // Add calculated percentages to data object
            const langStats = {
                HTML: Math.round((totalStats.HTML / grandTotal) * 100) || 0,
                CSS: Math.round((totalStats.CSS / grandTotal) * 100) || 0,
                JavaScript: Math.round((totalStats.JavaScript / grandTotal) * 100) || 0
            };

            const data = { profile, repos, activity, langStats, followers };
            localStorage.setItem(this.cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));

            return data;
        } catch (error) {
            console.error('❌ GitHub Fetch failed:', error);
            return null;
        }
    }
}
