#!/usr/bin/env node
/**
 * Server-side YouTube Takeout processor
 * Run on the Oracle instance to handle large ZIP files
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

// Simple ZIP extraction using child_process and unzip
const { execSync } = require('child_process');

const UPLOAD_DIR = path.join(__dirname, '../tmp/uploads');
const EXTRACT_DIR = path.join(__dirname, '../tmp/extracted');

// Ensure directories exist
[UPLOAD_DIR, EXTRACT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function processTakeout(zipPath) {
  const extractPath = path.join(EXTRACT_DIR, Date.now().toString());
  fs.mkdirSync(extractPath, { recursive: true });

  try {
    // Extract ZIP
    console.log('Extracting ZIP:', zipPath);
    execSync(`unzip -q "${zipPath}" -d "${extractPath}"`, { timeout: 60000 });

    // Find and parse files
    const data = {
      watchHistory: [],
      searchHistory: [],
      subscriptions: [],
      playlists: [],
      comments: [],
    };

    // Walk extracted directory
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          const content = fs.readFileSync(fullPath, 'utf8');
          const fileName = path.basename(fullPath);
          
          if (fileName.includes('watch-history.html')) {
            data.watchHistory = parseWatchHistory(content);
          } else if (fileName.includes('search-history.html')) {
            data.searchHistory = parseSearchHistory(content);
          } else if (fileName.includes('subscriptions.csv')) {
            data.subscriptions = parseSubscriptions(content);
          } else if (fileName.includes('playlists.csv')) {
            data.playlists = parsePlaylists(content);
          } else if (fileName.includes('comments.csv')) {
            data.comments = parseComments(content);
          }
        }
      }
    }

    walkDir(extractPath);

    // Cleanup
    fs.rmSync(extractPath, { recursive: true, force: true });
    fs.unlinkSync(zipPath);

    return data;
  } catch (error) {
    // Cleanup on error
    try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch {}
    try { fs.unlinkSync(zipPath); } catch {}
    throw error;
  }
}

function parseWatchHistory(html) {
  const entries = [];
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

module.exports = { processTakeout, UPLOAD_DIR };
