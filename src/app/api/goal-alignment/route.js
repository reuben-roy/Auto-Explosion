import { NextResponse } from 'next/server';
import { processTakeoutFromBuffer, processFileContents } from '../../../../scripts/process-youtube-takeout.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const TAXONOMY_DEFS = [
  { id: 'tech-engineering', label: 'Tech & Engineering', keywords: ['code', 'programming', 'software', 'developer', 'react', 'javascript', 'python', 'java', 'typescript', 'nextjs', 'node', 'api', 'database', 'github', 'vscode', 'terminal', 'linux', 'docker', 'aws', 'devops', 'frontend', 'backend', 'fullstack', 'web dev', 'coding', 'engineer', 'fireship', 'theo', 'primeagen', 'traversy'] },
  { id: 'tech-reviews', label: 'Tech Reviews & Gadgets', keywords: ['review', 'unbox', 'tech', 'phone', 'laptop', 'iphone', 'samsung', 'pixel', 'macbook', 'apple', 'android', 'mkbhd', 'linus', 'dave2d', 'shortcircuit', 'gadget', 'camera', 'gpu', 'cpu', 'build pc'] },
  { id: 'gaming', label: 'Gaming & Entertainment', keywords: ['game', 'gaming', 'playthrough', "let's play", 'minecraft', 'valorant', 'league', 'steam', 'gameplay', 'twitch', 'esports', 'speedrun', 'nintendo', 'playstation', 'xbox', 'streamer', 'pewdiepie'] },
  { id: 'anime-media', label: 'Anime & Media', keywords: ['anime', 'manga', 'crunchyroll', 'gigguk', 'one piece', 'jujutsu', 'demon slayer', 'attack on titan', 'film', 'movie', 'cinema', 'review'] },
  { id: 'science-learning', label: 'Science & Learning', keywords: ['science', 'physics', 'chemistry', 'biology', 'math', 'documentary', 'history', 'nature', 'space', 'nasa', 'vsauce', 'kurzgesagt', 'veritasium', 'ted', 'education', 'tutorial', 'course', 'learn'] },
  { id: 'news-politics', label: 'News & Current Events', keywords: ['news', 'politics', 'election', 'ukraine', 'russia', 'war', 'geopolitics', 'economy', 'stock', 'market', 'finance', 'bloomberg', 'cnn', 'bbc'] },
  { id: 'creative-design', label: 'Creative & Design', keywords: ['design', 'art', 'creative', 'animation', 'illustrator', 'photoshop', 'music', 'audio', 'production', 'drawing', 'painting', '3d', 'blender', 'video editing', 'premiere', 'figma'] },
  { id: 'comedy', label: 'Comedy & Entertainment', keywords: ['comedy', 'funny', 'meme', 'skit', 'parody', 'satire', 'snl', 'stand up', 'comedian'] },
  { id: 'fitness-health', label: 'Fitness & Health', keywords: ['fitness', 'workout', 'gym', 'exercise', 'health', 'nutrition', 'diet', 'yoga', 'running', 'marathon', 'weightlifting', 'bodybuilding', 'crossfit', 'athlean', 'jeff nippard'] },
  { id: 'business-finance', label: 'Business & Finance', keywords: ['business', 'entrepreneur', 'startup', 'invest', 'stock', 'crypto', 'real estate', 'passive income', 'side hustle', 'financial', 'money', 'wealth'] },
  { id: 'productivity', label: 'Productivity & Self-Improvement', keywords: ['productivity', 'self improvement', 'motivation', 'habits', 'routine', 'morning', 'discipline', 'focus', 'time management', 'goal', 'success'] },
  { id: 'language', label: 'Language Learning', keywords: ['language', 'spanish', 'french', 'japanese', 'korean', 'chinese', 'german', 'duolingo', 'polyglot', 'fluent'] },
  { id: 'music', label: 'Music', keywords: ['music video', 'official audio', 'lyrics', 'cover', 'remix', 'album', 'playlist', 'lofi', 'concert', 'live performance'] },
  { id: 'lifestyle', label: 'Lifestyle & Vlogs', keywords: ['vlog', 'day in the life', 'routine', 'travel', 'food', 'cooking', 'recipe', 'lifestyle', 'apartment', 'moving'] },
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

