'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import styles from '../components/WinnerDisplay/WinnerDisplay.module.scss';

interface ShareWinner {
  username: string;
  entries: number;
}

interface ShareData {
  winners: ShareWinner[];
  totalEntries: number;
  uniqueUsers: number;
  gradient: string;
}

function ShareContent() {
  const searchParams = useSearchParams();
  
  const { data, error } = useMemo(() => {
    const encoded = searchParams.get('data');
    if (!encoded) {
      return { data: null, error: 'No data found in URL' };
    }
    
    try {
      const decoded = JSON.parse(atob(encoded));
      return { data: decoded as ShareData, error: '' };
    } catch {
      return { data: null, error: 'Invalid share link' };
    }
  }, [searchParams]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ {error}</h1>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Please check your link and try again.</p>
        <Link href="/" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Go to Giveaway Picker</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '50px', height: '50px', margin: '0 auto 1rem', border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  const winRate = ((data.winners.length / data.uniqueUsers) * 100).toFixed(2);
  const averageEntriesPerUser = (data.totalEntries / data.uniqueUsers).toFixed(1);

  return (
    <div className={styles['share-view']}>
      <div className={styles['share-view__content']}>
        <div className={styles['share-view__card']} style={{ background: data.gradient }}>
          <div className={styles['share-view__header']}>
            <h1>🎉 Giveaway {data.winners.length === 1 ? 'Winner' : 'Winners'} 🎉</h1>
          </div>
          
          <div className={styles['share-view__stats']}>
            <div className={styles['share-view__stat']}>
              <div className={styles['share-view__stat-value']}>{data.totalEntries}</div>
              <div className={styles['share-view__stat-label']}>Total Entries</div>
            </div>
            <div className={styles['share-view__stat']}>
              <div className={styles['share-view__stat-value']}>{data.uniqueUsers}</div>
              <div className={styles['share-view__stat-label']}>Participants</div>
            </div>
            <div className={styles['share-view__stat']}>
              <div className={styles['share-view__stat-value']}>{averageEntriesPerUser}</div>
              <div className={styles['share-view__stat-label']}>Avg. Entries</div>
            </div>
            <div className={styles['share-view__stat']}>
              <div className={styles['share-view__stat-value']}>{winRate}%</div>
              <div className={styles['share-view__stat-label']}>Win Rate</div>
            </div>
          </div>

          <div className={`${styles['share-view__winners']} ${data.winners.length > 5 ? styles['share-view__winners--condensed'] : ''}`}>
            {data.winners.map((winner, index) => (
              <div key={`${winner.username}-${index}`} className={styles['share-view__winner']}>
                <div className={styles['share-view__winner-rank']}>
                  {index + 1}
                </div>
                <div className={styles['share-view__winner-info']}>
                  <div className={styles['share-view__winner-name']}>
                    @{winner.username}
                  </div>
                  {data.winners.length <= 5 && (
                    <div className={styles['share-view__winner-stats']}>
                      {winner.entries} {winner.entries === 1 ? 'entry' : 'entries'} • {((winner.entries / data.totalEntries) * 100).toFixed(1)}% chance
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles['share-view__footer']}>
            Congratulations! 🎊
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '50px', height: '50px', margin: '0 auto 1rem', border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
