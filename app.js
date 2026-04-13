// ==================== App State ====================
const state = {
    podcasts: [],
    favorites: JSON.parse(localStorage.getItem('podcastFavorites') || '[]'),
    history: JSON.parse(localStorage.getItem('podcastHistory') || '[]'),
    currentEpisode: null,
    currentPodcast: null,
    currentEpisodeList: [],
    currentEpisodeIndex: -1,
    isPlaying: false,
    playMode: 'order',
    volume: parseFloat(localStorage.getItem('podcastVolume') || '0.8'),
    speed: parseFloat(localStorage.getItem('podcastSpeed') || '1'),
    timerMinutes: 0,
    timerRemaining: 0,
    timerInterval: null,
    searchQuery: '',
    currentCategory: 'all',
    audio: new Audio(),
    isLoading: false,
    isDarkMode: localStorage.getItem('podcastDarkMode') === 'true',
    language: localStorage.getItem('podcastLanguage') || 'zh'
};

// ==================== Language Pack ====================
const translations = {
    zh: {
        // Header
        discover: '发现',
        library: '收藏',
        history: '历史',
        // Hero
        heroTitle: '随时随地，',
        heroTitleAccent: '自由聆听',
        heroSubtitle: '发现海量播客，即刻播放，无限可能',
        searchPlaceholder: '搜索播客...',
        addRss: '添加 RSS',
        // Categories
        all: '全部',
        chinese: '中文精选',
        featured: '精选播客',
        featuredSub: '为你精选',
        // Player
        nowPlaying: '正在播放',
        noAudio: '无可播放内容',
        // Actions
        play: '播放',
        pause: '暂停',
        previous: '上一首',
        next: '下一首',
        shuffle: '随机',
        loop: '循环',
        speed: '倍速',
        volume: '音量',
        timer: '定时',
        favorite: '收藏',
        unfavorite: '取消收藏',
        // Timer
        sleepTimer: '睡眠定时',
        timerOff: '关闭',
        timerMinutes: '{n} 分钟',
        // Tabs
        episodes: '节目列表',
        about: '简介',
        // Empty states
        noFavorites: '暂无收藏',
        noHistory: '暂无历史记录',
        noEpisodes: '暂无节目',
        // Messages
        addedToFav: '已添加到收藏',
        removedFromFav: '已从收藏移除',
        historyCleared: '历史记录已清除',
        timerSet: '定时已设置',
        timerOff: '定时已关闭',
        // Categories
        tech: '科技',
        news: '新闻',
        finance: '财经',
        psychology: '心理',
        motivation: '励志',
        healing: '治愈',
        // Library section
        myFavorites: '我的收藏',
        myFavoritesSub: '你喜欢的播客',
        startExploring: '开始探索，添加你喜欢的播客',
        // History section
        recentPlays: '最近播放',
        recentPlaysSub: '继续收听上次的内容',
        clearAll: '清除全部',
        startListening: '开始收听，建立你的历史记录',
        // Misc
        noNext: '没有下一首了',
        noPrev: '没有上一首了',
        shuffleOn: '随机播放已开启',
        shuffleOff: '随机播放已关闭',
        loopOn: '循环播放已开启',
        loopOff: '循环播放已关闭'
    },
    en: {
        // Header
        discover: 'Discover',
        library: 'Library',
        history: 'History',
        // Hero
        heroTitle: 'Listen',
        heroTitleAccent: 'without limits',
        heroSubtitle: 'Discover millions of podcasts. Play instantly, anytime, anywhere.',
        searchPlaceholder: 'Search podcasts...',
        addRss: 'Add RSS',
        // Categories
        all: 'All',
        chinese: 'Chinese',
        featured: 'Featured',
        featuredSub: 'Handpicked for you',
        // Player
        nowPlaying: 'Now Playing',
        noAudio: 'No audio available',
        // Actions
        play: 'Play',
        pause: 'Pause',
        previous: 'Previous',
        next: 'Next',
        shuffle: 'Shuffle',
        loop: 'Loop',
        speed: 'Speed',
        volume: 'Volume',
        timer: 'Timer',
        favorite: 'Favorite',
        unfavorite: 'Unfavorite',
        // Timer
        sleepTimer: 'Sleep Timer',
        timerOff: 'Off',
        timerMinutes: '{n} min',
        // Tabs
        episodes: 'Episodes',
        about: 'About',
        // Empty states
        noFavorites: 'No favorites yet',
        noHistory: 'No history yet',
        noEpisodes: 'No episodes',
        // Messages
        addedToFav: 'Added to favorites',
        removedFromFav: 'Removed from favorites',
        historyCleared: 'History cleared',
        timerSet: 'Timer set',
        timerOff: 'Timer off',
        // Categories
        tech: 'Tech',
        news: 'News',
        finance: 'Finance',
        psychology: 'Psychology',
        motivation: 'Motivation',
        healing: 'Healing',
        // Library section
        myFavorites: 'My Favorites',
        myFavoritesSub: 'Podcasts you love',
        startExploring: 'Start exploring and add podcasts you love',
        // History section
        recentPlays: 'Recent Plays',
        recentPlaysSub: 'Continue from where you left off',
        clearAll: 'Clear All',
        startListening: 'Start listening to build your history',
        // Misc
        noNext: 'No next episode',
        noPrev: 'No previous episode',
        shuffleOn: 'Shuffle on',
        shuffleOff: 'Shuffle off',
        loopOn: 'Loop on',
        loopOff: 'Loop off'
    }
};

function t(key) {
    return translations[state.language][key] || key;
}

// Helper function to get display title based on language
function getPodcastTitle(podcast) {
    return state.language === 'zh'
        ? (podcast.titleZh || podcast.title)
        : podcast.title;
}

