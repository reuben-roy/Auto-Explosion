'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

const GOAL_PROMPTS = [
  {
    id: 'career',
    label: 'Career & Professional',
    placeholder: 'e.g., Become a senior software engineer, start my own business, switch to product management...',
    icon: '💼',
  },
  {
    id: 'learning',
    label: 'Learning & Skills',
    placeholder: 'e.g., Learn machine learning, become fluent in Spanish, master video editing...',
    icon: '📚',
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    placeholder: 'e.g., Run a marathon, lose 20 pounds, build a consistent gym routine...',
    icon: '💪',
  },
  {
    id: 'creative',
    label: 'Creative & Personal',
    placeholder: 'e.g., Write a novel, learn guitar, build a YouTube channel...',
    icon: '🎨',
  },
  {
    id: 'financial',
    label: 'Financial',
    placeholder: 'e.g., Save $50k, invest in index funds, pay off student loans...',
    icon: '💰',
  },
];

export default function GoalAlignmentPage() {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState({});
  const [uploadState, setUploadState] = useState('idle');
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [dataPreview, setDataPreview] = useState(null);

  const handleGoalChange = (id, value) => {
    setGoals(prev => ({ ...prev, [id]: value }));
  };

  const hasGoals = Object.values(goals).some(g => g && g.trim().length > 0);

  const handleFileUpload = useCallback(async (files) => {
    setUploadState('uploading');
    setError(null);
    
    try {
      const formData = new FormData();
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        formData.append('files', file);
      }
      formData.append('goals', JSON.stringify(goals));

      setUploadState('processing');

      const response = await fetch('/api/goal-alignment/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to process (${response.status})`);
      }

      const result = await response.json();
      setDataPreview(result.dataPreview);
      setAnalysis(result.analysis);
      setStep(3);
      setUploadState('done');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setUploadState('error');
    }
  }, [goals]);

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

  const resetAll = () => {
    setStep(1);
    setGoals({});
    setUploadState('idle');
    setError(null);
    setAnalysis(null);
    setDataPreview(null);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Goal Alignment Check</h1>
            <p className={styles.subtitle}>
              Are you actually working towards your goals, or just telling yourself you are?
              <br />
              Let your data reveal the truth.
            </p>
          </div>
          
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${step >= 3 ? styles.stepActive : ''}`}>3</div>
          </div>
          <div className={styles.stepLabels}>
            <span>Set Goals</span>
            <span>Upload Data</span>
            <span>Get Truth</span>
          </div>
        </section>

        {/* Step 1: Goal Input */}
        {step === 1 && (
          <section className={styles.goalsSection}>
            <div className={styles.sectionIntro}>
              <h2>What are you working towards?</h2>
              <p>Be honest. Write down your actual goals, not what sounds impressive. The more specific, the better the analysis.</p>
            </div>

            <div className={styles.goalsGrid}>
              {GOAL_PROMPTS.map((prompt) => (
                <div key={prompt.id} className={styles.goalCard}>
                  <label className={styles.goalLabel}>
                    <span className={styles.goalIcon}>{prompt.icon}</span>
                    {prompt.label}
                  </label>
                  <textarea
                    className={styles.goalInput}
                    placeholder={prompt.placeholder}
                    value={goals[prompt.id] || ''}
                    onChange={(e) => handleGoalChange(prompt.id, e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
            </div>

            <div className={styles.stepActions}>
              <button
                className={styles.primaryButton}
                onClick={() => setStep(2)}
                disabled={!hasGoals}
              >
                Continue to Upload
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              {!hasGoals && (
                <p className={styles.hint}>Enter at least one goal to continue</p>
              )}
            </div>
          </section>
        )}

        {/* Step 2: Upload */}
        {step === 2 && (uploadState === 'idle' || uploadState === 'error') && (
          <section className={styles.uploadSection}>
            <div className={styles.goalsPreview}>
              <h3>Your Goals</h3>
              <div className={styles.goalsList}>
                {GOAL_PROMPTS.filter(p => goals[p.id]?.trim()).map(p => (
                  <div key={p.id} className={styles.goalPreviewItem}>
                    <span className={styles.goalIcon}>{p.icon}</span>
                    <div>
                      <strong>{p.label}</strong>
                      <p>{goals[p.id]}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles.editButton} onClick={() => setStep(1)}>
                Edit Goals
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
                <h2>Now upload your YouTube Takeout</h2>
                <p className={styles.uploadSubtext}>Your watch history will reveal what you actually spend time on</p>
                <p className={styles.orText}>or</p>
                <button 
                  className={styles.fileButton}
                  onClick={() => document.getElementById('file-upload-goal').click()}
                  type="button"
                >
                  Select Files
                </button>
                <input 
                  id="file-upload-goal"
                  type="file" 
                  accept=".zip,.json,application/zip,application/json"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                  multiple
                />
                <div className={styles.instructions}>
                  <p>Get your data from <a href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer">takeout.google.com</a> → select YouTube</p>
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

        {/* Processing State */}
        {(uploadState === 'uploading' || uploadState === 'processing') && (
          <section className={styles.processingSection}>
            <div className={styles.spinner}></div>
            <h2>{uploadState === 'uploading' ? 'Uploading...' : 'Analyzing your alignment...'}</h2>
            <p className={styles.processingMessage}>
              {uploadState === 'processing' && 'Comparing your stated goals against your actual behavior patterns...'}
            </p>
          </section>
        )}

        {/* Step 3: Results */}
        {step === 3 && analysis && (
          <section className={styles.results}>
            <div className={styles.verdictCard}>
              <div className={styles.verdictHeader}>
                <span className={styles.verdictEmoji}>{analysis.verdictEmoji}</span>
                <h2>{analysis.verdictTitle}</h2>
              </div>
              <p className={styles.verdictSummary}>{analysis.verdictSummary}</p>
            </div>

            <div className={styles.alignmentScore}>
              <div className={styles.scoreCircle}>
                <svg viewBox="0 0 100 100" className={styles.scoreRing}>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke={analysis.alignmentScore >= 60 ? '#67c1b8' : analysis.alignmentScore >= 30 ? '#f2a65a' : '#d96459'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${analysis.alignmentScore * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className={styles.scoreValue}>{analysis.alignmentScore}%</div>
              </div>
              <div className={styles.scoreLabel}>Goal Alignment</div>
            </div>

            {dataPreview && (
              <div className={styles.dataInsights}>
                <h3>What Your Data Shows</h3>
                <div className={styles.insightGrid}>
                  <div className={styles.insightCard}>
                    <div className={styles.insightValue}>{dataPreview.totalVideos?.toLocaleString()}</div>
                    <div className={styles.insightLabel}>Videos Watched</div>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightValue}>{dataPreview.topDomain}</div>
                    <div className={styles.insightLabel}>Top Category</div>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightValue}>{dataPreview.totalSearches?.toLocaleString()}</div>
                    <div className={styles.insightLabel}>Searches</div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.analysisSection}>
              <h3>Detailed Analysis</h3>
              <div className={styles.analysisContent}>
                {analysis.goalAnalysis?.map((item, idx) => (
                  <div key={idx} className={styles.goalAnalysisItem}>
                    <div className={styles.goalAnalysisHeader}>
                      <span className={styles.goalIcon}>{item.icon}</span>
                      <span className={styles.goalName}>{item.goal}</span>
                      <span 
                        className={styles.goalScore}
                        style={{ 
                          color: item.alignment >= 60 ? '#67c1b8' : item.alignment >= 30 ? '#f2a65a' : '#d96459' 
                        }}
                      >
                        {item.alignment}%
                      </span>
                    </div>
                    <p className={styles.goalFeedback}>{item.feedback}</p>
                    {item.evidence && (
                      <div className={styles.evidence}>
                        <strong>Evidence:</strong> {item.evidence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {analysis.recommendations && (
              <div className={styles.recommendationsSection}>
                <h3>Recommendations</h3>
                <ul className={styles.recommendationsList}>
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.hardTruth && (
              <div className={styles.hardTruthSection}>
                <h3>The Hard Truth</h3>
                <p>{analysis.hardTruth}</p>
              </div>
            )}

            <button className={styles.resetButton} onClick={resetAll}>
              Start Over
            </button>
          </section>
        )}
      </main>
    </>
  );
}
