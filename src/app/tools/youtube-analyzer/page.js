'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function YouTubeAnalyzerPage() {
  const [channelInput, setChannelInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Extract channel ID from various URL formats or use input directly
      const channelId = extractChannelId(channelInput);
      if (!channelId) {
        throw new Error('Invalid YouTube channel URL or ID');
      }

      // For now, we'll use a demo mode since API key isn't set up
      // In production, this would call our API route with YouTube Data API
      const response = await fetch(`/api/youtube-analyze?channelId=${encodeURIComponent(channelId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to analyze channel');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>YouTube Channel Analyzer</h1>
          <p className={styles.subtitle}>
            Enter any YouTube channel URL or ID to get rich analytics and visualizations
          </p>
        </div>
      </section>

      <section className={styles.inputSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              placeholder="https://youtube.com/@channel or UCxxx or @username"
              className={styles.input}
              aria-label="YouTube channel URL or ID"
            />
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading || !channelInput.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze Channel'}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </section>

      {data && (
        <section className={styles.results}>
          <div className={styles.channelHeader}>
            <img 
              src={data.thumbnail} 
              alt={data.title} 
              className={styles.thumbnail}
            />
            <div className={styles.channelInfo}>
              <h2>{data.title}</h2>
              <p>{data.description}</p>
              <div className={styles.stats}>
                <span>{data.subscriberCount.toLocaleString()} subscribers</span>
                <span>{data.videoCount.toLocaleString()} videos</span>
                <span>Joined {data.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiValue}>{data.engagementRate}%</div>
              <div className={styles.kpiLabel}>Avg Engagement Rate</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiValue}>{data.avgViewsPerVideo.toLocaleString()}</div>
              <div className={styles.kpiLabel}>Avg Views/Video</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiValue}>{data.uploadFrequency}</div>
              <div className={styles.kpiLabel}>Uploads/Week</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiValue}>{data.topCategory}</div>
              <div className={styles.kpiLabel}>Top Content Category</div>
            </div>
          </div>

          <div className={styles.visualizationSection}>
            <h3>Subscriber Growth</h3>
            <div className={styles.chartPlaceholder}>
              {/* Chart would go here - using existing D3 components */}
              <p>Subscriber growth visualization</p>
            </div>
          </div>

          <div className={styles.visualizationSection}>
            <h3>Content Analysis</h3>
            <div className={styles.categoryBreakdown}>
              {data.categories?.map((cat) => (
                <div key={cat.name} className={styles.categoryItem}>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryFill} 
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <span className={styles.categoryPercent}>{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!data && !loading && !error && (
        <section className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h3>How it works</h3>
            <ol>
              <li>Enter a YouTube channel URL, @username, or channel ID</li>
              <li>We analyze the channel&apos;s content, engagement, and patterns</li>
              <li>Get visualizations and insights in seconds</li>
            </ol>
            <div className={styles.examples}>
              <h4>Example inputs:</h4>
              <code>@ Marques Brownlee</code>
              <code>https://youtube.com/@technologychannel</code>
              <code>UC-lHJZR3Gqxm24_Vd_AJ5Yw</code>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function extractChannelId(input) {
  const trimmed = input.trim();
  
  // Already a channel ID (starts with UC)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return trimmed;
  }
  
  // @username format
  if (trimmed.startsWith('@')) {
    return trimmed;
  }
  
  // Full URL - extract from various formats
  const patterns = [
    /youtube\.com\/@([^\/\?]+)/,           // youtube.com/@username
    /youtube\.com\/channel\/([^\/\?]+)/,   // youtube.com/channel/UCxxx
    /youtube\.com\/c\/([^\/\?]+)/,         // youtube.com/c/customurl
    /youtube\.com\/user\/([^\/\?]+)/,      // youtube.com/user/username
    /youtu\.be\/([^\/\?]+)/,               // youtu.be/xxxxx (shortened - not channel)
  ];
  
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return trimmed; // Return as-is and let the API handle validation
}
