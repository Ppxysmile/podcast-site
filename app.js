// ==================== App State ====================
const state = {
    podcasts: [],
    favorites: JSON.parse(localStorage.getItem('podcastFavorites') || '[]'),
    history: JSON.parse(localStorage.getItem('podcastHistory') || '[]'),
    currentEpisode: null,
    isPlaying: false,
    playMode: 'order', // 'order', 'shuffle', 'loop'
    volume: parseFloat(localStorage.getItem('podcastVolume') || '0.8'),
    speed: parseFloat(localStorage.getItem('podcastSpeed') || '1'),
    timerMinutes: 0,
    timerInterval: null,
    searchQuery: '',
    currentCategory: 'all',
    audio: new Audio(),
    isLoading: false
};

// ==================== Default Podcasts Data ====================
const defaultPodcasts = [
    {
        id: '1',
        title: 'TED Talks Daily',
        category: '科技',
        cover: '🎤',
        rss: 'https://feeds.feedburner.com/TEDTalks_audio',
        description: '每日TED演讲，让灵感触手可及'
    },
    {
        id: '2',
        title: '心理学早读',
        category: '心理',
        cover: '🧠',
        rss: 'https://yufengbt.com/feed',
        description: '每天一点心理学，遇见更好的自己'
    },
    {
        id: '3',
        title: '财经早知道',
        category: '财经',
        cover: '💰',
        rss: '',
        description: '每天早晨3分钟，了解全球财经动态'
    },
    {
        id: '4',
        title: '新闻早餐',
        category: '新闻',
        cover: '📰',
        rss: '',
        description: '每天早上，听见世界的声音'
    },
    {
        id: '5',
        title: '游戏观察',
        category: '游戏',
        cover: '🎮',
        rss: '',
        description: '游戏行业深度分析与八卦'
    },
    {
        id: '6',
        title: '科技yclic',
        category: '科技',
        cover: '🚀',
        rss: '',
        description: '深度解读科技趋势与产品'
    },
    {
        id: '7',
        title: '心灵鸡汤',
        category: '治愈',
        cover: '💚',
        rss: '',
        description: '温暖你的每一个夜晚'
    },
    {
        id: '8',
        title: '创业者说',
        category: '励志',
        cover: '💪',
        rss: '',
        description: '分享创业故事，传递前行力量'
    },
    {
        id: '9',
        title: '金融瞭望',
        category: '金融',
        cover: '🏦',
        rss: '',
        description: '深度解读金融市场与投资机会'
    },
    {
        id: '10',
        title: '睡眠引导',
        category: '治愈',
        cover: '🌙',
        rss: '',
        description: '专业引导，助你入眠'
    }
];

// Sample episodes for demo
const sampleEpisodes = {
    '1': [
        { id: 'e1-1', title: 'How great leaders inspire action', duration: '18:32', audioUrl: '' },
        { id: 'e1-2', title: 'The power of vulnerability', duration: '20:45', audioUrl: '' },
        { id: 'e1-3', title: 'Your body language may shape who you are', duration: '15:28', audioUrl: '' }
    ],
    '2': [
        { id: 'e2-1', title: '认识你自己：心理学入门', duration: '25:10', audioUrl: '' },
        { id: 'e2-2', title: '为什么我们会拖延？', duration: '22:15', audioUrl: '' },
        { id: 'e2-3', title: '如何建立健康的人际关系', duration: '28:30', audioUrl: '' }
    ],
    'default': [
        { id: 'd-1', title: '节目试听片段', duration: '05:00', audioUrl: '' }
    ]
};

// ==================== Initialization ====================
function init() {
    loadPodcasts();
    setupAudio();
    setupEventListeners();
    renderPodcasts();
    renderFavorites();
    renderHistory();
}

// ==================== Data Management ====================
function loadPodcasts() {
    const savedPodcasts = localStorage.getItem('customPodcasts');
    if (savedPodcasts) {
        state.podcasts = [...defaultPodcasts, ...JSON.parse(savedPodcasts)];
    } else {
        state.podcasts = [...defaultPodcasts];
    }
}

function saveCustomPodcasts() {
    const customPodcasts = state.podcasts.filter(p => !defaultPodcasts.find(dp => dp.id === p.id));
    localStorage.setItem('customPodcasts', JSON.stringify(customPodcasts));
}

function getEpisodes(podcast) {
    if (podcast.episodes) {
        return podcast.episodes;
    }
    return sampleEpisodes[podcast.id] || sampleEpisodes['default'];
}