function analyzeData(watchHistory, searchHistory) {
  const domainCounts = {};
  TAXONOMY_DEFS.forEach(cat => domainCounts[cat.id] = 0);
  domainCounts['other'] = 0;

  watchHistory.forEach(entry => {
    const catId = categorizeEntry(entry);
    domainCounts[catId]++;
  });

  const channelCounts = {};
  watchHistory.forEach(entry => {
    const name = entry.channelName || 'Unknown';
    channelCounts[name] = (channelCounts[name] || 0) + 1;
  });

  const topChannels = Object.entries(channelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));

  const searchCounts = {};
  searchHistory.forEach(entry => {
    const query = (entry.query || '').toLowerCase().trim();
    if (query.length > 2) {
      searchCounts[query] = (searchCounts[query] || 0) + 1;
    }
  });

  const topSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }));

  const domainSummary = Object.entries(domainCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => {
      const def = TAXONOMY_DEFS.find(t => t.id === id);
      return {
        id,
        label: def?.label || 'Other',
        count,
        percentage: Math.round((count / watchHistory.length) * 100),
      };
    });

  return {
    totalVideos: watchHistory.length,
    totalSearches: searchHistory.length,
    domainSummary,
    topChannels,
    topSearches,
    topDomain: domainSummary[0]?.label || 'Unknown',
  };
}

function buildPrompt(goals, dataAnalysis) {
  const goalsText = Object.entries(goals)
    .filter(([_, value]) => value && value.trim())
    .map(([category, value]) => `- ${category}: ${value}`)
    .join('\n');

  const domainText = dataAnalysis.domainSummary
    .slice(0, 8)
    .map(d => `  - ${d.label}: ${d.count} videos (${d.percentage}%)`)
    .join('\n');

  const channelsText = dataAnalysis.topChannels
    .slice(0, 10)
    .map(c => `  - ${c.name}: ${c.count} videos`)
    .join('\n');

  const searchesText = dataAnalysis.topSearches
    .slice(0, 10)
    .map(s => `  - "${s.query}": ${s.count} times`)
    .join('\n');

  return `You are a brutally honest life coach analyzing whether someone's actions align with their stated goals. Be direct but constructive.

## User's Stated Goals:
${goalsText}

## Their Actual YouTube Behavior (${dataAnalysis.totalVideos.toLocaleString()} videos watched, ${dataAnalysis.totalSearches.toLocaleString()} searches):

Content Categories:
${domainText}

Top Channels:
${channelsText}

Top Searches:
${searchesText}

## Your Task:
Analyze the alignment between their stated goals and their actual YouTube consumption. Be honest - if they say they want to learn programming but spend most time on gaming, call it out. If they're actually aligned, acknowledge it.

Respond in this exact JSON format:
{
  "alignmentScore": <number 0-100>,
  "verdictEmoji": "<single emoji>",
  "verdictTitle": "<short punchy title, 3-6 words>",
  "verdictSummary": "<2-3 sentences summarizing the overall alignment>",
  "goalAnalysis": [
    {
      "goal": "<goal category name>",
      "icon": "<emoji>",
      "alignment": <number 0-100>,
      "feedback": "<1-2 sentences of specific feedback>",
      "evidence": "<specific channels, searches, or content that support or contradict this goal>"
    }
  ],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>"
  ],
  "hardTruth": "<one paragraph of direct, honest assessment - be real about what their data says about their priorities>"
}

Only respond with valid JSON, no markdown or explanation.`;
}

async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.log('No OpenRouter API key, using fallback analysis');
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://explosion.fun',
        'X-Title': 'Goal Alignment Tool',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', response.status, error);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in OpenRouter response');
      return null;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('OpenRouter call failed:', error);
    return null;
  }
}

