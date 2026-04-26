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

  const taxonomy = buildTaxonomy(watchHistory, searchHistory);
  const dateRange = getDateRange(watchHistory);
  const heatmap = buildHeatmap(watchHistory);
  const intentSeries = buildIntentSeries(watchHistory, taxonomy);
  const watchTrend = buildWatchTrend(watchHistory);
  const channelAnalysis = analyzeChannels(watchHistory, taxonomy);
  const commentAnalysis = analyzeComments(comments);
  const topSearches = analyzeSearches(searchHistory);
  
  const kpis = [
    { label: 'Watch events', value: stats.watchEvents.toLocaleString(), detail: 'Total videos watched' },
    { label: 'Search events', value: stats.searchEvents.toLocaleString(), detail: 'Queries that opened the loop' },
    { label: 'Subscriptions', value: stats.subscriptions.toLocaleString(), detail: 'Channels in your feed' },
    { label: 'Comments', value: stats.comments.toLocaleString(), detail: 'Public engagement' },
    { label: 'Domains', value: taxonomy.filter(t => t.percentage >= 3).length.toString(), detail: 'Major content categories' },
  ];
  
  if (dateRange) {
    const years = new Date(dateRange.latest).getFullYear() - new Date(dateRange.earliest).getFullYear() + 1;
    kpis.push({ label: 'Years of data', value: years.toString(), detail: `${dateRange.earliest.slice(0, 10)} to ${dateRange.latest.slice(0, 10)}` });
  }

  const summary = generateDetailedSummary(stats, taxonomy, channelAnalysis, dateRange);

  return {
    generatedAt: new Date().toISOString(),
    stats,
    kpis,
    taxonomy,
    topChannels: channelAnalysis.topChannels,
    loyaltyCreators: channelAnalysis.loyaltyCreators,
    channelsByPeriod: channelAnalysis.byPeriod,
    topSearches,
    heatmap,
    intentSeries,
    watchTrend,
    comments: commentAnalysis,
    summary,
    dateRange,
  };
}

function generateEmptyState() {
  return {
    stats: { watchEvents: 0, searchEvents: 0, subscriptions: 0, playlists: 0, comments: 0 },
    kpis: [{ label: 'No Data', value: '0', detail: 'Upload your YouTube Takeout to see analytics' }],
    taxonomy: [{ id: 'none', label: 'No Data', color: '#57534e', percentage: 100, summary: 'No watch history found' }],
    topChannels: [],
    topSearches: [],
    summary: 'No YouTube data was found in the uploaded files. Make sure you selected YouTube in your Google Takeout export.',
    dateRange: null,
  };
}

