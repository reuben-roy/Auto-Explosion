import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Parse uploaded files
    const parsedData = await parseTakeoutFiles(files);
    
    // Process into analytics format
    const analytics = processIntoAnalytics(parsedData);
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Takeout processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process Takeout files: ' + error.message },
      { status: 500 }
    );
  }
}

async function parseTakeoutFiles(files) {
  const data = {
    watchHistory: [],
    searchHistory: [],
    subscriptions: [],
    playlists: [],
    comments: [],
  };

  for (const file of files) {
    const fileName = file.name || '';
    const content = await file.text();
    
    if (fileName.includes('watch-history.html') || fileName.includes('history/watch-history')) {
      data.watchHistory = parseWatchHistory(content);
    } else if (fileName.includes('search-history.html') || fileName.includes('history/search-history')) {
      data.searchHistory = parseSearchHistory(content);
    } else if (fileName.includes('subscriptions.csv') || fileName.includes('subscriptions/subscriptions')) {
      data.subscriptions = parseSubscriptions(content);
    } else if (fileName.includes('playlists.csv') || fileName.includes('playlists/playlists')) {
      data.playlists = parsePlaylists(content);
    } else if (fileName.includes('comments.csv') || fileName.includes('comments/comments')) {
      data.comments = parseComments(content);
    }
  }

  return data;
}

function parseWatchHistory(html) {
  const entries = [];
  // Parse the specific Google Takeout HTML format
  // Format: Watched <a href="...">Title</a><br><a href="...">Channel</a><br>Date
  
  const entryRegex = /Watched\s*<a href="([^"]+)">([^<]+)<\/a>\s*<br>\s*<a href="([^"]+)">([^<]+)<\/a>\s*<br>\s*([A-Za-z]{3}\s+\d{1,2},\s+\d{4},?\s+[\d:]+(?:AM|PM)?\s*(?:MST|UTC|PST|EST)?)/gi;
  
  let match;
  while ((match = entryRegex.exec(html)) !== null) {
    entries.push({
      videoUrl: match[1],
      videoTitle: decodeHTMLEntities(match[2].trim()),
      channelUrl: match[3],
      channelName: decodeHTMLEntities(match[4].trim()),
      date: parseTakeoutDate(match[5]),
    });
  }

  return entries;
}

function parseSearchHistory(html) {
  const entries = [];
  // Format: Searched for <a href="...">query</a><br>Date
  
  const entryRegex = /Searched for\s*<a href="[^"]+">([^<]+)<\/a>\s*<br>\s*([A-Za-z]{3}\s+\d{1,2},\s+\d{4},?\s+[\d:]+(?:AM|PM)?\s*(?:MST|UTC|PST|EST)?)/gi;
  
  let match;
  while ((match = entryRegex.exec(html)) !== null) {
    entries.push({
      query: decodeHTMLEntities(match[1].trim()),
      date: parseTakeoutDate(match[2]),
    });
  }

  return entries;
}

function parseSubscriptions(csv) {
  const lines = csv.split('\n').filter(line => line.trim());
  const subscriptions = [];
  
  // Skip header if present
  const startIdx = lines[0]?.toLowerCase().includes('channel') ? 1 : 0;
  
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 1) {
      subscriptions.push({
        name: parts[0].replace(/^"|"$/g, '').trim(),
        url: parts[1]?.replace(/^"|"$/g, '').trim() || '',
      });
    }
  }

  return subscriptions;
}

function parsePlaylists(csv) {
  const lines = csv.split('\n').filter(line => line.trim());
  const playlists = [];
  
  const startIdx = lines[0]?.toLowerCase().includes('playlist') ? 1 : 0;
  
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 1) {
      playlists.push({
        name: parts[0].replace(/^"|"$/g, '').trim(),
        videoCount: parseInt(parts[1]) || 0,
      });
    }
  }

  return playlists;
}

function parseComments(csv) {
  const lines = csv.split('\n').filter(line => line.trim());
  const comments = [];
  
  const startIdx = lines[0]?.toLowerCase().includes('comment') ? 1 : 0;
  
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 1) {
      comments.push({
        text: parts[0].replace(/^"|"$/g, '').trim(),
        videoTitle: parts[1]?.replace(/^"|"$/g, '').trim() || '',
        date: parts[2]?.replace(/^"|"$/g, '').trim() || '',
      });
    }
  }

  return comments;
}

function decodeHTMLEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };
  
  return text.replace(/&[^;]+;/g, match => entities[match] || match);
}