// ==================== Podcast RSS Feeds (Verified Working) ====================
// Only includes podcasts with confirmed working RSS feeds and real audio content
const defaultPodcasts = [
    // ========== 中文精选播客 (小宇宙FM) ==========
    {
        id: 'wantang-late-talk',
        title: '晚点聊 LateTalk',
        titleZh: '晚点聊 LateTalk',
        category: '科技',
        categoryZh: '科技',
        cover: '🎙️',
        coverUrl: './covers/wantang-latetalk.png',
        rss: 'https://www.xiaoyuzhoufm.com/podcast/61933ace1b4320461e91fd55/feed',
        externalUrl: 'https://www.xiaoyuzhoufm.com/podcast/61933ace1b4320461e91fd55',
        description: '由《晚点 LatePost》出品。最一手的科技访谈，最真实的从业者思考。聚焦科技、商业、创业创新领域，邀请创业者、投资人、行业从业者进行深度访谈。',
        descriptionZh: '由《晚点 LatePost》出品。最一手的科技访谈，最真实的从业者思考。聚焦科技、商业、创业创新领域，邀请创业者、投资人、行业从业者进行深度访谈。',
        isExternal: true
    },
    {
        id: 'zhang-jun-business',
        title: '张小珺Jùn｜商业访谈录',
        titleZh: '张小珺Jùn｜商业访谈录',
        category: '商业',
        categoryZh: '商业',
        cover: '💼',
        coverUrl: './covers/zhangxiaojun.png',
        rss: 'https://www.xiaoyuzhoufm.com/podcast/626b46ea9cbbf0451cf5a962/feed',
        externalUrl: 'https://www.xiaoyuzhoufm.com/podcast/626b46ea9cbbf0451cf5a962',
        description: '努力做中国最优质的科技、商业访谈。聚焦AI、科技巨头、风险投资、知名人物。',
        descriptionZh: '努力做中国最优质的科技、商业访谈。聚焦AI、科技巨头、风险投资、知名人物。',
        isExternal: true
    },
    {
        id: 'luo-yonghao-crossroad',
        title: '罗永浩的十字路口',
        titleZh: '罗永浩的十字路口',
        category: '人物',
        categoryZh: '人物',
        cover: '🎭',
        coverUrl: './covers/luoyonghao.png',
        rss: 'https://www.xiaoyuzhoufm.com/podcast/68981df29e7bcd326eb91d88/feed',
        externalUrl: 'https://www.xiaoyuzhoufm.com/podcast/68981df29e7bcd326eb91d88',
        description: '与时代浪潮中的人物展开深度对话。科技与人文领域深度播客，每集长达三到五个小时。',
        descriptionZh: '与时代浪潮中的人物展开深度对话。科技与人文领域深度播客，每集长达三到五个小时。',
        isExternal: true
    },
    {
        id: 'crossroad-ai',
        title: '十字路口Crossing',
        titleZh: '十字路口Crossing',
        category: 'AI',
        categoryZh: 'AI',
        cover: '🤖',
        coverUrl: './covers/crossroad.png',
        rss: 'https://www.xiaoyuzhoufm.com/podcast/60502e253c92d4f62c2a9577/feed',
        externalUrl: 'https://www.xiaoyuzhoufm.com/podcast/60502e253c92d4f62c2a9577',
        description: '聚焦于AI时代创业与变革的深度播客栏目。关注新一代AI技术浪潮带来的行业新变化和创业新机会。',
        descriptionZh: '聚焦于AI时代创业与变革的深度播客栏目。关注新一代AI技术浪潮带来的行业新变化和创业新机会。',
        isExternal: true
    },
    // ========== Verified International Podcasts ==========
    {
        id: 'ted-talks-daily',
        title: 'TED Talks Daily',
        titleZh: 'TED每日演讲',
        category: '科技',
        cover: '🎤',
        coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
        rss: 'https://feeds.feedburner.com/tedtalksaudio',
        description: 'Daily TED talks covering ideas worth spreading. Topics include technology, science, business, and more.',
        descriptionZh: '每日TED演讲，涵盖值得传播的思想。主题包括科技、科学、商业等。'
    },
    {
        id: 'npr-news-now',
        title: 'NPR News Now',
        titleZh: 'NPR实时新闻',
        category: '新闻',
        cover: '📰',
        coverUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=400&fit=crop',
        rss: 'https://feeds.npr.org/500005/podcast.xml',
        description: 'NPR\'s latest news updates throughout the day. Stay informed with the stories that matter.',
        descriptionZh: 'NPR每日最新新闻更新。随时了解重要新闻故事。'
    },
    {
        id: 'bbc-world-service',
        title: 'BBC World Service',
        titleZh: 'BBC国际频道',
        category: '新闻',
        cover: '🌍',
        coverUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop',
        rss: 'https://podcasts.files.bbci.co.uk/p02pc9tn.rss',
        description: 'Global news, stories and features from BBC World Service. Stay informed about world events.',
        descriptionZh: 'BBC全球新闻、故事和专题报道。了解世界大事。'
    },
    {
        id: 'freakonomics-radio',
        title: 'Freakonomics Radio',
        titleZh: '魔鬼经济学电台',
        category: '财经',
        cover: '💡',
        coverUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop',
        rss: 'https://feeds.simplecast.com/X9f7O0xK',
        description: 'Discover the hidden side of everything with economist Stephen J. Dubner. Learn about incentives, stats, and everyday economics.',
        descriptionZh: '与经济学家斯蒂芬·都伯纳一起探索万物的隐藏面。了解激励、统计数据和日常经济学。'
    },
    {
        id: 'huberman-lab',
        title: 'Huberman Lab',
        titleZh: '休伯曼实验室',
        category: '心理',
        cover: '🧠',
        coverUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop',
        rss: 'https://feeds.megaphone.fm/HSW8135226541',
        description: 'Neuroscientist Andrew Huberman discusses science-based tools for mastering the mind. Covering sleep, focus, and health.',
        descriptionZh: '神经科学家安德鲁·休伯曼讨论科学的大脑训练工具。涵盖睡眠、专注力和健康。'
    },
    {
        id: 'tech-news-weekly',
        title: 'Tech News Weekly',
        titleZh: '每周科技新闻',
        category: '科技',
        cover: '💻',
        coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
        rss: 'https://feeds.npr.org/1115935329/podcast.xml',
        description: 'Weekly technology news and insights. Stay updated on the latest in tech.',
        descriptionZh: '每周科技新闻和见解。了解最新科技动态。'
    },
    {
        id: 'science-vs',
        title: 'Science Vs',
        titleZh: '科学对对碰',
        category: '科技',
        cover: '🔬',
        coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop',
        rss: 'https://feeds.megaphone.fm/sciencevs',
        description: 'We put popular beliefs and claims to the test against science. Fun and informative.',
        descriptionZh: '我们用科学来验证流行观念和说法。既有趣味又有知识性。'
    },
    {
        id: 'how-i-built-this',
        title: 'How I Built This',
        titleZh: '我是如何做到的',
        category: '励志',
        cover: '💪',
        coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=400&fit=crop',
        rss: 'https://feeds.megaphone.fm/howibuiltthis',
        description: 'Inspiring stories of entrepreneurs and achievers. Get motivated to pursue your dreams.',
        descriptionZh: '企业家和成功者的励志故事。激励你追求梦想。'
    },
    {
        id: 'hidden-brain',
        title: 'Hidden Brain',
        titleZh: '隐秘大脑',
        category: '心理',
        cover: '🔮',
        coverUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop',
        rss: 'https://feeds.npr.org/510312/podcast.xml',
        description: 'Hidden Brain helps curious people understand themselves and the world better through behavioral science.',
        descriptionZh: '通过行为科学帮助好奇心强的人更好地了解自己和世界。'
    },
    {
        id: 'the-daily',
        title: 'The Daily',
        titleZh: '每日新闻',
        category: '新闻',
        cover: '📓',
        coverUrl: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=400&h=400&fit=crop',
        rss: 'https://feeds.simplecast.com/54nBQc31',
        description: 'This is what the news should sound like. The biggest stories of our time, told by the best journalists.',
        descriptionZh: '这才是新闻应有的样子。由最优秀的记者讲述我们时代最重要的故事。'
    },
    {
        id: 'stuff-you-should-know',
        title: 'Stuff You Should Know',
        titleZh: '你该知道的',
        category: '科技',
        cover: '💭',
        coverUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=400&fit=crop',
        rss: 'https://feeds.megaphone.fm/SYSK_selects',
        description: 'Josh and Chuck dig into the topics you\'ve always wanted to know about.',
        descriptionZh: '乔希和查克深入探讨你一直想了解的话题。'
    },
    {
        id: 'bbc-business-daily',
        title: 'BBC Business Daily',
        titleZh: 'BBC商业每日',
        category: '财经',
        cover: '📈',
        coverUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop',
        rss: 'https://podcasts.files.bbci.co.uk/p08s8r4b.rss',
        description: 'Daily business news and market updates from BBC. Essential listening for business professionals.',
        descriptionZh: 'BBC每日商业新闻和市场动态。商务人士的必听内容。'
    },
    {
        id: 'tim-ferriss',
        title: 'The Tim Ferriss Show',
        titleZh: '蒂姆·费里斯秀',
        category: '励志',
        cover: '🌟',
        coverUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=400&fit=crop',
        rss: 'https://feeds.simplecast.com/Xj6FNIuc',
        description: 'Tim Ferriss interviews world-class performers to deconstruct their success.',
        descriptionZh: '蒂姆·费里斯采访世界级精英，解构他们的成功秘诀。'
    }
];

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Load podcasts
    state.podcasts = [...defaultPodcasts];
    loadUserData();

    // Apply dark mode
    if (state.isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '☀️';
    }

    // Apply language
    applyTranslations();

    // Render UI
    renderCategories();
    renderPodcasts();
    setupEventListeners();

    // Initialize audio
    setupAudio();
}