const TAXONOMY_DEFS = [
  { 
    id: 'tech-engineering', 
    label: 'Tech & Engineering', 
    color: '#67c1b8', 
    keywords: ['code', 'programming', 'software', 'developer', 'react', 'javascript', 'python', 'java', 'typescript', 'nextjs', 'node', 'api', 'database', 'github', 'vscode', 'terminal', 'linux', 'docker', 'aws', 'devops', 'frontend', 'backend', 'fullstack', 'web dev', 'coding', 'engineer', 'fireship', 'theo', 'primeagen', 'traversy'],
    summary: 'Code, tools, and building things that work',
    narrative: 'The engineering lane where tutorials, deep dives, and developer culture converge.'
  },
  { 
    id: 'tech-reviews', 
    label: 'Tech Reviews & Gadgets', 
    color: '#8dd39e', 
    keywords: ['review', 'unbox', 'tech', 'phone', 'laptop', 'iphone', 'samsung', 'pixel', 'macbook', 'apple', 'android', 'mkbhd', 'linus', 'dave2d', 'shortcircuit', 'unbox therapy', 'mrwhosetheboss', 'arun', 'gadget', 'camera', 'gpu', 'cpu', 'build pc'],
    summary: 'Gadgets, reviews, and the endless upgrade cycle',
    narrative: 'Consumer tech content that helps justify purchases and understand the market.'
  },
  { 
    id: 'gaming-entertainment', 
    label: 'Gaming & Entertainment', 
    color: '#f2a65a', 
    keywords: ['game', 'gaming', 'playthrough', "let's play", 'minecraft', 'valorant', 'league', 'steam', 'gameplay', 'twitch', 'esports', 'speedrun', 'nintendo', 'playstation', 'xbox', 'streamer', 'pewdiepie', 'xqc', 'asmongold', 'penguinz0', 'critikal', 'dunkey'],
    summary: 'The recreational and gaming content lane',
    narrative: 'Gaming, streaming, and the entertainment side of the internet.'
  },
  { 
    id: 'anime-media', 
    label: 'Anime & Media', 
    color: '#e879f9', 
    keywords: ['anime', 'manga', 'crunchyroll', 'gigguk', 'joey', 'cdawg', 'trash taste', 'one piece', 'jujutsu', 'demon slayer', 'attack on titan', 'isekai', 'shonen', 'slice of life', 'seasonal anime', 'watchmojo', 'film', 'movie', 'cinema', 'review'],
    summary: 'Anime, film, and media criticism',
    narrative: 'Japanese media and broader entertainment analysis.'
  },
  { 
    id: 'science-learning', 
    label: 'Science & Learning', 
    color: '#8fb8de', 
    keywords: ['science', 'physics', 'chemistry', 'biology', 'math', 'documentary', 'history', 'nature', 'space', 'nasa', 'vsauce', 'kurzgesagt', 'veritasium', 'ted', 'education', 'numberphile', 'minutephysics', 'smartereveryday', '3blue1brown', 'primer'],
    summary: 'Curiosity-driven learning and explainers',
    narrative: 'The part of YouTube that functions like a university with better production value.'
  },
  { 
    id: 'news-politics', 
    label: 'News & Current Events', 
    color: '#d96459', 
    keywords: ['news', 'politics', 'election', 'trump', 'biden', 'congress', 'ukraine', 'russia', 'war', 'geopolitics', 'economy', 'stock', 'market', 'finance', 'patrick boyle', 'breaking points', 'bbc', 'cnn', 'wsj', 'bloomberg'],
    summary: 'Current events and political analysis',
    narrative: 'Staying informed about the world, whether you wanted to or not.'
  },
  { 
    id: 'creative-design', 
    label: 'Creative & Design', 
    color: '#d8c36a', 
    keywords: ['design', 'art', 'creative', 'animation', 'illustrator', 'photoshop', 'music', 'audio', 'production', 'drawing', 'painting', '3d', 'blender', 'after effects', 'premiere', 'figma', 'ui', 'ux', 'graphic design', 'video editing'],
    summary: 'Creative tools and artistic content',
    narrative: 'The creative side of content consumption and production.'
  },
  { 
    id: 'comedy-internet', 
    label: 'Comedy & Internet Culture', 
    color: '#fb923c', 
    keywords: ['comedy', 'funny', 'meme', 'skit', 'parody', 'satire', 'onion', 'snl', 'stand up', 'comedian', 'crackermilk', 'gus johnson', 'trevor wallace', 'cody ko', 'noel miller', 'drew gooden', 'danny gonzalez', 'kurtis conner'],
    summary: 'Comedy, memes, and internet culture',
    narrative: 'The part of YouTube that exists purely to make you laugh.'
  },
  { 
    id: 'lifestyle-vlog', 
    label: 'Lifestyle & Vlogs', 
    color: '#a78bfa', 
    keywords: ['vlog', 'day in the life', 'routine', 'travel', 'food', 'cooking', 'recipe', 'fitness', 'workout', 'self improvement', 'productivity', 'motivation', 'lifestyle', 'moving', 'apartment', 'house tour'],
    summary: 'Personal content and lifestyle',
    narrative: 'Window into how other people live, work, and organize their lives.'
  },
  { 
    id: 'music', 
    label: 'Music', 
    color: '#f472b6', 
    keywords: ['music video', 'official audio', 'lyrics', 'cover', 'remix', 'album', 'playlist', 'lofi', 'hip hop', 'rock', 'pop', 'electronic', 'vevo', 'spotify', 'boiler room', 'live performance', 'concert'],
    summary: 'Music videos and audio content',
    narrative: 'The soundtrack layer of your YouTube consumption.'
  },
];

function categorizeEntry(entry) {
  const title = (entry.videoTitle || '').toLowerCase();
  const channel = (entry.channelName || '').toLowerCase();
  const text = title + ' ' + channel;
  
  for (const cat of TAXONOMY_DEFS) {
    for (const keyword of cat.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return cat.id;
      }
    }
  }
  return 'other';
}

