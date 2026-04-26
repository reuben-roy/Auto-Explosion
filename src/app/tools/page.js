import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export const metadata = {
  title: 'Tools | explosion.fun',
  description: 'Free interactive tools for data visualization and discovery',
};

const tools = [
  {
    id: 'youtube-analyzer',
    name: 'YouTube Takeout Analyzer',
    description: 'Upload your Google Takeout YouTube data export and discover insights about your watching habits, interests, and patterns.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    href: '/tools/youtube-analyzer',
    status: 'demo',
    category: 'Analytics',
  },
  {
    id: 'goal-alignment',
    name: 'Goal Alignment Check',
    description: 'Are you actually working towards your goals? Enter your life goals and upload your YouTube data to see if your actions match your intentions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    href: '/tools/goal-alignment',
    status: 'live',
    category: 'Self-Reflection',
  },
  {
    id: 'csv-visualizer',
    name: 'CSV Visualizer',
    description: 'Upload any CSV file and transform it into animated, interactive visualizations. Perfect for exploring datasets and telling data stories.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    href: '/tools/csv-visualizer',
    status: 'coming-soon',
    category: 'Data Visualization',
  },
  {
    id: 'map-migration',
    name: 'Map My Migration',
    description: 'Upload your GPS location history and discover how your travel patterns compare to bird migration routes around the world.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    href: '/tools/map-migration',
    status: 'coming-soon',
    category: 'Geography',
  },
];

const statusLabels = {
  'live': 'Live',
  'demo': 'Demo Mode',
  'coming-soon': 'Coming Soon',
};

const statusColors = {
  'live': styles.statusLive,
  'demo': styles.statusDemo,
  'coming-soon': styles.statusComingSoon,
};

export default function ToolsPage() {
  return (
    <main className={styles.main}>
      <Navbar />
      
      <section className={styles.hero}>
        <h1>Explosion Tools</h1>
        <p className={styles.subtitle}>
          Interactive data tools that help you discover insights you never knew existed.
          <br />
          Upload your data, explore patterns, and share what you find.
        </p>
      </section>

      <section className={styles.toolsGrid}>
        {tools.map((tool) => (
          <Link 
            key={tool.id} 
            href={tool.href}
            className={`${styles.toolCard} ${tool.status === 'coming-soon' ? styles.toolCardDisabled : ''}`}
          >
            <div className={styles.toolIcon}>{tool.icon}</div>
            <div className={styles.toolContent}>
              <div className={styles.toolHeader}>
                <h2>{tool.name}</h2>
                <span className={`${styles.status} ${statusColors[tool.status]}`}>
                  {statusLabels[tool.status]}
                </span>
              </div>
              <span className={styles.category}>{tool.category}</span>
              <p className={styles.description}>{tool.description}</p>
              {tool.status === 'coming-soon' && (
                <div className={styles.comingSoonBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Arriving soon
                </div>
              )}
            </div>
          </Link>
        ))}
      </section>

      <section className={styles.cta}>
        <h2>Have an idea for a tool?</h2>
        <p>
          We&apos;re always looking to build tools that solve real problems.
          <br />
          Let us know what data visualization you&apos;d like to see.
        </p>
        <Link href="/side-track/support" className={styles.ctaButton}>
          Suggest a Tool
        </Link>
      </section>
    </main>
  );
}
