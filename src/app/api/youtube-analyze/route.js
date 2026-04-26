import { NextResponse } from 'next/server';
import { processTakeoutFromBuffer, processFileContents } from '../../../../scripts/process-youtube-takeout.js';

export async function POST(request) {
  try {
    console.log('API: Received request');
    
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    console.log('API: Files received:', files.length);
    files.forEach((f, i) => console.log(`API: File ${i}:`, f.name, f.size, f.type));
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    let parsedData;
    
    const firstFile = files[0];
    const isZip = firstFile.name.toLowerCase().endsWith('.zip') || firstFile.type === 'application/zip';
    
    if (isZip && files.length === 1) {
      // Process ZIP file in memory
      console.log('API: Processing ZIP file in memory...');
      const bytes = await firstFile.arrayBuffer();
      console.log('API: ZIP size:', bytes.byteLength);
      
      parsedData = await processTakeoutFromBuffer(bytes);
    } else {
      // Process individual files
      console.log('API: Processing individual files...');
      const fileContents = [];
      
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const content = new TextDecoder().decode(bytes);
        fileContents.push({ name: file.name, content });
        console.log('API: Read file:', file.name, 'size:', bytes.byteLength);
      }
      
      parsedData = processFileContents(fileContents);
    }
    
    console.log('API: Processing complete:', {
      watchHistory: parsedData.watchHistory.length,
      searchHistory: parsedData.searchHistory.length,
    });
    
    const analytics = processIntoAnalytics(parsedData);
    console.log('API: Analytics generated');
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Takeout processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process Takeout files: ' + error.message },
      { status: 500 }
    );
  }
}

function processIntoAnalytics(data) {
  const { watchHistory, searchHistory, subscriptions, playlists, comments } = data;
  
  const stats = {
    watchEvents: watchHistory.length,
    searchEvents: searchHistory.length,
    subscriptions: subscriptions.length,
    playlists: playlists.length,
    comments: comments.length,
  };

  if (stats.watchEvents === 0 && stats.searchEvents === 0) {
    return generateEmptyState();
  }

  const categories = categorizeContent(watchHistory);
  
  const channelCounts = {};
  watchHistory.forEach(entry => {
    const name = entry.channelName || 'Unknown';
    if (name) {
      channelCounts[name] = (channelCounts[name] || 0) + 1;
    }
  });
  
  const topChannels = Object.entries(channelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, watchCount]) => ({ name, watchCount }));

  const searchCounts = {};
  searchHistory.forEach(entry => {
    const query = entry.query.toLowerCase();
    if (query.length > 2) {
      searchCounts[query] = (searchCounts[query] || 0) + 1;
    }
  });
  
  const topSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([query, count]) => ({ query, count }));

  const summary = generateSummary(stats, categories);

  return {
    stats,
    categories,
    topChannels,
    topSearches,
    summary,
    rawData: {
      hasWatchHistory: watchHistory.length > 0,
      hasSearchHistory: searchHistory.length > 0,
      dateRange: getDateRange(watchHistory),
    },
  };
}

function generateEmptyState() {
  return {
    stats: { watchEvents: 0, searchEvents: 0, subscriptions: 0, playlists: 0, comments: 0 },
    categories: [{ id: 'none', label: 'No Data', color: '#57534e', percentage: 100, summary: 'No watch history found in your Takeout export' }],
    topChannels: [],
    topSearches: [],
    summary: 'No YouTube data was found in the uploaded files. Make sure you selected YouTube in your Google Takeout export.',
    rawData: { hasWatchHistory: false, hasSearchHistory: false, dateRange: null },
  };
}