function buildTaxonomy(watchHistory, searchHistory) {
  const watchCounts = {};
  const searchCounts = {};
  TAXONOMY_DEFS.forEach(cat => {
    watchCounts[cat.id] = 0;
    searchCounts[cat.id] = 0;
  });
  watchCounts['other'] = 0;
  searchCounts['other'] = 0;

  watchHistory.forEach(entry => {
    const catId = categorizeEntry(entry);
    watchCounts[catId]++;
  });

  searchHistory.forEach(entry => {
    const query = (entry.query || '').toLowerCase();
    let matched = false;
    for (const cat of TAXONOMY_DEFS) {
      for (const keyword of cat.keywords) {
        if (query.includes(keyword.toLowerCase())) {
          searchCounts[cat.id]++;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    if (!matched) searchCounts['other']++;
  });

  const total = watchHistory.length || 1;
  const taxonomy = TAXONOMY_DEFS.map(cat => ({
    id: cat.id,
    label: cat.label,
    color: cat.color,
    summary: cat.summary,
    narrative: cat.narrative,
    watchCount: watchCounts[cat.id],
    searchCount: searchCounts[cat.id],
    percentage: Math.round((watchCounts[cat.id] / total) * 100),
  }));

  taxonomy.sort((a, b) => b.watchCount - a.watchCount);

  const otherCount = watchCounts['other'];
  if (otherCount > 0) {
    taxonomy.push({
      id: 'other',
      label: 'Other',
      color: '#57534e',
      summary: 'Content that doesn\'t fit the main categories',
      narrative: 'The eclectic mix of everything else.',
      watchCount: otherCount,
      searchCount: searchCounts['other'],
      percentage: Math.round((otherCount / total) * 100),
    });
  }

  return taxonomy.filter(t => t.watchCount > 0);
}

function buildHeatmap(watchHistory) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hourLabels = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );
  
  const counts = {};
  dayLabels.forEach((_, day) => {
    hourLabels.forEach((_, hour) => {
      counts[`${day}-${hour}`] = 0;
    });
  });

  watchHistory.forEach(entry => {
    if (!entry.date) return;
    try {
      const date = new Date(entry.date);
      const day = date.getDay();
      const hour = date.getHours();
      counts[`${day}-${hour}`]++;
    } catch (e) {}
  });

  const maxCount = Math.max(...Object.values(counts), 1);
  const cells = [];
  
  dayLabels.forEach((dayLabel, day) => {
    hourLabels.forEach((_, hour) => {
      const count = counts[`${day}-${hour}`];
      cells.push({
        day,
        dayLabel,
        hour,
        count,
        intensity: count / maxCount,
      });
    });
  });

  return { dayLabels, hourLabels, cells, maxCount };
}

function buildIntentSeries(watchHistory, taxonomy) {
  const yearCounts = {};
  
  watchHistory.forEach(entry => {
    if (!entry.date) return;
    try {
      const year = new Date(entry.date).getFullYear();
      if (!yearCounts[year]) {
        yearCounts[year] = { year };
        taxonomy.forEach(t => yearCounts[year][t.id] = 0);
      }
      const catId = categorizeEntry(entry);
      if (yearCounts[year][catId] !== undefined) {
        yearCounts[year][catId]++;
      }
    } catch (e) {}
  });

  return Object.values(yearCounts).sort((a, b) => a.year - b.year);
}

function buildWatchTrend(watchHistory) {
  const yearCounts = {};
  
  watchHistory.forEach(entry => {
    if (!entry.date) return;
    try {
      const year = new Date(entry.date).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    } catch (e) {}
  });

  return Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);
}

function analyzeChannels(watchHistory, taxonomy) {
  const channelData = {};
  const yearQuarterData = {};
  
  watchHistory.forEach(entry => {
    const name = entry.channelName || 'Unknown';
    const catId = categorizeEntry(entry);
    
    if (!channelData[name]) {
      channelData[name] = { name, count: 0, domainId: catId, firstSeen: entry.date, lastSeen: entry.date };
    }
    channelData[name].count++;
    if (entry.date && entry.date < channelData[name].firstSeen) channelData[name].firstSeen = entry.date;
    if (entry.date && entry.date > channelData[name].lastSeen) channelData[name].lastSeen = entry.date;
    
    if (entry.date) {
      try {
        const d = new Date(entry.date);
        const year = d.getFullYear();
        const quarter = `Q${Math.floor(d.getMonth() / 3) + 1}`;
        const yearKey = year.toString();
        const quarterKey = `${year} ${quarter}`;
        
        [yearKey, quarterKey].forEach(key => {
          if (!yearQuarterData[key]) yearQuarterData[key] = {};
          yearQuarterData[key][name] = (yearQuarterData[key][name] || 0) + 1;
        });
      } catch (e) {}
    }
  });

  const channels = Object.values(channelData);
  channels.sort((a, b) => b.count - a.count);
  
  const topChannels = channels.slice(0, 30).map(ch => ({
    name: ch.name,
    watchCount: ch.count,
    domainId: ch.domainId,
    domain: taxonomy.find(t => t.id === ch.domainId)?.label || 'Other',
  }));

  const loyaltyCreators = channels
    .filter(ch => {
      if (!ch.firstSeen || !ch.lastSeen) return false;
      const tenure = (new Date(ch.lastSeen) - new Date(ch.firstSeen)) / (1000 * 60 * 60 * 24 * 365);
      return tenure > 0.5 && ch.count >= 20;
    })
    .slice(0, 10)
    .map(ch => {
      const tenure = (new Date(ch.lastSeen) - new Date(ch.firstSeen)) / (1000 * 60 * 60 * 24 * 365);
      return {
        label: ch.name,
        watchCount: ch.count,
        domainId: ch.domainId,
        loyaltyScore: Math.round(ch.count * Math.sqrt(tenure)),
      };
    })
    .sort((a, b) => b.loyaltyScore - a.loyaltyScore);

  const byPeriod = {
    year: [],
    quarter: [],
  };
  
  Object.entries(yearQuarterData).forEach(([period, channels]) => {
    const leaderboard = Object.entries(channels)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
    
    const isQuarter = period.includes('Q');
    if (isQuarter) {
      byPeriod.quarter.push({ period, leaderboard });
    } else {
      byPeriod.year.push({ period, leaderboard });
    }
  });
  
  byPeriod.year.sort((a, b) => a.period.localeCompare(b.period));
  byPeriod.quarter.sort((a, b) => a.period.localeCompare(b.period));

  return { topChannels, loyaltyCreators, byPeriod };
}