// ==================== Data Management ====================
function loadUserData() {
    const savedPodcasts = localStorage.getItem('podcastList');
    if (savedPodcasts) {
        try {
            const userPodcasts = JSON.parse(savedPodcasts);
            state.podcasts = [...defaultPodcasts, ...userPodcasts.filter(p => !defaultPodcasts.find(d => d.id === p.id))];
        } catch (e) {
            console.error('Error loading user podcasts:', e);
        }
    }
}

function saveUserData() {
    const userPodcasts = state.podcasts.filter(p => !defaultPodcasts.find(d => d.id === p.id));
    localStorage.setItem('podcastList', JSON.stringify(userPodcasts));
    localStorage.setItem('podcastFavorites', JSON.stringify(state.favorites));
    localStorage.setItem('podcastHistory', JSON.stringify(state.history));
    localStorage.setItem('podcastDarkMode', state.isDarkMode);
}

// ==================== Audio Setup ====================
function setupAudio() {
    state.audio.volume = state.volume;
    state.audio.playbackRate = state.speed;

    state.audio.addEventListener('timeupdate', updateProgress);
    state.audio.addEventListener('ended', handleAudioEnded);
    state.audio.addEventListener('loadedmetadata', () => {
        document.getElementById('duration').textContent = formatTime(state.audio.duration);
    });
    state.audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        showToast('Audio playback error. Please try another episode.');
    });
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => selectCategory(card.dataset.category));
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Language toggle
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);

    // Search
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));

    // Player controls
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    document.getElementById('prevBtn').addEventListener('click', playPrevious);
    document.getElementById('nextBtn').addEventListener('click', playNext);
    document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
    document.getElementById('loopBtn').addEventListener('click', toggleLoop);
    document.getElementById('progressBar').addEventListener('click', seekAudio);
    document.getElementById('speedBtn').addEventListener('click', cycleSpeed);
    document.getElementById('volumeBtn').addEventListener('click', toggleMute);
    document.getElementById('volumeSlider').addEventListener('input', handleVolumeChange);
    document.getElementById('volumeSlider').value = state.volume;
    document.getElementById('timerBtn').addEventListener('click', showTimerModal);

    // Timer options
    document.querySelectorAll('.timer-option').forEach(btn => {
        btn.addEventListener('click', () => setSleepTimer(parseInt(btn.dataset.minutes)));
    });

    // Add RSS modal
    document.getElementById('addRssBtn').addEventListener('click', addCustomRss);

    // Clear history
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Modal close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('visible');
            }
        });
    });
}

// ==================== Rendering ====================
function renderCategories() {
    const categoryData = [
        { key: 'all', name: '全部', icon: '✨' },
        { key: 'chinese', name: '中文精选', icon: '🇨🇳' },
        { key: '科技', name: '科技', icon: '🚀' },
        { key: '新闻', name: '新闻', icon: '📰' },
        { key: '财经', name: '财经', icon: '💰' },
        { key: '心理', name: '心理', icon: '🧠' },
        { key: '励志', name: '励志', icon: '💪' },
        { key: '治愈', name: '治愈', icon: '💚' }
    ];

    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = categoryData.map(cat => `
        <div class="category-card ${state.currentCategory === cat.key ? 'active' : ''}" data-category="${cat.key}">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
        </div>
    `).join('');

    // Reattach event listeners
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => selectCategory(card.dataset.category));
    });
}

function renderPodcasts(category = 'all') {
    const grid = document.getElementById('podcastGrid');
    let filtered;
    if (category === 'all') {
        filtered = state.podcasts;
    } else if (category === 'chinese') {
        // 中文精选 - 过滤 isExternal 为 true 的播客
        filtered = state.podcasts.filter(p => p.isExternal === true);
    } else {
        filtered = state.podcasts.filter(p => p.category === category);
    }

    if (filtered.length === 0) {
        const noPodcasts = state.language === 'zh' ? '该分类暂无播客' : 'No podcasts in this category yet.';
        grid.innerHTML = `<div class="empty-state"><p>${noPodcasts}</p></div>`;
        return;
    }

    grid.innerHTML = filtered.map(podcast => `
        <div class="podcast-card" data-podcast-id="${podcast.id}">
            <div class="podcast-cover">
                <img src="${podcast.coverUrl || ''}" alt="${getPodcastTitle(podcast)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span class="podcast-emoji" style="display:none;">${podcast.cover}</span>
                <div class="play-overlay" data-podcast-id="${podcast.id}">
                    <div class="play-icon">▶️</div>
                </div>
            </div>
            <div class="podcast-info">
                <h3 class="podcast-title">${getPodcastTitle(podcast)}</h3>
                <div class="podcast-meta">
                    <span class="podcast-category-tag">${podcast.category}</span>
                    <span>${isFavorite(podcast.id) ? '❤️' : '🤍'}</span>
                </div>
            </div>
            <div class="podcast-actions">
                <button class="podcast-action-btn ${isFavorite(podcast.id) ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleFavorite('${podcast.id}')">
                    ${isFavorite(podcast.id) ? '❤️' : '🤍'} ${state.language === 'zh' ? '收藏' : 'Favorite'}
                </button>
                <button class="podcast-action-btn" onclick="event.stopPropagation(); playPodcast('${podcast.id}')">
                    ▶️ ${state.language === 'zh' ? '播放' : 'Play'}
                </button>
            </div>
        </div>
    `).join('');

    // Add click handlers for play overlay (direct play/jump)
    grid.querySelectorAll('.play-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            const podcastId = overlay.dataset.podcastId;
            playPodcast(podcastId);
        });
    });

    // Add click handlers for card (open detail) - but not for external podcasts
    grid.querySelectorAll('.podcast-card').forEach(card => {
        card.addEventListener('click', () => {
            const podcast = state.podcasts.find(p => p.id === card.dataset.podcastId);
            if (podcast && podcast.isExternal) {
                playPodcast(card.dataset.podcastId);
            } else {
                showPodcastDetail(card.dataset.podcastId);
            }
        });
    });
}