function parseTakeoutDate(dateStr) {
  try {
    // Handle formats like "Mar 4, 2012, 11:54:25 PM MST"
    const cleaned = dateStr.replace(/\s+/g, ' ').trim();
    return new Date(cleaned).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function processIntoAnalytics(data) {
  const { watchHistory, searchHistory, subscriptions, playlists, comments } = data;
  
  // Calculate stats
  const stats = {
    watchEvents: watchHistory.length,
    searchEvents: searchHistory.length,
    subscriptions: subscriptions.length,
    playlists: playlists.length,
    comments: comments.length,
  };

  // Categorize content by analyzing channel names and video titles
  const categories = categorizeContent(watchHistory);
  
  // Find top channels
  const channelCounts = {};
  watchHistory.forEach(entry => {
    const name = entry.channelName || 'Unknown';
    channelCounts[name] = (channelCounts[name] || 0) + 1;
  });
  
  const topChannels = Object.entries(channelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, watchCount]) => ({ name, watchCount }));

  // Top searches
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

  // Generate summary text
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

function categorizeContent(watchHistory) {
  // Category definitions with keywords
  const categoryDefs = [
    {
      id: 'tech-productivity',
      label: 'Tech & Productivity',
      color: '#67c1b8',
      keywords: ['tech', 'review', 'code', 'programming', 'software', 'app', 'computer', 'laptop', 'phone', 'tutorial', 'learn'],
      summary: 'Your tool-focused learning lane',
    },
    {
      id: 'gaming',
      label: 'Gaming & Entertainment',
      color: '#f2a65a',
      keywords: ['game', 'gaming', 'playthrough', 'let\'s play', 'minecraft', 'valorant', 'league', 'steam', 'gameplay'],
      summary: 'The recreational and gaming content lane',
    },
    {
      id: 'science-learning',
      label: 'Science & Learning',
      color: '#8fb8de',
      keywords: ['science', 'physics', 'chemistry', 'math', 'documentary', 'documentary', 'history', 'nature', 'space', 'nasa'],
      summary: 'Curiosity and educational content',
    },
    {
      id: 'news-politics',
      label: 'News & Politics',
      color: '#d96459',
      keywords: ['news', 'politics', 'election', 'trump', 'biden', 'congress', 'parliament', 'government'],
      summary: 'Current events and geopolitical content',
    },
    {
      id: 'creative',
      label: 'Creative & Design',
      color: '#d8c36a',
      keywords: ['design', 'art', 'creative', 'animation', 'illustrator', 'photoshop', 'music', 'audio', 'production'],
      summary: 'Creative skills and artistic content',
    },
  ];

  // Count watches per category
  const categoryCounts = {};
  categoryDefs.forEach(cat => categoryCounts[cat.id] = 0);

  watchHistory.forEach(entry => {
    const title = (entry.videoTitle || '').toLowerCase();
    const channel = (entry.channelName || '').toLowerCase();
    const text = title + ' ' + channel;

    for (const cat of categoryDefs) {
      for (const keyword of cat.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          categoryCounts[cat.id]++;
          break;
        }
      }
    }
  });

  // Calculate percentages
  const total = watchHistory.length || 1;
  const categories = categoryDefs.map(cat => ({
    ...cat,
    percentage: Math.round((categoryCounts[cat.id] / total) * 100),
  }));

  // Sort by percentage and redistribute "uncategorized" 
  categories.sort((a, b) => b.percentage - a.percentage);
  
  // Mark "Other" for anything under 5%
  let otherPercent = 0;
  const categorized = categories.filter(cat => {
    if (cat.percentage < 5) {
      otherPercent += cat.percentage;
      return false;
    }
    return true;
  });

  if (otherPercent > 0) {
    categorized.push({
      id: 'other',
      label: 'Other',
      color: '#57534e',
      percentage: otherPercent,
      summary: 'Content that doesn\'t fit the main categories',
    });
  }

  return categorized;
}

function generateSummary(stats, categories) {
  const topCategory = categories[0];
  
  const summaries = [
    `You've watched ${stats.watchEvents.toLocaleString()} videos and made ${stats.searchEvents.toLocaleString()} searches.`,
    `You're subscribed to ${stats.subscriptions} channels and have ${stats.playlists} playlists.`,
    `Your most watched category is ${topCategory?.label?.toLowerCase() || 'general content'}.`,
  ];

  if (stats.comments > 0) {
    summaries.push(`You've left ${stats.comments} comments — that's some community participation.`);
  }

  return summaries.join(' ');
}

function getDateRange(watchHistory) {
  if (watchHistory.length === 0) return null;
  
  const dates = watchHistory
    .map(entry => entry.date)
    .filter(Boolean)
    .sort();
  
  return {
    earliest: dates[0],
    latest: dates[dates.length - 1],
  };
}
