import { NextResponse } from 'next/server';

// YouTube Data API key - should be stored in environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_DATA_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json(
      { error: 'Channel ID is required' },
      { status: 400 }
    );
  }

  // If no API key, return demo data to show the UI works
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(getDemoData(channelId));
  }

  try {
    // Fetch channel info from YouTube Data API
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel data from YouTube');
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    const channel = channelData.items[0];
    const snippet = channel.snippet;
    const stats = channel.statistics;

    // Transform to our format
    const result = {
      id: channel.id,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails?.medium?.url || '',
      subscriberCount: parseInt(stats.subscriberCount),
      videoCount: parseInt(stats.videoCount),
      viewCount: parseInt(stats.viewCount),
      joinedDate: new Date(snippet.publishedAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      // Calculated metrics (would need more API calls for real data)
      engagementRate: calculateEngagementRate(parseInt(stats.viewCount), parseInt(stats.videoCount)),
      avgViewsPerVideo: Math.round(parseInt(stats.viewCount) / parseInt(stats.videoCount)),
      uploadFrequency: '2-3',
      topCategory: 'Technology',
      categories: [
        { name: 'Tech Reviews', percentage: 45 },
        { name: 'Deep Dives', percentage: 30 },
        { name: 'Interviews', percentage: 15 },
        { name: 'Other', percentage: 10 },
      ],
      // Placeholder for subscriber growth data
      subscriberHistory: generateSubscriberHistory(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze channel' },
      { status: 500 }
    );
  }
}

function calculateEngagementRate(viewCount, videoCount) {
  // Simplified engagement calculation
  const avgViews = viewCount / videoCount;
  if (avgViews > 1000000) return 5.2;
  if (avgViews > 100000) return 6.8;
  if (avgViews > 10000) return 8.4;
  return 4.5;
}

function generateSubscriberHistory() {
  // Generate demo subscriber growth history
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      subscribers: Math.floor(Math.random() * 50000) + 100000,
    });
  }
  return months;
}

function getDemoData(channelId) {
  // Return realistic demo data to show the UI works
  // In production, this would be replaced by actual API calls
  return {
    id: channelId,
    title: 'Demo Channel',
    description: 'This is a demo channel showing what analytics would look like. Connect a YouTube Data API key to get real data for any channel.',
    thumbnail: 'https://via.placeholder.com/120x120.png?text=Demo',
    subscriberCount: 125000,
    videoCount: 342,
    viewCount: 45000000,
    joinedDate: 'March 2019',
    engagementRate: 7.2,
    avgViewsPerVideo: 131578,
    uploadFrequency: '2-3',
    topCategory: 'Technology',
    categories: [
      { name: 'Tech Reviews', percentage: 45 },
      { name: 'Deep Dives', percentage: 30 },
      { name: 'Interviews', percentage: 15 },
      { name: 'Other', percentage: 10 },
    ],
    subscriberHistory: generateSubscriberHistory(),
  };
}