function saveFavorites() {
    localStorage.setItem('podcastFavorites', JSON.stringify(state.favorites));
}

function saveHistory() {
    localStorage.setItem('podcastHistory', JSON.stringify(state.history));
}

function addToHistory(episode, podcast) {
    const historyItem = {
        episode: episode,
        podcast: podcast,
        timestamp: Date.now(),
        progress: 0
    };

    // Remove if already exists
    state.history = state.history.filter(h => h.episode.id !== episode.id);

    // Add to beginning
    state.history.unshift(historyItem);

    // Keep only last 50 items
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }

    saveHistory();
    renderHistory();
}

// ==================== iTunes API Search ====================
async function searchiTunes(term) {
    showLoading(true);
    try {
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=podcast&limit=20`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const searchResults = data.results.map((item, index) => ({
                id: 'itunes-' + item.trackId,
                title: item.trackName,
                artist: item.artistName,
                category: mapGenre(item.primaryGenreName),
                cover: item.artworkUrl600 || item.artworkUrl100 || '🎧',
                rss: item.feedUrl || '',
                description: item.collectionName || item.trackName,
                itunesData: item
            }));

            // Show search results modal
            showSearchResults(searchResults);
        } else {
            alert('No podcasts found. Try a different search term.');
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

function mapGenre(genre) {
    const genreMap = {
        'Self-Improvement': '励志',
        'Business': '财经',
        'News': '新闻',
        'Technology': '科技',
        'Science': '科技',
        'Games & Hobbies': '游戏',
        'Health & Fitness': '健康',
        'Mental Health': '心理',
        'Society & Culture': '心理',
        'Comedy': '治愈',
        'Music': '音乐',
        'Education': '教育',
        'Arts': '艺术'
    };
    return genreMap[genre] || genre || '其他';
}

function showSearchResults(results) {
    // Remove existing modal
    const existingModal = document.getElementById('searchResultsModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'searchResultsModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Search Results (${results.length})</h3>
                <button class="close-btn" onclick="closeSearchResultsModal()">×</button>
            </div>
            <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
                ${results.map(podcast => `
                    <div class="history-item" onclick="addPodcastFromSearch('${podcast.id}')">
                        <div class="history-cover" style="width: 64px; height: 64px;">
                            ${podcast.cover.startsWith('http')
                                ? `<img src="${podcast.cover}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
                                : podcast.cover}
                        </div>
                        <div class="history-info">
                            <div class="history-title">${podcast.title}</div>
                            <div class="history-podcast">${podcast.artist}</div>
                            <div class="history-time">${podcast.category}</div>
                        </div>
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Add</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Store results globally for addPodcastFromSearch
    window.searchResults = results;
}

function closeSearchResultsModal() {
    const modal = document.getElementById('searchResultsModal');
    if (modal) modal.remove();
}

function addPodcastFromSearch(podcastId) {
    const podcast = window.searchResults.find(p => p.id === podcastId);
    if (!podcast) return;

    // Check if already exists
    if (state.podcasts.find(p => p.id === podcast.id)) {
        alert('This podcast is already in your library!');
        return;
    }

    state.podcasts.push(podcast);
    saveCustomPodcasts();
    closeSearchResultsModal();
    renderPodcasts();

    alert(`"${podcast.title}" added to your library!`);
}

// ==================== RSS Feed Loading via Proxy ====================
async function loadRSSFeed(rssUrl, podcastId) {
    if (!rssUrl) return null;

    showLoading(true);
    try {
        // Use CORS proxy to fetch RSS
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch RSS');
        }

        const text = await response.text();
        const episodes = parseRSS(text, podcastId);

        // Update podcast with episodes
        const podcast = state.podcasts.find(p => p.id === podcastId);
        if (podcast) {
            podcast.episodes = episodes;
            podcast.cover = podcast.cover || '🎧';
        }

        return episodes;
    } catch (error) {
        console.error('RSS load error:', error);
        // Try alternative proxy
        try {
            const altProxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
            const response = await fetch(altProxyUrl);
            const text = await response.text();
            return parseRSS(text, podcastId);
        } catch (altError) {
            console.error('Alternative proxy also failed:', altError);
            return null;
        }
    } finally {
        showLoading(false);
    }
}

function parseRSS(xmlText, podcastId) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');

    const items = xml.querySelectorAll('item');
    const episodes = [];

    items.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent || `Episode ${index + 1}`;
        const enclosure = item.querySelector('enclosure');
        const audioUrl = enclosure?.getAttribute('url') || '';
        const duration = item.querySelector('itunes\\:duration, duration')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';

        // Parse duration to mm:ss or hh:mm:ss format
        let formattedDuration = '';
        if (duration) {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            if (match) {
                const hours = match[1] ? parseInt(match[1]) : 0;
                const mins = match[2] ? parseInt(match[2]) : 0;
                const secs = match[3] ? parseInt(match[3]) : 0;
                if (hours > 0) {
                    formattedDuration = `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                } else {
                    formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
            } else {
                formattedDuration = duration;
            }
        }

        episodes.push({
            id: `episode-${podcastId}-${index}`,
            title: title.trim(),
            audioUrl: audioUrl.trim(),
            duration: formattedDuration || '--:--',
            pubDate: pubDate.trim()
        });
    });

    return episodes;
}

