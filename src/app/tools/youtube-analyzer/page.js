'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

// Demo data for immediate testing
const DEMO_DATA = {
  stats: {
    watchEvents: 69385,
    searchEvents: 4827,
    subscriptions: 156,
    playlists: 12,
    comments: 234,
  },
  kpis: [
    { label: 'Watch events', value: '69,385', detail: 'Total videos watched' },
    { label: 'Search events', value: '4,827', detail: 'Queries that opened the loop' },
    { label: 'Subscriptions', value: '156', detail: 'Channels in your feed' },
    { label: 'Comments', value: '234', detail: 'Public engagement' },
    { label: 'Domains', value: '5', detail: 'Major content categories' },
    { label: 'Years of data', value: '4', detail: '2022-01-15 to 2026-04-25' },
  ],
  taxonomy: [
    { id: 'tech', label: 'Tech & Productivity', color: '#67c1b8', percentage: 42, watchCount: 29142, searchCount: 1850, summary: 'Your tech-curious mind keeps coming back for gadgets, reviews, and tutorials', narrative: 'The engineering lane where tutorials, deep dives, and developer culture converge.' },
    { id: 'creative', label: 'Creative & Entertainment', color: '#f2a65a', percentage: 28, watchCount: 19428, searchCount: 920, summary: 'Animation, music, movies, and creative inspiration fill your queue', narrative: 'Gaming, streaming, and the entertainment side of the internet.' },
    { id: 'learning', label: 'Science & Learning', color: '#8fb8de', percentage: 15, watchCount: 10408, searchCount: 540, summary: 'Documentaries and deep dives into how things work', narrative: 'The part of YouTube that functions like a university with better production value.' },
    { id: 'gaming', label: 'Gaming & Streams', color: '#9b8de1', percentage: 10, watchCount: 6938, searchCount: 380, summary: 'Let\'s plays, game reviews, and esports highlights', narrative: 'Gaming, streaming, and esports content.' },
    { id: 'other', label: 'Other', color: '#57534e', percentage: 5, watchCount: 3469, searchCount: 137, summary: 'The eclectic mix of everything else', narrative: 'Content that doesn\'t fit the main categories.' },
  ],
  topChannels: [
    { name: 'Unbox Therapy', watchCount: 847, domain: 'Tech & Productivity' },
    { name: 'Linus Tech Tips', watchCount: 623, domain: 'Tech & Productivity' },
    { name: 'MKBHD', watchCount: 412, domain: 'Tech & Productivity' },
    { name: 'Veritasium', watchCount: 389, domain: 'Science & Learning' },
    { name: 'Nerdist', watchCount: 298, domain: 'Creative & Entertainment' },
    { name: 'Game Grumps', watchCount: 267, domain: 'Gaming & Streams' },
    { name: 'Tom Scott', watchCount: 245, domain: 'Science & Learning' },
    { name: 'TED', watchCount: 223, domain: 'Science & Learning' },
    { name: 'Alie Ward', watchCount: 198, domain: 'Science & Learning' },
    { name: 'Kurzgesagt', watchCount: 187, domain: 'Science & Learning' },
  ],
  loyaltyCreators: [
    { label: 'Linus Tech Tips', watchCount: 623, loyaltyScore: 890 },
    { label: 'MKBHD', watchCount: 412, loyaltyScore: 720 },
    { label: 'Veritasium', watchCount: 389, loyaltyScore: 680 },
    { label: 'Kurzgesagt', watchCount: 187, loyaltyScore: 450 },
    { label: 'Tom Scott', watchCount: 245, loyaltyScore: 420 },
  ],
  topSearches: [
    { query: 'how to fix', count: 127 },
    { query: 'best phone 2026', count: 89 },
    { query: 'unboxing', count: 76 },
    { query: 'review', count: 65 },
    { query: 'macbook', count: 54 },
    { query: 'tesla', count: 48 },
    { query: 'iphone', count: 45 },
    { query: 'samsung', count: 41 },
    { query: 'gaming laptop', count: 38 },
    { query: 'vs code', count: 34 },
  ],
  watchTrend: [
    { year: 2022, count: 12450 },
    { year: 2023, count: 18920 },
    { year: 2024, count: 21340 },
    { year: 2025, count: 14280 },
    { year: 2026, count: 2395 },
  ],
  heatmap: {
    dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    hourLabels: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
    cells: Array.from({ length: 7 }, (_, day) => 
      Array.from({ length: 24 }, (_, hour) => ({
        day,
        dayLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
        hour,
        count: Math.floor(Math.random() * 500) + (hour >= 20 || hour <= 2 ? 200 : 50),
        intensity: Math.random() * 0.8 + (hour >= 20 || hour <= 2 ? 0.2 : 0),
      }))
    ).flat(),
  },
  comments: {
    total: 234,
    summary: '234 comments analyzed for engagement patterns.',
    toneBreakdown: [
      { id: 'analytical', label: 'Analytical', color: '#67c1b8', count: 45 },
      { id: 'affirming', label: 'Affirming', color: '#8dd39e', count: 62 },
      { id: 'skeptical', label: 'Skeptical', color: '#d96459', count: 38 },
      { id: 'deadpan', label: 'Deadpan', color: '#8fb8de', count: 89 },
    ],
  },
  summary: "You've watched 69,385 videos and made 4,827 searches. Your main interests span tech & productivity, creative & entertainment and science & learning. Unbox Therapy leads your most-watched channels with 847 views. This data spans 4 years of viewing history.",
};