function generateFallbackAnalysis(goals, dataAnalysis) {
  const goalEntries = Object.entries(goals).filter(([_, v]) => v?.trim());
  
  const goalKeywords = {
    career: ['tech-engineering', 'business-finance', 'productivity'],
    learning: ['science-learning', 'tech-engineering', 'language'],
    health: ['fitness-health'],
    creative: ['creative-design', 'music'],
    financial: ['business-finance', 'productivity'],
  };

  let totalAlignment = 0;
  const goalAnalysis = goalEntries.map(([category, value]) => {
    const relevantDomains = goalKeywords[category] || [];
    const relevantCount = dataAnalysis.domainSummary
      .filter(d => relevantDomains.includes(d.id))
      .reduce((sum, d) => sum + d.count, 0);
    
    const alignment = Math.min(100, Math.round((relevantCount / dataAnalysis.totalVideos) * 300));
    totalAlignment += alignment;

    const icons = { career: '💼', learning: '📚', health: '💪', creative: '🎨', financial: '💰' };
    
    return {
      goal: category.charAt(0).toUpperCase() + category.slice(1),
      icon: icons[category] || '🎯',
      alignment,
      feedback: alignment >= 50 
        ? `Your viewing habits show genuine interest in ${category}-related content.`
        : `Your watch history shows limited engagement with ${category}-related content.`,
      evidence: relevantCount > 0 
        ? `Found ${relevantCount} videos in relevant categories.`
        : `Few videos found in categories that would support this goal.`,
    };
  });

  const avgAlignment = Math.round(totalAlignment / Math.max(goalEntries.length, 1));
  
  let verdictEmoji, verdictTitle;
  if (avgAlignment >= 70) {
    verdictEmoji = '🎯';
    verdictTitle = 'Walking the Talk';
  } else if (avgAlignment >= 40) {
    verdictEmoji = '🤔';
    verdictTitle = 'Room for Improvement';
  } else {
    verdictEmoji = '😬';
    verdictTitle = 'Time for a Reality Check';
  }

  return {
    alignmentScore: avgAlignment,
    verdictEmoji,
    verdictTitle,
    verdictSummary: `Based on ${dataAnalysis.totalVideos.toLocaleString()} videos analyzed, your content consumption ${avgAlignment >= 50 ? 'partially supports' : 'shows limited alignment with'} your stated goals. Your top category is ${dataAnalysis.topDomain}.`,
    goalAnalysis,
    recommendations: [
      'Set specific YouTube time blocks for goal-relevant content',
      'Create playlists that align with each of your goals',
      'Use browser extensions to track and limit entertainment content',
    ],
    hardTruth: avgAlignment >= 50 
      ? 'Your data suggests you are making some effort towards your goals, but there is still a gap between intentions and actions. Consider whether your entertainment consumption is a reward or an escape.'
      : 'The data paints a clear picture: your stated goals and your actual behavior are misaligned. This does not make you a bad person, but it does mean your goals are more aspirational than actionable right now.',
  };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const goalsJson = formData.get('goals');
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (!goalsJson) {
      return NextResponse.json({ error: 'No goals provided' }, { status: 400 });
    }

    const goals = JSON.parse(goalsJson);
    
    let parsedData;
    const firstFile = files[0];
    const isZip = firstFile.name.toLowerCase().endsWith('.zip') || firstFile.type === 'application/zip';
    
    if (isZip && files.length === 1) {
      const bytes = await firstFile.arrayBuffer();
      parsedData = await processTakeoutFromBuffer(bytes);
    } else {
      const fileContents = [];
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const content = new TextDecoder().decode(bytes);
        fileContents.push({ name: file.name, content });
      }
      parsedData = processFileContents(fileContents);
    }

    const { watchHistory, searchHistory } = parsedData;
    
    if (watchHistory.length === 0) {
      return NextResponse.json({ 
        error: 'No watch history found in the uploaded file. Make sure you selected YouTube in your Google Takeout.' 
      }, { status: 400 });
    }

    const dataAnalysis = analyzeData(watchHistory, searchHistory);
    const prompt = buildPrompt(goals, dataAnalysis);
    
    let analysis = await callOpenRouter(prompt);
    
    if (!analysis) {
      analysis = generateFallbackAnalysis(goals, dataAnalysis);
    }

    return NextResponse.json({
      dataPreview: {
        totalVideos: dataAnalysis.totalVideos,
        totalSearches: dataAnalysis.totalSearches,
        topDomain: dataAnalysis.topDomain,
      },
      analysis,
    });
  } catch (error) {
    console.error('Goal alignment error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze: ' + error.message },
      { status: 500 }
    );
  }
}