function renderLibrary() {
    const grid = document.getElementById('libraryGrid');
    const favPodcasts = state.podcasts.filter(p => state.favorites.includes(p.id));

    if (favPodcasts.length === 0) {
        grid.innerHTML = '';
        const favEmptyTitle = document.getElementById('libraryEmptyTitle');
        const favEmptyText = document.getElementById('libraryEmptyText');
        if (favEmptyTitle) favEmptyTitle.textContent = state.language === 'zh' ? '暂无收藏' : 'No favorites yet';
        if (favEmptyText) favEmptyText.textContent = state.language === 'zh' ? '开始探索，添加你喜欢的播客' : 'Start exploring and add podcasts you love';
        document.getElementById('libraryEmpty').style.display = 'flex';
        return;
    }

    document.getElementById('libraryEmpty').style.display = 'none';
    grid.innerHTML = favPodcasts.map(podcast => `
        <div class="podcast-card" data-podcast-id="${podcast.id}">
            <div class="podcast-cover">
                <img src="${podcast.coverUrl || ''}" alt="${getPodcastTitle(podcast)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span class="podcast-emoji" style="display:none;">${podcast.cover}</span>
                <div class="play-overlay" data-podcast-id="${podcast.id}">
                    <div class="play-icon">▶️</div>
                </div>
            </div>
            <div class="podcast-info">
                <h3 class="podcast-title">${getPodcastTitle(podcast)}</h3>
                <div class="podcast-meta">
                    <span class="podcast-category-tag">${podcast.category}</span>
                    <span>❤️</span>
                </div>
            </div>
            <div class="podcast-actions">
                <button class="podcast-action-btn favorited" onclick="event.stopPropagation(); toggleFavorite('${podcast.id}')">
                    ❤️ ${state.language === 'zh' ? '已收藏' : 'Favorited'}
                </button>
                <button class="podcast-action-btn" onclick="event.stopPropagation(); playPodcast('${podcast.id}')">
                    ▶️ ${state.language === 'zh' ? '播放' : 'Play'}
                </button>
            </div>
        </div>
    `).join('');

    // Add click handlers for play overlay (direct play/jump)
    grid.querySelectorAll('.play-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            const podcastId = overlay.dataset.podcastId;
            playPodcast(podcastId);
        });
    });

    // Add click handlers for card (open detail) - but not for external podcasts
    grid.querySelectorAll('.podcast-card').forEach(card => {
        card.addEventListener('click', () => {
            const podcast = state.podcasts.find(p => p.id === card.dataset.podcastId);
            if (podcast && podcast.isExternal) {
                playPodcast(card.dataset.podcastId);
            } else {
                showPodcastDetail(card.dataset.podcastId);
            }
        });
    });
}

function renderHistory() {
    const list = document.getElementById('historyList');
    const emptyMsg = state.language === 'zh' ? '暂无历史记录' : 'No listening history yet.';

    if (state.history.length === 0) {
        list.innerHTML = '';
        document.getElementById('historyEmpty').style.display = 'flex';
        return;
    }

    document.getElementById('historyEmpty').style.display = 'none';
    list.innerHTML = state.history.map((item, index) => `
        <div class="episode-item ${state.currentEpisode?.id === item.id ? 'playing' : ''}" onclick="playFromHistory(${index})">
            <button class="episode-play-btn">${state.currentEpisode?.id === item.id && state.isPlaying ? '⏸️' : '▶️'}</button>
            <div class="episode-info">
                <div class="episode-title">${item.title}</div>
                <div class="episode-date">${item.podcastTitle} • ${formatDate(item.playedAt)}</div>
            </div>
            <span class="episode-duration">${item.duration || '-'}</span>
        </div>
    `).join('');
}

// ==================== Refresh Functionality ====================
async function refreshAllPodcasts() {
    const refreshing = state.language === 'zh' ? '正在刷新所有播客...' : 'Refreshing all podcasts...';
    const refreshed = state.language === 'zh' ? '刷新完成！' : 'All podcasts refreshed!';

    showToast(refreshing);

    // Clear all episode caches
    state.podcasts.forEach(podcast => {
        const cacheKey = `episodes_${podcast.id}`;
        localStorage.removeItem(cacheKey);
    });

    // Refresh current view
    selectCategory(state.currentCategory);
    showToast(refreshed);
}

function isNewEpisode(pubDate) {
    if (!pubDate) return false;
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (now - new Date(pubDate).getTime()) < sevenDays;
}

// ==================== Podcast Detail ====================
async function showPodcastDetail(podcastId) {
    const podcast = state.podcasts.find(p => p.id === podcastId);
    if (!podcast) return;

    state.currentPodcast = podcast;
    const displayTitle = state.language === 'zh'
        ? (podcast.titleZh || podcast.title)
        : podcast.title;
    document.getElementById('detailPodcastTitle').textContent = displayTitle;
    document.getElementById('episodeList').innerHTML = '';
    document.getElementById('episodeLoading').style.display = 'flex';
    document.getElementById('podcastDetailModal').classList.add('visible');

    try {
        const episodes = await fetchEpisodes(podcast);
        document.getElementById('episodeLoading').style.display = 'none';

        if (episodes.length === 0) {
            // Use demo episodes if RSS fetch fails
            const demoEpisodes = generateDemoEpisodes(podcast);
            renderEpisodes(demoEpisodes, podcast);
        } else {
            renderEpisodes(episodes, podcast);
        }
    } catch (error) {
        console.error('Error loading episodes:', error);
        document.getElementById('episodeLoading').style.display = 'none';
        const demoEpisodes = generateDemoEpisodes(podcast);
        renderEpisodes(demoEpisodes, podcast);
    }
}