function analyzeComments(comments) {
  const toneKeywords = {
    analytical: ['because', 'however', 'actually', 'technically', 'interesting', 'point', 'argument', 'reason', 'explain'],
    affirming: ['great', 'awesome', 'love', 'amazing', 'best', 'thanks', 'thank you', 'perfect', 'excellent', 'fantastic'],
    skeptical: ['but', 'wrong', 'disagree', 'not sure', 'doubt', 'question', 'issue', 'problem', 'concern'],
    deadpan: ['lol', 'lmao', 'bruh', 'based', 'real', 'fr', 'same', 'mood', 'this', 'true'],
  };

  const toneCounts = { analytical: 0, affirming: 0, skeptical: 0, deadpan: 0 };
  
  comments.forEach(comment => {
    const text = (comment.text || '').toLowerCase();
    let matched = false;
    
    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          toneCounts[tone]++;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    if (!matched) toneCounts.deadpan++;
  });

  const toneBreakdown = [
    { id: 'analytical', label: 'Analytical', color: '#67c1b8', count: toneCounts.analytical },
    { id: 'affirming', label: 'Affirming', color: '#8dd39e', count: toneCounts.affirming },
    { id: 'skeptical', label: 'Skeptical', color: '#d96459', count: toneCounts.skeptical },
    { id: 'deadpan', label: 'Deadpan', color: '#8fb8de', count: toneCounts.deadpan },
  ];

  return {
    total: comments.length,
    toneBreakdown,
    summary: comments.length > 0 
      ? `${comments.length} comments analyzed for engagement patterns.`
      : 'No comments found in this export.',
  };
}

function analyzeSearches(searchHistory) {
  const searchCounts = {};
  
  searchHistory.forEach(entry => {
    const query = (entry.query || '').toLowerCase().trim();
    if (query.length > 2) {
      searchCounts[query] = (searchCounts[query] || 0) + 1;
    }
  });

  return Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([query, count]) => ({ query, count }));
}

function generateDetailedSummary(stats, taxonomy, channelAnalysis, dateRange) {
  const parts = [];
  
  if (stats.watchEvents > 0) {
    parts.push(`You've watched ${stats.watchEvents.toLocaleString()} videos`);
    if (stats.searchEvents > 0) {
      parts.push(`and made ${stats.searchEvents.toLocaleString()} searches`);
    }
    parts[parts.length - 1] += '.';
  }
  
  const topDomains = taxonomy.filter(t => t.percentage >= 10).slice(0, 3);
  if (topDomains.length > 0) {
    const domainNames = topDomains.map(d => d.label.toLowerCase());
    if (domainNames.length === 1) {
      parts.push(`Your viewing skews heavily toward ${domainNames[0]}.`);
    } else {
      parts.push(`Your main interests span ${domainNames.slice(0, -1).join(', ')} and ${domainNames.slice(-1)}.`);
    }
  }
  
  if (channelAnalysis.topChannels.length > 0) {
    const topChannel = channelAnalysis.topChannels[0];
    parts.push(`${topChannel.name} leads your most-watched channels with ${topChannel.watchCount} views.`);
  }
  
  if (dateRange) {
    const start = new Date(dateRange.earliest);
    const end = new Date(dateRange.latest);
    const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
    if (months > 12) {
      parts.push(`This data spans ${Math.round(months / 12)} years of viewing history.`);
    }
  }

  return parts.join(' ');
}

function getDateRange(watchHistory) {
  if (watchHistory.length === 0) return null;
  const dates = watchHistory.map(entry => entry.date).filter(Boolean).sort();
  return dates.length > 0 ? { earliest: dates[0], latest: dates[dates.length - 1] } : null;
}