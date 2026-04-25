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
  categories: [
    { id: 'tech', label: 'Tech & Productivity', color: '#67c1b8', percentage: 42, summary: 'Your tech-curious mind keeps coming back for gadgets, reviews, and tutorials' },
    { id: 'creative', label: 'Creative & Entertainment', color: '#f2a65a', percentage: 28, summary: 'Animation, music, movies, and creative inspiration fill your queue' },
    { id: 'learning', label: 'Science & Learning', color: '#8fb8de', percentage: 15, summary: 'Documentaries and deep dives into how things work' },
    { id: 'gaming', label: 'Gaming & Streams', color: '#9b8de1', percentage: 10, summary: 'Let\'s plays, game reviews, and esports highlights' },
    { id: 'other', label: 'Other', color: '#57534e', percentage: 5, summary: 'The eclectic mix of everything else' },
  ],
  topChannels: [
    { name: 'Unbox Therapy', watchCount: 847 },
    { name: 'Linus Tech Tips', watchCount: 623 },
    { name: 'MKBHD', watchCount: 412 },
    { name: 'Veritasium', watchCount: 389 },
    { name: 'Nerdist', watchCount: 298 },
    { name: 'Game Grumps', watchCount: 267 },
    { name: 'Tom Scott', watchCount: 245 },
    { name: 'TED', watchCount: 223 },
    { name: 'Alie Ward', watchCount: 198 },
    { name: 'Kurzgesagt', watchCount: 187 },
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
  summary: "You've watched 69,385 videos and made 4,827 searches. Your viewing habits skew heavily toward tech reviews and productivity content. You're subscribed to 156 channels and leave comments when you have something to say. The algorithm knows you well.",
};

export default function YouTubeAnalyzerPage() {
  const [uploadState, setUploadState] = useState('idle');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });

  const handleFileUpload = useCallback(async (files) => {
    setUploadState('uploading');
    setError(null);
    
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      setUploadState('processing');
      setProgress({ current: 0, total: files.length, message: 'Reading files...' });

      const response = await fetch('/api/youtube-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process files');
      }

      const result = await response.json();
      setData(result);
      setUploadState('done');
    } catch (err) {
      setError(err.message);
      setUploadState('error');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
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
              <span>Your data never leaves your browser</span>
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
                <h2>Drop your YouTube Takeout ZIP file here</h2>
                <p className={styles.orText}>or</p>
                <label className={styles.fileButton}>
                  <input 
                    type="file" 
                    accept=".zip"
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                  />
                  Select ZIP File
                </label>
                <div className={styles.instructions}>
                  <h4>How to get your data:</h4>
                  <ol>
                    <li>Go to <a href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">takeout.google.com</a></li>
                    <li>Select only YouTube or YouTube Music from the products list</li>
                    <li>Download and extract the ZIP file</li>
                    <li>Re-zip the YouTube folder inside (or upload the extracted folder directly)</li>
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

            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>{data.stats.watchEvents.toLocaleString()}</div>
                <div className={styles.kpiLabel}>Videos Watched</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>{data.stats.searchEvents.toLocaleString()}</div>
                <div className={styles.kpiLabel}>Searches</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>{data.stats.subscriptions.toLocaleString()}</div>
                <div className={styles.kpiLabel}>Subscriptions</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>{data.stats.comments.toLocaleString()}</div>
                <div className={styles.kpiLabel}>Comments</div>
              </div>
            </div>

            <div className={styles.visualizationSection}>
              <h3>Content Categories</h3>
              <div className={styles.categoryList}>
                {data.categories.map((cat) => (
                  <div key={cat.id} className={styles.categoryItem}>
                    <div className={styles.categoryHeader}>
                      <span className={styles.categoryDot} style={{ background: cat.color }}></span>
                      <span className={styles.categoryName}>{cat.label}</span>
                      <span className={styles.categoryPercent}>{cat.percentage}%</span>
                    </div>
                    <div className={styles.categoryBar}>
                      <div 
                        className={styles.categoryFill} 
                        style={{ width: `${cat.percentage}%`, background: cat.color }}
                      />
                    </div>
                    <p className={styles.categorySummary}>{cat.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.visualizationSection}>
              <h3>Top Channels</h3>
              <div className={styles.channelList}>
                {data.topChannels.slice(0, 10).map((channel, idx) => (
                  <div key={channel.name} className={styles.channelItem}>
                    <span className={styles.channelRank}>#{idx + 1}</span>
                    <span className={styles.channelName}>{channel.name}</span>
                    <span className={styles.channelWatches}>{channel.watchCount} watches</span>
                  </div>
                ))}
              </div>
            </div>

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