function generateDemoEpisodes(podcast) {
    // Generate demo episodes with direct playable audio URLs
    const podcastTitle = state.language === 'zh'
        ? (podcast.titleZh || podcast.title)
        : podcast.title;
    const episodeLabel = state.language === 'zh' ? '第1集' : 'Episode 1';
    const episodeLabel2 = state.language === 'zh' ? '第2集' : 'Episode 2';
    const episodeLabel3 = state.language === 'zh' ? '第3集' : 'Episode 3';

    const demoEpisodes = [
        {
            id: `${podcast.id}-ep1`,
            title: `${podcastTitle} - ${episodeLabel}`,
            audioUrl: getDemoAudioUrl(podcast.id),
            duration: '45 min',
            date: new Date().toLocaleDateString()
        },
        {
            id: `${podcast.id}-ep2`,
            title: `${podcastTitle} - ${episodeLabel2}`,
            audioUrl: getDemoAudioUrl(podcast.id),
            duration: '38 min',
            date: new Date(Date.now() - 86400000).toLocaleDateString()
        },
        {
            id: `${podcast.id}-ep3`,
            title: `${podcastTitle} - ${episodeLabel3}`,
            audioUrl: getDemoAudioUrl(podcast.id),
            duration: '52 min',
            date: new Date(Date.now() - 172800000).toLocaleDateString()
        }
    ];
    return demoEpisodes;
}

function getDemoAudioUrl(podcastId) {
    // Reliable public domain audio for testing
    const audioSources = [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    ];
    return audioSources[Math.abs(hashCode(podcastId)) % audioSources.length];
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function renderEpisodes(episodes, podcast) {
    const unknownDate = state.language === 'zh' ? '未知日期' : 'Unknown date';
    const newBadge = state.language === 'zh' ? '新' : 'NEW';

    document.getElementById('episodeList').innerHTML = episodes.map((ep, index) => `
        <div class="episode-item ${state.currentEpisode?.id === ep.id ? 'playing' : ''}" onclick="playEpisodeById('${podcast.id}', '${ep.id}', ${JSON.stringify(ep).replace(/"/g, '&quot;')})">
            <button class="episode-play-btn">${state.currentEpisode?.id === ep.id && state.isPlaying ? '⏸️' : '▶️'}</button>
            <div class="episode-info">
                <div class="episode-title">
                    ${ep.title}
                    ${ep.isNew ? `<span class="episode-new-badge">${newBadge}</span>` : ''}
                </div>
                <div class="episode-date">${ep.date || unknownDate}</div>
            </div>
            <span class="episode-duration">${ep.duration || '-'}</span>
        </div>
    `).join('');

    // Also set up the about content
    renderAboutContent(podcast);
}

// ==================== Tab Switching ====================
function switchDetailTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    // Show/hide content
    document.getElementById('episodeList').style.display = tab === 'episodes' ? 'block' : 'none';
    document.getElementById('aboutContent').style.display = tab === 'about' ? 'block' : 'none';
}

function renderAboutContent(podcast) {
    const aboutPodcast = document.getElementById('aboutPodcast');
    if (!podcast) {
        aboutPodcast.innerHTML = `<p>${state.language === 'zh' ? '暂无信息' : 'No information available.'}</p>`;
        return;
    }

    // Get description based on current language
    const description = state.language === 'zh'
        ? (podcast.descriptionZh || podcast.description || '暂无简介')
        : (podcast.description || 'No description available.');

    // Build about HTML with podcast details
    aboutPodcast.innerHTML = `
        <div class="about-header">
            <img src="${podcast.coverUrl || ''}" alt="${getPodcastTitle(podcast)}" class="about-cover" onerror="this.style.display='none'">
            <div class="about-emoji" style="${podcast.coverUrl ? 'display:none' : ''}">${podcast.cover || '🎙️'}</div>
            <div class="about-info">
                <h3 class="about-title">${getPodcastTitle(podcast)}</h3>
                <span class="about-category-tag">${podcast.category || '其他'}</span>
            </div>
        </div>
        <div class="about-description">
            <h4>${state.language === 'zh' ? '简介' : 'About'}</h4>
            <p>${description}</p>
        </div>
        <div class="about-meta">
            <div class="about-meta-item">
                <span class="meta-label">${state.language === 'zh' ? 'RSS订阅' : 'RSS Feed'}</span>
                <span class="meta-value">${podcast.rss || '-'}</span>
            </div>
            <div class="about-meta-item">
                <span class="meta-label">${state.language === 'zh' ? '分类' : 'Category'}</span>
                <span class="meta-value">${podcast.category || '-'}</span>
            </div>
        </div>
    `;
}

async function fetchEpisodes(podcast) {
    if (!podcast.rss) return [];

    // Check cache first (cache episodes for 15 minutes to reduce API calls)
    const cacheKey = `episodes_${podcast.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { episodes, timestamp } = JSON.parse(cached);
            // Use cache if less than 15 minutes old
            if (Date.now() - timestamp < 15 * 60 * 1000) {
                return episodes;
            }
        } catch (e) {}
    }

    // Use rss2json API - reliable, CORS-free, and returns parsed data
    const rss2jsonApi = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(podcast.rss)}`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(rss2jsonApi, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) return [];

        const data = await response.json();
        if (data.status !== 'ok' || !data.items || data.items.length === 0) {
            return [];
        }

        // Deduplicate by audioUrl - some podcasts share feeds
        const seenUrls = new Set();
        const episodes = data.items.slice(0, 100)
            .map((item, index) => ({
                id: `${podcast.id}-${index}-${Date.now()}`,
                title: item.title || `Episode ${index + 1}`,
                audioUrl: item.enclosure?.link || '',
                duration: formatDuration(item.itunes?.duration || item.enclosure?.duration || 0),
                date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : '',
                pubDate: item.pubDate ? new Date(item.pubDate) : null,
                isNew: item.pubDate && (Date.now() - new Date(item.pubDate).getTime() < 7 * 24 * 60 * 60 * 1000) // New if < 7 days old
            }))
            .filter(ep => {
                // Deduplicate by audio URL
                if (!ep.audioUrl || !ep.audioUrl.includes('.')) return false;
                if (seenUrls.has(ep.audioUrl)) return false;
                seenUrls.add(ep.audioUrl);
                return true;
            })
            .slice(0, 50);

        // Cache the results
        try {
            localStorage.setItem(cacheKey, JSON.stringify({ episodes, timestamp: Date.now() }));
        } catch (e) {}

        return episodes;
    } catch (error) {
        console.warn('rss2json failed:', error);
        return [];
    }
}

