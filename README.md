# PodWave - Your Personal Podcast App

A beautiful and feature-rich podcast player that runs in your browser.

## Features

- **Browse by Category**: Healing, Motivation, Finance, News, Tech, Gaming, Psychology
- **Search iTunes**: Search and add podcasts from the iTunes podcast directory
- **Custom RSS**: Add any podcast via RSS feed URL
- **Multiple Play Modes**: Order, Shuffle, and Loop
- **Sleep Timer**: Auto-stop after 15/30/45/60/90 minutes
- **Playback Speed**: 0.5x to 2x
- **Favorites & History**: Save and track your listening
- **Dark Mode**: Easy on the eyes at night
- **Data Storage**: All data stored locally in your browser

## How to Use

### Option 1: Open Directly
Simply open `index.html` in your browser.

### Option 2: Deploy to Vercel (for sharing with others)

1. Create a GitHub account at https://github.com
2. Create a new repository named `podcast-site`
3. Upload these files to the repository:
   - `index.html`
   - `styles.css`
   - `app.js`
4. Go to https://vercel.com
5. Click "New Project"
6. Import your GitHub repository
7. Click "Deploy"

You'll get a URL like `https://your-podcast-site.vercel.app` that anyone can access!

## Adding Podcasts

### Via iTunes Search
1. Enter a search term (e.g., "TED Talks", "psychology")
2. Click the search button
3. Click "Add" on any result to add it to your library

### Via RSS URL
1. Click the "+" button
2. Enter the podcast's RSS feed URL
3. Select a category
4. Click "Add Podcast"

## Technical Notes

- Uses iTunes Search API for podcast discovery
- Uses CORS proxies (allorigins.win, corsproxy.io) to fetch RSS feeds
- All data stored in browser localStorage (no account needed)
- No backend required - fully static site

## License

MIT
