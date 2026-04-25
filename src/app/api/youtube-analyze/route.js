import { NextResponse } from 'next/server';
import JSZip from 'jszip';

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

    // Check if this is a ZIP file or folder of files
    let parsedData;
    
    if (files.length === 1 && files[0].name.endsWith('.zip')) {
      // Handle ZIP upload
      parsedData = await parseZipFile(files[0]);
    } else {
      // Handle folder upload
      parsedData = await parseTakeoutFiles(files);
    }
    
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

async function parseZipFile(zipFile) {
  const data = {
    watchHistory: [],
    searchHistory: [],
    subscriptions: [],
    playlists: [],
    comments: [],
  };

  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipFile);
    
    for (const [filePath, file] of Object.entries(contents.files)) {
      if (file.dir) continue; // Skip directories
      
      const content = await file.async('string');
      
      if (filePath.includes('watch-history.html') || filePath.includes('history/watch-history')) {
        data.watchHistory = parseWatchHistory(content);
      } else if (filePath.includes('search-history.html') || filePath.includes('history/search-history')) {
        data.searchHistory = parseSearchHistory(content);
      } else if (filePath.includes('subscriptions.csv') || filePath.includes('subscriptions/subscriptions')) {
        data.subscriptions = parseSubscriptions(content);
      } else if (filePath.includes('playlists.csv') || filePath.includes('playlists/playlists')) {
        data.playlists = parsePlaylists(content);
      } else if (filePath.includes('comments.csv') || filePath.includes('comments/comments')) {
        data.comments = parseComments(content);
      }
    }
  } catch (e) {
    console.error('ZIP parsing error:', e);
    throw new Error('Failed to read ZIP file: ' + e.message);
  }
  
  return data;
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
  
  // Handle both formats with and without channel
  const entryRegex = /Watched\s+<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<br>\s*(?:<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<br>\s*)?([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/gi;
  
  let match;
  while ((match = entryRegex.exec(html)) !== null) {
    entries.push({
      videoUrl: match[1],
      videoTitle: decodeHTMLEntities(match[2].trim()),
      channelUrl: match[3] || '',
      channelName: match[4] ? decodeHTMLEntities(match[4].trim()) : '',
      date: parseTakeoutDate(match[5]),
    });
  }

  return entries;
}

function parseSearchHistory(html) {
  const entries = [];
  
  const entryRegex = /Searched for\s+<a[^>]+href="[^"]*"[^>]*>([^<]+)<\/a>\s*<br>\s*([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/gi;
  
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
  
  const startIdx = lines[0]?.toLowerCase().includes('channel') ? 1 : 0;
  
  for (let i = startIdx; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    if (parts.length >= 1 && parts[0]) {
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
    const parts = parseCSVLine(lines[i]);
    if (parts.length >= 1 && parts[0]) {
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
    const parts = parseCSVLine(lines[i]);
    if (parts.length >= 1 && parts[0]) {
      comments.push({
        text: parts[0].replace(/^"|"$/g, '').trim(),
        videoTitle: parts[1]?.replace(/^"|"$/g, '').trim() || '',
        date: parts[2]?.replace(/^"|"$/g, '').trim() || '',
      });
    }
  }

  return comments;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function decodeHTMLEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };
  
  return text.replace(/&(#\d+|[a-z]+);/gi, match => {
    if (match.startsWith('&#')) {
      return String.fromCharCode(parseInt(match.slice(2)));
    }
    return entities[match] || match;
  });
}

function parseTakeoutDate(dateStr) {
  try {
    const cleaned = dateStr.replace(/\s+/g, ' ').trim();
    return new Date(cleaned).toISOString();
  } catch {
    return new Date().toISOString();
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