function formatDuration(duration) {
    if (!duration) return '-';
    // If it's a number (seconds), convert to MM:SS or HH:MM:SS
    if (typeof duration === 'number') {
        const hrs = Math.floor(duration / 3600);
        const mins = Math.floor((duration % 3600) / 60);
        const secs = Math.floor(duration % 60);
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    // If it's a string
    if (typeof duration === 'string') {
        // If it's all digits, treat as seconds
        if (/^\d+$/.test(duration)) {
            const secs = parseInt(duration);
            const hrs = Math.floor(secs / 3600);
            const mins = Math.floor((secs % 3600) / 60);
            if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
            return `${mins}:${(secs % 60).toString().padStart(2, '0')}`;
        }
        // Otherwise return as-is (e.g., "1:30:00" or "01:30:00")
        return duration;
    }
    return '-';
}

function parseRSS(xmlText, podcast) {
    try {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');

        const items = xml.querySelectorAll('item');
        if (items.length === 0) return [];

        const episodes = [];
        items.forEach((item, index) => {
            const title = item.querySelector('title')?.textContent || `Episode ${index + 1}`;
            const enclosure = item.querySelector('enclosure');
            let audioUrl = enclosure?.getAttribute('url') || '';

            // Skip if no audio URL
            if (!audioUrl) return;

            // Skip non-audio URLs
            if (!audioUrl.match(/\.(mp3|m4a|ogg|wav)(\?|$)/i)) return;

            const duration = item.querySelector('duration')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';

            episodes.push({
                id: `${podcast.id}-${index}`,
                title,
                audioUrl,
                duration: formatDuration(duration),
                date: pubDate ? new Date(pubDate).toLocaleDateString() : ''
            });
        });

        return episodes.slice(0, 20); // Limit to 20 episodes
    } catch (error) {
        console.error('RSS parsing error:', error);
        return [];
    }
}

// ==================== Playback ====================
async function playPodcast(podcastId) {
    const podcast = state.podcasts.find(p => p.id === podcastId);
    if (!podcast) return;

    // External podcasts (Chinese podcasts) - open in new tab directly
    if (podcast.isExternal && podcast.externalUrl) {
        window.open(podcast.externalUrl, '_blank');
        return;
    }

    // Show loading
    const loading = state.language === 'zh' ? '正在加载...' : 'Loading episodes...';
    showToast(loading);

    // Fetch real episodes from RSS
    const episodes = await fetchEpisodes(podcast);

    if (episodes.length > 0) {
        // Play first real episode with the episode list
        playEpisodeObject(podcast, episodes[0], episodes);
        const nowPlaying = state.language === 'zh' ? '正在播放: ' : 'Now playing: ';
        showToast(`${nowPlaying}${episodes[0].title}`);
    } else {
        const noEpisodes = state.language === 'zh' ? '暂无节目，请尝试其他播客' : 'No episodes available. Try another podcast.';
        showToast(noEpisodes);
    }
}

function playEpisodeById(podcastId, episodeId, episodeData) {
    const podcast = state.podcasts.find(p => p.id === podcastId);
    if (!podcast) return;
    // Pass the current episode list if available
    const episodeList = state.currentEpisodeList.length > 0 ? state.currentEpisodeList : null;
    playEpisodeObject(podcast, episodeData, episodeList);
}

function playEpisodeObject(podcast, episode, episodeList = null) {
    state.currentEpisode = episode;
    state.currentPodcast = podcast;

    // Set up episode queue if provided
    if (episodeList) {
        state.currentEpisodeList = episodeList;
        state.currentEpisodeIndex = episodeList.findIndex(ep => ep.id === episode.id);
    }

    state.audio.src = episode.audioUrl;
    state.audio.play().catch(err => {
        console.error('Playback error:', err);
        showToast(state.language === 'zh' ? '播放错误，请重试' : 'Playback error. Please try again.');
    });

    state.isPlaying = true;
    updatePlayerUI();
    addToHistory(episode, podcast);

    document.getElementById('playerBar').classList.add('visible');
}

function playFromHistory(index) {
    const item = state.history[index];
    const podcast = state.podcasts.find(p => p.title === item.podcastTitle);
    if (podcast && item.audioUrl) {
        playEpisodeObject(podcast, item);
    } else {
        showToast('Episode no longer available');
    }
}

function togglePlayPause() {
    if (!state.currentEpisode) {
        const selectEpisode = state.language === 'zh' ? '请选择要播放的节目' : 'Select an episode to play';
        showToast(selectEpisode);
        return;
    }

    if (state.isPlaying) {
        state.audio.pause();
    } else {
        state.audio.play();
    }
    state.isPlaying = !state.isPlaying;
    updatePlayerUI();
}

function playNext() {
    const noNext = state.language === 'zh' ? '没有下一首了' : 'No next episode';

    if (state.playMode === 'shuffle') {
        // Random mode: pick a random episode
        if (state.currentEpisodeList.length > 1) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * state.currentEpisodeList.length);
            } while (randomIndex === state.currentEpisodeIndex && state.currentEpisodeList.length > 1);
            const nextEpisode = state.currentEpisodeList[randomIndex];
            playEpisodeObject(state.currentPodcast, nextEpisode, state.currentEpisodeList);
        } else {
            showToast(noNext);
        }
        return;
    }

    // Normal mode: play next in order
    if (state.currentEpisodeIndex < state.currentEpisodeList.length - 1) {
        state.currentEpisodeIndex++;
        const nextEpisode = state.currentEpisodeList[state.currentEpisodeIndex];
        playEpisodeObject(state.currentPodcast, nextEpisode, state.currentEpisodeList);
    } else {
        showToast(noNext);
    }
}

function playPrevious() {
    const noPrev = state.language === 'zh' ? '没有上一首了' : 'No previous episode';

    // If current time > 3 seconds, restart current episode
    if (state.audio.currentTime > 3) {
        state.audio.currentTime = 0;
        return;
    }

    // Otherwise go to previous episode
    if (state.currentEpisodeIndex > 0) {
        state.currentEpisodeIndex--;
        const prevEpisode = state.currentEpisodeList[state.currentEpisodeIndex];
        playEpisodeObject(state.currentPodcast, prevEpisode, state.currentEpisodeList);
    } else {
        showToast(noPrev);
    }
}

function handleAudioEnded() {
    if (state.playMode === 'loop' && state.currentEpisode) {
        state.audio.currentTime = 0;
        state.audio.play();
        return;
    }

    // Auto-play next episode if available
    if (state.currentEpisodeIndex < state.currentEpisodeList.length - 1) {
        playNext();
    } else {
        const finished = state.language === 'zh' ? '播放结束' : 'Episode finished';
        showToast(finished);
    }
}

// ==================== Player UI ====================
function updatePlayerUI() {
    const playBtn = document.getElementById('playPauseBtn');
    playBtn.textContent = state.isPlaying ? '⏸️' : '▶️';

    if (state.currentEpisode && state.currentPodcast) {
        document.getElementById('playerTitle').textContent = state.currentEpisode.title;
        document.getElementById('playerEpisode').textContent = getPodcastTitle(state.currentPodcast);
        document.getElementById('playerCover').textContent = state.currentPodcast.cover;
    }

    document.getElementById('speedBtn').textContent = `${state.speed}x`;
    document.getElementById('shuffleBtn').style.opacity = state.playMode === 'shuffle' ? '1' : '0.5';
    document.getElementById('loopBtn').style.opacity = state.playMode === 'loop' ? '1' : '0.5';
}