function categorizeContent(watchHistory) {
  const categoryDefs = [
    { id: 'tech-productivity', label: 'Tech & Productivity', color: '#67c1b8', keywords: ['tech', 'review', 'code', 'programming', 'software', 'app', 'computer', 'laptop', 'phone', 'tutorial', 'learn', 'unbox', 'setup', 'build pc', 'gpu', 'cpu', 'apple', 'samsung', 'google', 'microsoft', 'android', 'ios', 'windows', 'linux'], summary: 'Your tool-focused learning lane' },
    { id: 'gaming', label: 'Gaming & Entertainment', color: '#f2a65a', keywords: ['game', 'gaming', 'playthrough', "let's play", 'minecraft', 'valorant', 'league', 'steam', 'gameplay', 'twitch', 'esports', 'fps', 'rpg', 'nintendo', 'playstation', 'xbox'], summary: 'The recreational and gaming content lane' },
    { id: 'science-learning', label: 'Science & Learning', color: '#8fb8de', keywords: ['science', 'physics', 'chemistry', 'math', 'documentary', 'history', 'nature', 'space', 'nasa', 'vsauce', 'kurzgesagt', 'veritasium', 'ted', 'education', 'learn'], summary: 'Curiosity and educational content' },
    { id: 'news-politics', label: 'News & Politics', color: '#d96459', keywords: ['news', 'politics', 'election', 'trump', 'biden', 'congress', 'parliament', 'government', 'cnn', 'fox', 'bbc', 'reuters'], summary: 'Current events and geopolitical content' },
    { id: 'creative', label: 'Creative & Design', color: '#d8c36a', keywords: ['design', 'art', 'creative', 'animation', 'illustrator', 'photoshop', 'music', 'audio', 'production', 'drawing', 'painting', '3d', 'blender', 'after effects'], summary: 'Creative skills and artistic content' },
  ];

  const categoryCounts = {};
  categoryDefs.forEach(cat => categoryCounts[cat.id] = 0);
  let uncategorized = 0;

  watchHistory.forEach(entry => {
    const title = (entry.videoTitle || '').toLowerCase();
    const channel = (entry.channelName || '').toLowerCase();
    const text = title + ' ' + channel;
    
    let matched = false;
    for (const cat of categoryDefs) {
      for (const keyword of cat.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          categoryCounts[cat.id]++;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    
    if (!matched) uncategorized++;
  });

  const total = watchHistory.length || 1;
  const categories = categoryDefs.map(cat => ({
    ...cat,
    percentage: Math.round((categoryCounts[cat.id] / total) * 100),
  }));

  categories.sort((a, b) => b.percentage - a.percentage);
  
  let otherPercent = 0;
  const categorized = categories.filter(cat => {
    if (cat.percentage < 5) {
      otherPercent += cat.percentage;
      return false;
    }
    return true;
  });

  if (otherPercent > 0 || uncategorized / total > 0.1) {
    categorized.push({
      id: 'other', label: 'Other', color: '#57534e',
      percentage: otherPercent + Math.round((uncategorized / total) * 100),
      summary: 'Content that does not fit the main categories',
    });
  }

  return categorized;
}

function generateSummary(stats, categories) {
  const topCategory = categories[0];
  const parts = [];
  
  if (stats.watchEvents > 0) {
    parts.push(`You have watched ${stats.watchEvents.toLocaleString()} videos${stats.searchEvents > 0 ? ` and made ${stats.searchEvents.toLocaleString()} searches` : ''}.`);
  }
  if (stats.subscriptions > 0) {
    parts.push(`You are subscribed to ${stats.subscriptions} channels${stats.playlists > 0 ? ` and have ${stats.playlists} playlists` : ''}.`);
  }
  if (topCategory && topCategory.percentage > 10) {
    parts.push(`Your most watched category is ${topCategory.label.toLowerCase()}.`);
  }
  if (stats.comments > 0) {
    parts.push(`You have left ${stats.comments} comments - engagement is real.`);
  }

  return parts.length > 0 ? parts.join(' ') : 'Your YouTube data reveals an eclectic mix of content preferences.';
}

function getDateRange(watchHistory) {
  if (watchHistory.length === 0) return null;
  const dates = watchHistory.map(entry => entry.date).filter(Boolean).sort();
  return dates.length > 0 ? { earliest: dates[0], latest: dates[dates.length - 1] } : null;
}