// ==================== Audio Setup ====================
function setupAudio() {
    state.audio.volume = state.volume;
    state.audio.playbackRate = state.speed;

    state.audio.addEventListener('timeupdate', updateProgress);
    state.audio.addEventListener('ended', handleEpisodeEnded);
    state.audio.addEventListener('loadedmetadata', () => {
        const duration = state.audio.duration;
        document.getElementById('duration').textContent = formatTime(duration);
    });
    state.audio.addEventListener('error', (e) => {
        console.log('Audio error (may be expected for demo):', e);
    });
}

function updateProgress() {
    const { currentTime, duration } = state.audio;
    const progress = (currentTime / duration) * 100 || 0;

    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('currentTime').textContent = formatTime(currentTime);

    // Update history progress
    if (state.currentEpisode && state.history.length > 0) {
        const historyItem = state.history.find(h => h.episode.id === state.currentEpisode.id);
        if (historyItem) {
            historyItem.progress = progress;
        }
    }
}

function handleEpisodeEnded() {
    if (state.playMode === 'loop') {
        state.audio.currentTime = 0;
        state.audio.play();
    } else {
        playNext();
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ==================== Playback Control ====================
async function playEpisode(episode, podcast) {
    state.currentEpisode = episode;
    state.isPlaying = true;

    updatePlayerUI(episode, podcast);
    addToHistory(episode, podcast);

    // Try to load RSS if episode has RSS URL and no episodes loaded
    if (podcast.rss && !podcast.episodes) {
        await loadRSSFeed(podcast.rss, podcast.id);
    }

    // Update button
    document.getElementById('playBtn').textContent = '⏸️';

    // Play audio if URL exists
    if (episode.audioUrl) {
        state.audio.src = episode.audioUrl;
        try {
            await state.audio.play();
        } catch (error) {
            console.log('Audio playback failed (may be expected):', error);
        }
    } else {
        // Demo mode - just show playing state
        console.log('Demo mode - no audio URL');
    }
}

async function showEpisodes(podcastId) {
    const podcast = state.podcasts.find(p => p.id === podcastId);
    if (!podcast) return;

    // If podcast has RSS but no episodes loaded, try to load them
    if (podcast.rss && !podcast.episodes) {
        showLoading(true);
        await loadRSSFeed(podcast.rss, podcast.id);
        showLoading(false);
    }

    const episodes = getEpisodes(podcast);

    // Create modal to show episodes
    const existingModal = document.getElementById('episodeModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'episodeModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${podcast.title}</h3>
                <button class="close-btn" onclick="closeEpisodeModal()">×</button>
            </div>
            <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                <p style="color: var(--text-muted); margin-bottom: 16px;">${podcast.description || ''}</p>
                ${episodes.length > 0 ? episodes.map(ep => `
                    <div class="history-item" onclick="event.stopPropagation(); playEpisodeFromModal('${ep.id}', '${podcast.id}')">
                        <div class="history-cover">${podcast.cover}</div>
                        <div class="history-info">
                            <div class="history-title">${ep.title}</div>
                            <div class="history-time">${ep.duration || '--:--'}</div>
                        </div>
                        <span class="podcast-favorite" onclick="event.stopPropagation(); toggleFavoriteFromModal('${ep.id}', '${podcast.id}')">
                            ${isFavorite(ep.id) ? '❤️' : '🤍'}
                        </span>
                    </div>
                `).join('') : '<p style="color: var(--text-muted); text-align: center;">No episodes available</p>'}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function togglePlay() {
    if (!state.currentEpisode) return;

    state.isPlaying = !state.isPlaying;
    document.getElementById('playBtn').textContent = state.isPlaying ? '⏸️' : '▶️';

    if (state.isPlaying && state.currentEpisode.audioUrl) {
        state.audio.play();
    } else {
        state.audio.pause();
    }
}

function playNext() {
    if (!state.currentEpisode) return;

    // Get all episodes from all podcasts for next
    const allEpisodes = [];
    state.podcasts.forEach(podcast => {
        getEpisodes(podcast).forEach(ep => {
            allEpisodes.push({ episode: ep, podcast });
        });
    });

    if (allEpisodes.length === 0) return;

    const currentIndex = allEpisodes.findIndex(e => e.episode.id === state.currentEpisode.id);

    let nextIndex;
    if (state.playMode === 'shuffle') {
        nextIndex = Math.floor(Math.random() * allEpisodes.length);
    } else {
        nextIndex = (currentIndex + 1) % allEpisodes.length;
    }

    const next = allEpisodes[nextIndex];
    playEpisode(next.episode, next.podcast);
}

function playPrev() {
    if (!state.currentEpisode) return;

    const allEpisodes = [];
    state.podcasts.forEach(podcast => {
        getEpisodes(podcast).forEach(ep => {
            allEpisodes.push({ episode: ep, podcast });
        });
    });

    if (allEpisodes.length === 0) return;

    const currentIndex = allEpisodes.findIndex(e => e.episode.id === state.currentEpisode.id);
    const prevIndex = (currentIndex - 1 + allEpisodes.length) % allEpisodes.length;

    const prev = allEpisodes[prevIndex];
    playEpisode(prev.episode, prev.podcast);
}

function setVolume(value) {
    state.volume = value;
    state.audio.volume = value;
    localStorage.setItem('podcastVolume', value);
}

function setSpeed(value) {
    state.speed = value;
    state.audio.playbackRate = value;
    localStorage.setItem('podcastSpeed', value);

    document.getElementById('speedBtn').textContent = `${value}x`;

    // Update speed menu active state
    document.querySelectorAll('.speed-option').forEach(opt => {
        opt.classList.toggle('active', parseFloat(opt.dataset.speed) === value);
    });
}

function toggleShuffle() {
    state.playMode = state.playMode === 'shuffle' ? 'order' : 'shuffle';
    document.getElementById('shuffleBtn').classList.toggle('active', state.playMode === 'shuffle');
}

function toggleLoop() {
    state.playMode = state.playMode === 'loop' ? 'order' : 'loop';
    document.getElementById('loopBtn').classList.toggle('active', state.playMode === 'loop');
}

// ==================== Timer ====================
function showTimerModal() {
    document.getElementById('timerModal').classList.add('show');
}

function closeTimerModal() {
    document.getElementById('timerModal').classList.remove('show');
}

function setTimer(minutes) {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    state.timerMinutes = minutes;

    if (minutes > 0) {
        const endTime = Date.now() + minutes * 60 * 1000;
        state.timerInterval = setInterval(() => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
                state.audio.pause();
                state.isPlaying = false;
                document.getElementById('playBtn').textContent = '▶️';
                alert('Timer ended, playback stopped');
            }
        }, 1000);
    }

    closeTimerModal();
}

// ==================== Favorites ====================
function toggleFavorite(episode, podcast) {
    const index = state.favorites.findIndex(f => f.episode.id === episode.id);

    if (index === -1) {
        state.favorites.push({ episode, podcast });
    } else {
        state.favorites.splice(index, 1);
    }

    saveFavorites();
    renderFavorites();
    updateFavoriteButton(episode.id);
}

function isFavorite(episodeId) {
    return state.favorites.some(f => f.episode.id === episodeId);
}

function updateFavoriteButton(episodeId) {
    const btn = document.getElementById('favoriteBtn');
    if (isFavorite(episodeId)) {
        btn.textContent = '❤️';
        btn.classList.add('active');
    } else {
        btn.textContent = '🤍';
        btn.classList.remove('active');
    }
}

// ==================== UI Updates ====================
function updatePlayerUI(episode, podcast) {
    document.getElementById('playerTitle').textContent = episode.title;
    document.getElementById('playerPodcast').textContent = podcast.title;

    const coverEl = document.getElementById('playerCover');
    coverEl.innerHTML = podcast.cover && podcast.cover.startsWith('http')
        ? `<img src="${podcast.cover}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
        : (podcast.cover || '🎧');

    updateFavoriteButton(episode.id);
}

function renderPodcasts() {
    const grid = document.getElementById('podcastGrid');
    let podcastsToRender = state.podcasts;

    // Filter by category
    if (state.currentCategory !== 'all') {
        podcastsToRender = podcastsToRender.filter(p => p.category === state.currentCategory);
    }

    // Filter by search
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        podcastsToRender = podcastsToRender.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.artist && p.artist.toLowerCase().includes(query))
        );
    }

    grid.innerHTML = podcastsToRender.map(podcast => `
        <div class="podcast-card" onclick="showEpisodes('${podcast.id}')">
            <div class="podcast-cover">
                ${podcast.cover && podcast.cover.startsWith('http')
                    ? `<img src="${podcast.cover}" alt="" style="width:100%;height:100%;object-fit:cover;">`
                    : (podcast.cover || '🎧')}
                <div class="podcast-play-overlay">
                    <div class="podcast-play-icon">▶️</div>
                </div>
            </div>
            <div class="podcast-info">
                <div class="podcast-title">${podcast.title}</div>
                <div class="podcast-category">${podcast.category}</div>
                <div class="podcast-meta">
                    <span class="podcast-episode-count">${getEpisodes(podcast).length} episodes</span>
                </div>
            </div>
        </div>
    `).join('');

    if (podcastsToRender.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No podcasts found</p></div>';
    }
}

function closeEpisodeModal() {
    const modal = document.getElementById('episodeModal');
    if (modal) modal.remove();
}

function playEpisodeFromModal(episodeId, podcastId) {
    const podcast = state.podcasts.find(p => p.id === podcastId);
    const episode = getEpisodes(podcast).find(e => e.id === episodeId);

    if (episode && podcast) {
        playEpisode(episode, podcast);
        closeEpisodeModal();
    }
}

function toggleFavoriteFromModal(episodeId, podcastId) {
    const podcast = state.podcasts.find(p => p.id === podcastId);
    const episode = getEpisodes(podcast).find(e => e.id === episodeId);

    if (episode && podcast) {
        toggleFavorite(episode, podcast);
        // Re-render modal to update heart
        showEpisodes(podcastId);
    }
}

function renderFavorites() {
    const grid = document.getElementById('libraryGrid');
    const empty = document.getElementById('libraryEmpty');

    if (state.favorites.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    grid.innerHTML = state.favorites.map(fav => `
        <div class="podcast-card" onclick="playEpisodeFromModal('${fav.episode.id}', '${fav.podcast.id}')">
            <div class="podcast-cover">
                ${fav.podcast.cover && fav.podcast.cover.startsWith('http')
                    ? `<img src="${fav.podcast.cover}" alt="" style="width:100%;height:100%;object-fit:cover;">`
                    : (fav.podcast.cover || '🎧')}
                <div class="podcast-play-overlay">
                    <div class="podcast-play-icon">▶️</div>
                </div>
            </div>
            <div class="podcast-info">
                <div class="podcast-title">${fav.episode.title}</div>
                <div class="podcast-category">${fav.podcast.title}</div>
                <div class="podcast-meta">
                    <span class="podcast-episode-count">${fav.episode.duration || '--:--'}</span>
                    <span class="podcast-favorite" onclick="event.stopPropagation(); toggleFavoriteFromModal('${fav.episode.id}', '${fav.podcast.id}')">❤️</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderHistory() {
    const list = document.getElementById('historyList');
    const empty = document.getElementById('historyEmpty');

    if (state.history.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    empty.style.display = 'none';

    list.innerHTML = state.history.map(h => `
        <div class="history-item" onclick="playEpisodeFromModal('${h.episode.id}', '${h.podcast.id}')">
            <div class="history-cover">${h.podcast.cover}</div>
            <div class="history-info">
                <div class="history-title">${h.episode.title}</div>
                <div class="history-podcast">${h.podcast.title}</div>
                <div class="history-time">${formatTimeAgo(h.timestamp)}</div>
                ${h.progress > 0 ? `
                    <div class="history-progress">
                        <div class="history-progress-fill" style="width: ${h.progress}%"></div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(timestamp).toLocaleDateString('en-US');
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        state.history = [];
        saveHistory();
        renderHistory();
    }
}

// ==================== Add RSS ====================
function showAddRssModal() {
    document.getElementById('addRssModal').classList.add('show');
}

function closeAddRssModal() {
    document.getElementById('addRssModal').classList.remove('show');
    document.getElementById('rssUrlInput').value = '';
}

async function addCustomRss() {
    const url = document.getElementById('rssUrlInput').value.trim();

    if (!url) {
        alert('Please enter an RSS URL');
        return;
    }

    if (!url.startsWith('http')) {
        alert('Please enter a valid RSS URL');
        return;
    }

    showLoading(true);
    try {
        // Try to fetch and parse the RSS to validate it
        const episodes = await loadRSSFeed(url, 'temp-' + Date.now());

        // Create a new podcast entry
        const newPodcast = {
            id: 'custom-' + Date.now(),
            title: document.getElementById('rssTitleInput')?.value || 'Custom Podcast',
            category: document.getElementById('rssCategoryInput')?.value || 'Other',
            cover: '📻',
            rss: url,
            description: 'Custom RSS subscription',
            episodes: episodes || []
        };

        state.podcasts.push(newPodcast);
        saveCustomPodcasts();

        closeAddRssModal();
        renderPodcasts();

        alert('Podcast added successfully!');
    } catch (error) {
        console.error('Failed to add RSS:', error);
        alert('Failed to add podcast. Please check the RSS URL.');
    } finally {
        showLoading(false);
    }
}

// ==================== Loading Indicator ====================
function showLoading(show) {
    state.isLoading = show;
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

// ==================== View Switching ====================
function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(view + 'View').classList.add('active');
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
}

// ==================== Dark Mode ====================
function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('darkModeToggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('darkModeToggle').textContent = '☀️';
    }
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Categories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentCategory = btn.dataset.category;
            renderPodcasts();
        });
    });

    // Search
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.searchQuery = e.target.value;
            renderPodcasts();
        }, 300);
    });

    // iTunes Search button
    document.getElementById('searchBtn').addEventListener('click', () => {
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
            searchiTunes(query);
        }
    });

    // Player controls
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('nextBtn').addEventListener('click', playNext);
    document.getElementById('prevBtn').addEventListener('click', playPrev);
    document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
    document.getElementById('loopBtn').addEventListener('click', toggleLoop);

    // Progress bar
    document.getElementById('progressBar').addEventListener('click', (e) => {
        if (!state.currentEpisode || !state.audio.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        state.audio.currentTime = percent * state.audio.duration;
    });

    // Volume
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        setVolume(e.target.value / 100);
    });

    document.getElementById('volumeBtn').addEventListener('click', () => {
        const slider = document.getElementById('volumeSlider');
        if (slider.value > 0) {
            slider.dataset.prevValue = slider.value;
            slider.value = 0;
            setVolume(0);
        } else {
            slider.value = slider.dataset.prevValue || 80;
            setVolume(slider.value / 100);
        }
    });

    // Speed
    document.getElementById('speedBtn').addEventListener('click', () => {
        document.getElementById('speedMenu').classList.toggle('show');
    });

    document.querySelectorAll('.speed-option').forEach(opt => {
        opt.addEventListener('click', () => {
            setSpeed(parseFloat(opt.dataset.speed));
            document.getElementById('speedMenu').classList.remove('show');
        });
    });

    // Timer
    document.getElementById('timerBtn').addEventListener('click', showTimerModal);
    document.querySelectorAll('.timer-option').forEach(opt => {
        opt.addEventListener('click', () => setTimer(parseInt(opt.dataset.minutes)));
    });

    // Favorite
    document.getElementById('favoriteBtn').addEventListener('click', () => {
        if (state.currentEpisode) {
            const podcast = state.podcasts.find(p =>
                getEpisodes(p).some(e => e.id === state.currentEpisode.id)
            );
            toggleFavorite(state.currentEpisode, podcast);
        }
    });

    // Dark mode
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Clear history
    document.getElementById('clearHistory').addEventListener('click', clearHistory);

    // Add RSS
    document.getElementById('addRssBtn').addEventListener('click', addCustomRss);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Close speed menu on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.speed-control')) {
            document.getElementById('speedMenu').classList.remove('show');
        }
    });

    // Load theme
    loadTheme();
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', init);

// ==================== Global Functions ====================
window.switchView = switchView;
window.closeEpisodeModal = closeEpisodeModal;
window.playEpisodeFromModal = playEpisodeFromModal;
window.toggleFavoriteFromModal = toggleFavoriteFromModal;
window.closeTimerModal = closeTimerModal;
window.closeAddRssModal = closeAddRssModal;
window.closeSearchResultsModal = closeSearchResultsModal;
window.addPodcastFromSearch = addPodcastFromSearch;