export default function YouTubeAnalyzerPage() {
  const [uploadState, setUploadState] = useState('idle');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });

  const handleFileUpload = useCallback(async (files) => {
    console.log('Upload started, files:', files.length, files[0]?.name);
    setUploadState('uploading');
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Handle both FileList and Array
      const fileArray = Array.from(files);
      console.log('File array:', fileArray.map(f => f.name));
      
      for (const file of fileArray) {
        formData.append('files', file);
      }

      setUploadState('processing');
      setProgress({ current: 0, total: fileArray.length, message: 'Reading files...' });

      console.log('Sending request to /api/youtube-analyze');
      const response = await fetch('/api/youtube-analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error:', errorData);
        throw new Error(errorData.error || `Failed to process files (${response.status})`);
      }

      const result = await response.json();
      console.log('Result:', result);
      setData(result);
      setUploadState('done');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setUploadState('error');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    console.log('Drop event, files:', files.length);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    console.log('File select event, files:', files.length, files[0]?.name);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const loadDemo = () => {
    setData(DEMO_DATA);
    setUploadState('done');
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>YouTube Takeout Analyzer</h1>
            <p className={styles.subtitle}>
              Upload your Google Takeout YouTube data and discover insights about your watching habits.
            </p>
            <div className={styles.privacyBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Your data is processed securely and never stored</span>
            </div>
          </div>
        </section>

        {(uploadState === 'idle' || uploadState === 'error') && (
          <section className={styles.uploadSection}>
            <div className={styles.demoPrompt}>
              <p>No data to upload? Try the demo with sample analytics.</p>
              <button className={styles.demoButton} onClick={loadDemo}>
                View Demo
              </button>
            </div>

            <div 
              className={styles.dropZone}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className={styles.dropZoneContent}>
                <div className={styles.uploadIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <h2>Drop your YouTube Takeout files here</h2>
                <p className={styles.orText}>or</p>
                <button 
                  className={styles.fileButton}
                  onClick={() => document.getElementById('file-upload').click()}
                  type="button"
                >
                  Select Files
                </button>
                <input 
                  id="file-upload"
                  type="file" 
                  accept=".zip,.json,.csv,application/zip,application/json,text/csv"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                  multiple
                />
                <div className={styles.instructions}>
                  <h4>How to get your data:</h4>
                  <ol>
                    <li>Go to <a href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">takeout.google.com</a></li>
                    <li>Select only YouTube or YouTube Music from the products list</li>
                    <li>Download the ZIP file and upload it directly, OR</li>
                    <li>Extract the ZIP and upload individual files (watch-history.json, search-history.json, etc.)</li>
                  </ol>
                </div>
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </section>
        )}

        {(uploadState === 'uploading' || uploadState === 'processing') && (
          <section className={styles.processingSection}>
            <div className={styles.spinner}></div>
            <h2>{uploadState === 'uploading' ? 'Uploading files...' : 'Processing your data...'}</h2>
            <p className={styles.processingMessage}>{progress.message}</p>
          </section>
        )}

        {data && uploadState === 'done' && (
          <section className={styles.results}>
            <div className={styles.summaryCard}>
              <h2>Your YouTube Story</h2>
              <p className={styles.summaryText}>{data.summary}</p>
            </div>

            {/* KPI Grid */}
            <div className={styles.kpiGrid}>
              {(data.kpis || []).map((kpi) => (
                <div key={kpi.label} className={styles.kpiCard}>
                  <div className={styles.kpiValue}>{kpi.value}</div>
                  <div className={styles.kpiLabel}>{kpi.label}</div>
                  {kpi.detail && <div className={styles.kpiDetail}>{kpi.detail}</div>}
                </div>
              ))}
            </div>

            {/* Watch Trend */}
            {data.watchTrend && data.watchTrend.length > 1 && (
              <div className={styles.visualizationSection}>
                <h3>Watch Activity Over Time</h3>
                <div className={styles.trendChart}>
                  {data.watchTrend.map((point) => {
                    const maxCount = Math.max(...data.watchTrend.map(p => p.count));
                    const height = (point.count / maxCount) * 100;
                    return (
                      <div 
                        key={point.year} 
                        className={styles.trendBar}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <span className={styles.trendBarLabel}>{point.year}</span>
                        <span className={styles.trendBarValue}>{point.count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content Domains */}
            {data.taxonomy && data.taxonomy.length > 0 && (
              <div className={styles.visualizationSection}>
                <h3>Content Domains</h3>
                <div className={styles.domainGrid}>
                  {data.taxonomy.filter(t => t.percentage >= 1).map((domain) => (
                    <div 
                      key={domain.id} 
                      className={styles.domainCard}
                      style={{ borderLeftColor: domain.color }}
                    >
                      <div className={styles.domainHeader}>
                        <span className={styles.domainName}>{domain.label}</span>
                        <span className={styles.domainPercent} style={{ color: domain.color }}>
                          {domain.percentage}%
                        </span>
                      </div>
                      <div className={styles.domainStats}>
                        <span>{domain.watchCount?.toLocaleString()} watches</span>
                        {domain.searchCount > 0 && <span>{domain.searchCount} searches</span>}
                      </div>
                      <p className={styles.domainNarrative}>{domain.narrative || domain.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Heatmap */}
            {data.heatmap && data.heatmap.cells && (
              <div className={styles.visualizationSection}>
                <h3>When You Watch</h3>
                <p className={styles.categorySummary} style={{ marginBottom: '1rem' }}>
                  Your viewing patterns by day and hour. Brighter cells indicate more activity.
                </p>
                <div className={styles.heatmapGrid}>
                  {data.heatmap.dayLabels.map((day, dayIdx) => (
                    <>
                      <div key={`label-${day}`} className={styles.heatmapLabel}>{day}</div>
                      {data.heatmap.cells
                        .filter(c => c.day === dayIdx)
                        .sort((a, b) => a.hour - b.hour)
                        .map((cell) => (
                          <div
                            key={`${cell.day}-${cell.hour}`}
                            className={styles.heatmapCell}
                            style={{
                              background: `rgba(103, 193, 184, ${Math.max(cell.intensity * 0.9, 0.08)})`,
                            }}
                            title={`${cell.dayLabel} ${data.heatmap.hourLabels[cell.hour]}: ${cell.count} videos`}
                          />
                        ))}
                    </>
                  ))}
                  <div className={styles.heatmapHourLabels}>
                    {data.heatmap.hourLabels.filter((_, i) => i % 4 === 0).map((hour) => (
                      <div key={hour} className={styles.heatmapHourLabel} style={{ gridColumn: 'span 4' }}>
                        {hour.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Channels with Domain info */}
            <div className={styles.sectionGrid}>
              <div className={styles.visualizationSection}>
                <h3>Top Channels</h3>
                <div className={styles.channelList}>
                  {(data.topChannels || []).slice(0, 15).map((channel, idx) => (
                    <div key={channel.name} className={styles.channelItem}>
                      <span className={styles.channelRank}>#{idx + 1}</span>
                      <span className={styles.channelName}>{channel.name}</span>
                      <span className={styles.channelWatches}>
                        {channel.watchCount} watches
                        {channel.domain && channel.domain !== 'Other' && (
                          <span style={{ color: '#57534e', marginLeft: '0.5rem' }}>• {channel.domain}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty Creators */}
              {data.loyaltyCreators && data.loyaltyCreators.length > 0 && (
                <div className={styles.sidePanel}>
                  <h4 className={styles.sidePanelTitle}>Loyalty Creators</h4>
                  <p className={styles.categorySummary} style={{ marginBottom: '1rem' }}>
                    Channels you&apos;ve watched consistently over time.
                  </p>
                  <div className={styles.loyaltyList}>
                    {data.loyaltyCreators.slice(0, 8).map((creator) => (
                      <div key={creator.label} className={styles.loyaltyItem}>
                        <span className={styles.loyaltyName}>{creator.label}</span>
                        <span className={styles.loyaltyScore}>{creator.watchCount} watches</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Searches */}
            {data.topSearches && data.topSearches.length > 0 && (
              <div className={styles.visualizationSection}>
                <h3>Top Searches</h3>
                <div className={styles.searchTags}>
                  {data.topSearches.map((search) => (
                    <span key={search.query} className={styles.searchTag}>
                      {search.query} <span className={styles.searchCount}>{search.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comment Tone Analysis */}
            {data.comments && data.comments.total > 0 && (
              <div className={styles.visualizationSection}>
                <h3>Comment Analysis</h3>
                <p className={styles.categorySummary} style={{ marginBottom: '1rem' }}>
                  {data.comments.summary}
                </p>
                <div className={styles.toneBar}>
                  {data.comments.toneBreakdown.map((tone) => (
                    <div
                      key={tone.id}
                      className={styles.toneSegment}
                      style={{
                        flex: tone.count,
                        background: tone.color,
                      }}
                      title={`${tone.label}: ${tone.count}`}
                    />
                  ))}
                </div>
                <div className={styles.toneLegend}>
                  {data.comments.toneBreakdown.map((tone) => (
                    <div key={tone.id} className={styles.toneLegendItem}>
                      <span className={styles.toneDot} style={{ background: tone.color }} />
                      <span>{tone.label}</span>
                      <span className={styles.toneCount}>{tone.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              className={styles.resetButton}
              onClick={() => {
                setData(null);
                setUploadState('idle');
              }}
            >
              Analyze Another Export
            </button>
          </section>
        )}
      </main>
    </>
  );
}