function updateProgress() {
    if (!state.audio.duration || isNaN(state.audio.duration)) return;

    const current = state.audio.currentTime;
    const duration = state.audio.duration;
    const percent = (current / duration) * 100;

    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('currentTime').textContent = formatTime(current);
    document.getElementById('duration').textContent = formatTime(duration);
}

function seekAudio(e) {
    const bar = document.getElementById('progressBar');
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    state.audio.currentTime = percent * state.audio.duration;
}

// ==================== Playback Controls ====================
function toggleShuffle() {
    state.playMode = state.playMode === 'shuffle' ? 'order' : 'shuffle';
    updatePlayerUI();
    const shuffleOn = state.language === 'zh' ? '随机播放已开启' : 'Shuffle on';
    const shuffleOff = state.language === 'zh' ? '随机播放已关闭' : 'Shuffle off';
    showToast(state.playMode === 'shuffle' ? shuffleOn : shuffleOff);
}

function toggleLoop() {
    state.playMode = state.playMode === 'loop' ? 'order' : 'loop';
    updatePlayerUI();
    const loopOn = state.language === 'zh' ? '循环播放已开启' : 'Loop on';
    const loopOff = state.language === 'zh' ? '循环播放已关闭' : 'Loop off';
    showToast(state.playMode === 'loop' ? loopOn : loopOff);
}

function cycleSpeed() {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(state.speed);
    state.speed = speeds[(currentIndex + 1) % speeds.length];
    state.audio.playbackRate = state.speed;
    localStorage.setItem('podcastSpeed', state.speed);
    updatePlayerUI();
    showToast(`Speed: ${state.speed}x`);
}

function toggleMute() {
    if (state.audio.volume > 0) {
        state.prevVolume = state.audio.volume;
        state.audio.volume = 0;
        document.getElementById('volumeBtn').textContent = '🔇';
        document.getElementById('volumeSlider').value = 0;
    } else {
        state.audio.volume = state.prevVolume || state.volume;
        document.getElementById('volumeBtn').textContent = '🔊';
        document.getElementById('volumeSlider').value = state.audio.volume;
    }
}

function handleVolumeChange(e) {
    const volume = parseFloat(e.target.value);
    state.audio.volume = volume;
    state.volume = volume;
    localStorage.setItem('podcastVolume', volume);
    document.getElementById('volumeBtn').textContent = volume === 0 ? '🔇' : '🔊';
}

// ==================== Timer ====================
function showTimerModal() {
    document.getElementById('timerModal').classList.add('visible');
}

function closeTimerModal() {
    document.getElementById('timerModal').classList.remove('visible');
}

function setSleepTimer(minutes) {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    state.timerMinutes = minutes;
    state.timerRemaining = minutes * 60;

    if (minutes === 0) {
        showToast('Sleep timer turned off');
        closeTimerModal();
        return;
    }

    state.timerInterval = setInterval(() => {
        state.timerRemaining--;
        if (state.timerRemaining <= 0) {
            state.audio.pause();
            state.isPlaying = false;
            updatePlayerUI();
            showToast('Sleep timer: playback stopped');
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }, 1000);

    showToast(`Sleep timer set for ${minutes} minutes`);
    closeTimerModal();
}

// ==================== Favorites & History ====================
function toggleFavorite(podcastId) {
    const index = state.favorites.indexOf(podcastId);
    if (index === -1) {
        state.favorites.push(podcastId);
        showToast('Added to favorites');
    } else {
        state.favorites.splice(index, 1);
        showToast('Removed from favorites');
    }
    saveUserData();
    renderPodcasts(state.currentCategory);
    renderLibrary();
}

function isFavorite(podcastId) {
    return state.favorites.includes(podcastId);
}

function addToHistory(episode, podcast) {
    // Remove if already exists
    state.history = state.history.filter(h => h.id !== episode.id);
    // Add to beginning
    state.history.unshift({
        id: episode.id,
        title: episode.title,
        audioUrl: episode.audioUrl,
        podcastTitle: getPodcastTitle(podcast),
        duration: episode.duration,
        playedAt: new Date().toISOString()
    });
    // Keep only last 50
    state.history = state.history.slice(0, 50);
    saveUserData();
}

function clearHistory() {
    state.history = [];
    saveUserData();
    renderHistory();
    showToast('History cleared');
}

// ==================== Search ====================
async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('searchResults');

    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }

    resultsContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';

    try {
        const results = await searchItunes(query);
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="empty-state"><p>No results found.</p></div>';
            return;
        }
        resultsContainer.innerHTML = results.map(podcast => `
            <div class="search-result-item" onclick="showPodcastDetail('${podcast.id}')">
                <div class="search-result-cover">${podcast.cover}</div>
                <div class="search-result-info">
                    <div class="search-result-title">${getPodcastTitle(podcast)}</div>
                    <div class="search-result-artist">${podcast.artist || (state.language === 'zh' ? '未知艺术家' : 'Unknown Artist')}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        resultsContainer.innerHTML = '<div class="empty-state"><p>Search failed. Try again.</p></div>';
    }
}

async function searchItunes(term) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=podcast&limit=20`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data.results.map((item, index) => ({
            id: `itunes-${item.collectionId || index}`,
            title: item.collectionName || item.trackName || 'Unknown',
            artist: item.artistName || 'Unknown',
            cover: item.artworkUrl600 || item.artworkUrl100 || '🎧',
            rss: item.feedUrl || '',
            category: '其他',
            description: item.description || '',
            sampleAudio: item.previewUrl || ''
        }));
    } catch (error) {
        console.error('iTunes search error:', error);
        return [];
    }
}

// ==================== Add RSS ====================
function showAddRssModal() {
    document.getElementById('addRssModal').classList.add('visible');
}

function closeAddRssModal() {
    document.getElementById('addRssModal').classList.remove('visible');
}

async function addCustomRss() {
    const url = document.getElementById('rssUrlInput').value.trim();
    const category = document.getElementById('rssCategoryInput').value;

    if (!url) {
        showToast('Please enter a RSS URL');
        return;
    }

    if (!url.startsWith('http')) {
        showToast('Please enter a valid URL starting with http:// or https://');
        return;
    }

    showToast('Adding podcast...');

    // Create podcast object
    const tempId = `custom-${Date.now()}`;
    const tempPodcast = {
        id: tempId,
        title: 'Loading...',
        category: category,
        cover: '🎙️',
        rss: url,
        description: 'Custom RSS feed'
    };

    state.podcasts.push(tempPodcast);
    renderPodcasts(state.currentCategory);

    // Try to fetch RSS title
    try {
        const episodes = await fetchEpisodes(tempPodcast);
        if (episodes.length > 0) {
            tempPodcast.title = episodes[0].title.split(' - ')[0] || 'Custom Podcast';
        } else {
            tempPodcast.title = 'Custom Podcast';
        }
    } catch (error) {
        tempPodcast.title = 'Custom Podcast';
    }

    saveUserData();
    renderPodcasts(state.currentCategory);
    closeAddRssModal();
    showToast('Podcast added successfully!');
}

