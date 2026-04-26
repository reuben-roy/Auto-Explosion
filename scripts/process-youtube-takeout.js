/**
 * YouTube Takeout processor
 * Processes ZIP files in-memory using JSZip
 */

import JSZip from 'jszip';

/**
 * Process a ZIP file buffer in memory
 * @param {Buffer|ArrayBuffer} zipBuffer - The ZIP file contents
 * @returns {Promise<Object>} Parsed takeout data
 */
export async function processTakeoutFromBuffer(zipBuffer) {
  console.log('Processing ZIP buffer, size:', zipBuffer.byteLength || zipBuffer.length);
  
  const data = {
    watchHistory: [],
    searchHistory: [],
    subscriptions: [],
    playlists: [],
    comments: [],
  };

  try {
    const zip = await JSZip.loadAsync(zipBuffer);
    console.log('ZIP loaded, files:', Object.keys(zip.files).length);
    
    for (const [filePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      
      const fileName = filePath.split('/').pop().toLowerCase();
      
      // Only process relevant files
      const isRelevant = fileName.includes('watch-history') ||
                        fileName.includes('search-history') ||
                        fileName.includes('subscriptions') ||
                        fileName.includes('playlists') ||
                        fileName.includes('comments');
      
      if (!isRelevant) continue;
      
      console.log('Processing file:', filePath);
      const content = await zipEntry.async('text');
      
      if (fileName.includes('watch-history')) {
        const parsed = parseWatchHistory(content, fileName);
        data.watchHistory.push(...parsed);
      } else if (fileName.includes('search-history')) {
        const parsed = parseSearchHistory(content, fileName);
        data.searchHistory.push(...parsed);
      } else if (fileName.includes('subscriptions')) {
        data.subscriptions = parseSubscriptions(content);
      } else if (fileName.includes('playlists')) {
        data.playlists = parsePlaylists(content);
      } else if (fileName.includes('comments')) {
        data.comments = parseComments(content);
      }
    }
    
    console.log('Parsing complete:', {
      watchHistory: data.watchHistory.length,
      searchHistory: data.searchHistory.length,
      subscriptions: data.subscriptions.length,
    });
    
    return data;
  } catch (error) {
    console.error('ZIP processing error:', error);
    throw new Error('Failed to process ZIP file: ' + error.message);
  }
}

/**
 * Process individual file contents
 * @param {Array<{name: string, content: string}>} files - Array of file objects
 * @returns {Object} Parsed takeout data
 */
export function processFileContents(files) {
  const data = {
    watchHistory: [],
    searchHistory: [],
    subscriptions: [],
    playlists: [],
    comments: [],
  };

  for (const file of files) {
    const fileName = file.name.toLowerCase();
    const content = file.content;
    
    console.log('Processing file:', file.name);
    
    if (fileName.includes('watch-history')) {
      const parsed = parseWatchHistory(content, fileName);
      data.watchHistory.push(...parsed);
    } else if (fileName.includes('search-history')) {
      const parsed = parseSearchHistory(content, fileName);
      data.searchHistory.push(...parsed);
    } else if (fileName.includes('subscriptions')) {
      data.subscriptions = parseSubscriptions(content);
    } else if (fileName.includes('playlists')) {
      data.playlists = parsePlaylists(content);
    } else if (fileName.includes('comments')) {
      data.comments = parseComments(content);
    }
  }

  return data;
}

function parseWatchHistory(content, fileName) {
  const entries = [];
  
  // Try JSON format first (newer Takeout exports)
  if (fileName.endsWith('.json') || content.trim().startsWith('[')) {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        for (const item of data) {
          // Handle both "Watched X" and direct video entries
          const title = item.title || '';
          const isWatched = title.startsWith('Watched ');
          
          entries.push({
            videoUrl: item.titleUrl || '',
            videoTitle: isWatched ? title.replace(/^Watched\s+/, '') : title,
            channelUrl: item.subtitles?.[0]?.url || '',
            channelName: item.subtitles?.[0]?.name || '',
            date: item.time || new Date().toISOString(),
          });
        }
        return entries;
      }
    } catch (e) {
      console.log('JSON parse failed, trying HTML parsing:', e.message);
    }
  }
  
  // HTML format (older Takeout exports)
  const entryRegex = /Watched\s+<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<br>\s*(?:<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<br>\s*)?([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/gi;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
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

function parseSearchHistory(content, fileName) {
  const entries = [];
  
  // Try JSON format first (newer Takeout exports)
  if (fileName.endsWith('.json') || content.trim().startsWith('[')) {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        for (const item of data) {
          const title = item.title || '';
          const isSearch = title.startsWith('Searched for ');
          
          if (isSearch || item.query) {
            entries.push({
              query: isSearch ? title.replace(/^Searched for\s+/, '') : (item.query || title),
              date: item.time || new Date().toISOString(),
            });
          }
        }
        return entries;
      }
    } catch (e) {
      console.log('JSON parse failed, trying HTML parsing:', e.message);
    }
  }
  
  // HTML format (older Takeout exports)
  const entryRegex = /Searched for\s+<a[^>]+href="[^"]*"[^>]*>([^<]+)<\/a>\s*<br>\s*([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/gi;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
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
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
  };
  return text.replace(/&(#\d+|[a-z]+);/gi, match => {
    if (match.startsWith('&#')) return String.fromCharCode(parseInt(match.slice(2)));
    return entities[match] || match;
  });
}

function parseTakeoutDate(dateStr) {
  try {
    return new Date(dateStr.replace(/\s+/g, ' ').trim()).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