// ==================== Navigation ====================
function switchView(view) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
    });

    // Show/hide sections
    document.getElementById('podcastSection').style.display = view === 'discover' ? 'block' : 'none';
    document.getElementById('librarySection').style.display = view === 'library' ? 'block' : 'none';
    document.getElementById('historySection').style.display = view === 'history' ? 'block' : 'none';

    if (view === 'library') {
        renderLibrary();
    } else if (view === 'history') {
        renderHistory();
    }
}

function selectCategory(category) {
    state.currentCategory = category;

    // Update category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.toggle('active', card.dataset.category === category);
    });

    // Update section title with translations
    const titles = {
        'all': { title: t('featured'), subtitle: t('featuredSub') },
        '科技': { title: state.language === 'zh' ? '科技' : 'Technology', subtitle: state.language === 'zh' ? '最新科技动态' : 'Latest tech news and insights' },
        '新闻': { title: state.language === 'zh' ? '新闻' : 'News', subtitle: state.language === 'zh' ? '了解时事动态' : 'Stay informed with top stories' },
        '财经': { title: state.language === 'zh' ? '财经' : 'Finance', subtitle: state.language === 'zh' ? '商业与市场' : 'Business and market coverage' },
        '心理': { title: state.language === 'zh' ? '心理' : 'Psychology', subtitle: state.language === 'zh' ? '探索人类心灵' : 'Understand the human mind' },
        '励志': { title: state.language === 'zh' ? '励志' : 'Motivation', subtitle: state.language === 'zh' ? '激励与成长' : 'Get inspired and motivated' },
        '治愈': { title: state.language === 'zh' ? '治愈' : 'Healing', subtitle: state.language === 'zh' ? '放松与平静' : 'Relax and find your peace' }
    };

    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    if (sectionTitle) sectionTitle.textContent = titles[category]?.title || t('featured');
    if (sectionSubtitle) sectionSubtitle.textContent = titles[category]?.subtitle || t('featuredSub');

    renderPodcasts(category);
}

// ==================== Dark Mode ====================
function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('dark-mode');
    document.getElementById('darkModeToggle').textContent = state.isDarkMode ? '☀️' : '🌙';
    saveUserData();
}

function toggleLanguage() {
    state.language = state.language === 'zh' ? 'en' : 'zh';
    localStorage.setItem('podcastLanguage', state.language);
    applyTranslations();
    showToast(state.language === 'zh' ? '已切换到中文' : 'Switched to English');
}

function applyTranslations() {
    const el = (selector) => document.querySelector(selector);
    const elId = (id) => document.getElementById(id);

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        const view = link.dataset.view;
        link.textContent = t(view);
    });

    // Update hero
    const heroTitle = el('.hero-title');
    if (heroTitle) heroTitle.innerHTML = `${t('heroTitle')}<span class="gradient-text">${t('heroTitleAccent')}</span>`;
    const heroSubtitle = el('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = t('heroSubtitle');
    const btnPrimary = el('.hero-actions .btn-primary');
    if (btnPrimary) btnPrimary.innerHTML = `🔍 ${t('searchPlaceholder')}`;
    const btnSecondary = el('.hero-actions .btn-secondary');
    if (btnSecondary) btnSecondary.innerHTML = `➕ ${t('addRss')}`;

    // Update section title
    const sectionTitle = elId('sectionTitle');
    if (sectionTitle) sectionTitle.textContent = t('featured');
    const sectionSubtitle = elId('sectionSubtitle');
    if (sectionSubtitle) sectionSubtitle.textContent = t('featuredSub');

    // Update categories
    document.querySelectorAll('.category-card').forEach(card => {
        const cat = card.dataset.category;
        const nameEl = card.querySelector('.category-name');
        if (nameEl) {
            if (cat === 'all') {
                nameEl.textContent = t('all');
            } else {
                nameEl.textContent = t(cat);
            }
        }
    });

    // Update search input placeholder
    const searchInput = elId('searchInput');
    if (searchInput) searchInput.placeholder = t('searchPlaceholder');

    // Update player
    const playerTitle = elId('playerTitle');
    if (playerTitle) playerTitle.textContent = t('nowPlaying');
    const timerBtn = elId('timerBtn');
    if (timerBtn) timerBtn.title = t('timer');

    // Update modal titles
    const sleepTimerTitleEl = elId('sleepTimerTitle');
    if (sleepTimerTitleEl) sleepTimerTitleEl.textContent = t('sleepTimer');

    // Update empty states
    const favEmpty = elId('libraryEmpty');
    if (favEmpty) {
        const p = favEmpty.querySelector('p');
        if (p) p.textContent = t('startExploring');
    }

    const histEmpty = elId('historyEmpty');
    if (histEmpty) {
        const p = histEmpty.querySelector('p');
        if (p) p.textContent = t('startListening');
    }

    // Update library section header
    const libraryTitle = elId('libraryTitle');
    if (libraryTitle) libraryTitle.textContent = t('myFavorites');
    const librarySubtitle = elId('librarySubtitle');
    if (librarySubtitle) librarySubtitle.textContent = t('myFavoritesSub');

    // Update history section header
    const historyTitle = elId('historyTitle');
    if (historyTitle) historyTitle.textContent = t('recentPlays');
    const historySubtitle = elId('historySubtitle');
    if (historySubtitle) historySubtitle.textContent = t('recentPlaysSub');
    const clearHistoryBtn = elId('clearHistoryBtn');
    if (clearHistoryBtn) clearHistoryBtn.textContent = t('clearAll');

    // Update episode tabs
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.dataset.tab === 'episodes') tab.textContent = t('episodes');
        if (tab.dataset.tab === 'about') tab.textContent = t('about');
    });

    // Re-render current view to update dynamic content
    const currentView = document.querySelector('.nav-link.active')?.dataset.view || 'discover';
    if (currentView === 'library') renderLibrary();
    if (currentView === 'history') renderHistory();
}

// ==================== Player Expand/Collapse ====================
function togglePlayerExpand() {
    const playerBar = document.getElementById('playerBar');
    playerBar.classList.toggle('collapsed');
}

// ==================== Modal Close ====================
function closePodcastDetailModal() {
    document.getElementById('podcastDetailModal').classList.remove('visible');
}

// ==================== Utilities ====================
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    const justNow = state.language === 'zh' ? '刚刚' : 'Just now';
    const minAgo = state.language === 'zh' ? '分钟前' : 'min ago';
    const hoursAgo = state.language === 'zh' ? '小时前' : 'hours ago';
    const daysAgo = state.language === 'zh' ? '天前' : 'days ago';

    if (diff < 60000) return justNow;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${minAgo}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${hoursAgo}`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ${daysAgo}`;
    return date.toLocaleDateString();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
