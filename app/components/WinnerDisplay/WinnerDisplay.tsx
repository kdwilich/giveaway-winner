'use client';

import { Winner } from '@/types/giveaway';
import styles from './WinnerDisplay.module.scss';
import { useState } from 'react';
import Image from 'next/image';

interface WinnerDisplayProps {
  winners: Winner[];
  totalEntries: number;
  uniqueUsers: number;
  shareGradient: string;
}

export default function WinnerDisplay({ winners, totalEntries, uniqueUsers, shareGradient }: WinnerDisplayProps) {
  const [showShareView, setShowShareView] = useState(false);
  const [expandedWinners, setExpandedWinners] = useState<Set<number>>(new Set());
  const [showShareLink, setShowShareLink] = useState(false);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedWinners);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedWinners(newExpanded);
  };

  const generateShareLink = () => {
    const data = {
      winners: winners.map(w => ({ username: w.username, entries: w.totalEntries })),
      totalEntries,
      uniqueUsers,
      gradient: shareGradient
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}/share?data=${encoded}`;
    
    navigator.clipboard.writeText(url);
    setShowShareLink(true);
    setTimeout(() => setShowShareLink(false), 3000);
  };

  const copyWinners = () => {
    const text = winners.map((w, i) => `${i + 1}. @${w.username}`).join('\n');
    navigator.clipboard.writeText(text);
  };
  
  const openShareView = () => {
    setShowShareView(true);
    // Set theme-color meta tag to black for mobile status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#000000');
    }
  };
  
  const closeShareView = () => {
    setShowShareView(false);
    // Reset theme-color meta tag to original color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#a88bfb');
    }
  };
  
  // Calculate statistics
  const winRate = ((winners.length / uniqueUsers) * 100).toFixed(2);
  const averageEntriesPerUser = (totalEntries / uniqueUsers).toFixed(1);

  return (
    <>
      <div className={styles['winner-display__container']}>
        <div className={styles['winner-display__header']}>
          <h2>🎉 Winners Selected! 🎉</h2>
          <div className={styles['winner-display__header-stats']}>
            {winners.length} winner{winners.length !== 1 ? 's' : ''} selected from {totalEntries} total entries
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className={styles['winner-display__stats']}>
          <div className={styles['winner-display__stat']}>
            <div className={styles['winner-display__stat-value']}>{totalEntries}</div>
            <div className={styles['winner-display__stat-label']}>Total Entries</div>
          </div>
          <div className={styles['winner-display__stat']}>
            <div className={styles['winner-display__stat-value']}>{uniqueUsers}</div>
            <div className={styles['winner-display__stat-label']}>Unique Participants</div>
          </div>
          <div className={styles['winner-display__stat']}>
            <div className={styles['winner-display__stat-value']}>{averageEntriesPerUser}</div>
            <div className={styles['winner-display__stat-label']}>Avg. Entries/User</div>
          </div>
          <div className={styles['winner-display__stat']}>
            <div className={styles['winner-display__stat-value']}>{winRate}%</div>
            <div className={styles['winner-display__stat-label']}>Win Rate</div>
          </div>
        </div>

        <div className={`${styles['winner-display__list']} ${winners.length === 1 ? styles['winner-display__list--single'] : ''}`}>
          {winners.map((winner, index) => {
            const isExpanded = expandedWinners.has(index);
            return (
              <div key={`${winner.username}-${index}`} className={styles['winner-display__winner']}>
                <div className={styles['winner-display__winner-header']}>
                  <div className={styles['winner-display__winner-info']}>
                    <div className={styles['winner-display__winner-rank']}>
                      {index + 1}
                    </div>
                    <div className={styles['winner-display__winner-details']}>
                      <h3>@{winner.username}</h3>
                      <p>
                        {winner.totalEntries} {winner.totalEntries === 1 ? 'entry' : 'entries'} • 
                        {' '}{((winner.totalEntries / totalEntries) * 100).toFixed(2)}% chance to win
                      </p>
                    </div>
                  </div>
                  <div className={styles['winner-display__winner-actions']}>
                    <div className={styles['winner-display__winner-badge']}>
                      Winner
                    </div>
                    <button
                      onClick={() => toggleExpanded(index)}
                      className={styles['winner-display__expand-button']}
                      aria-label="Toggle entries"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {isExpanded && winner.entries && winner.entries.length > 0 && (
                  <div className={styles['winner-display__entries']}>
                    <h4>Entries ({winner.entries.length}):</h4>
                    <div className={styles['winner-display__entries-list']}>
                      {winner.entries.map((entry, entryIndex) => (
                        <div key={entryIndex} className={styles['winner-display__entry']}>
                          {entry.comment ? (
                            <>
                              <div className={styles['winner-display__entry-comment']}>&ldquo;{entry.comment}&rdquo;</div>
                              {entry.tags && entry.tags.length > 0 && (
                                <div className={styles['winner-display__entry-tags']}>
                                  Tag: @{entry.tags[0]}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className={styles['winner-display__entry-manual']}>Manual Entry</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isExpanded && (!winner.entries || winner.entries.length === 0) && (
                  <div className={styles['winner-display__entries']}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      No entry details available.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles['winner-display__actions']}>
          <button
            onClick={copyWinners}
            className={`${styles['winner-display__button']} ${styles['winner-display__button--secondary']}`}
          >
            📋 Copy Winners
          </button>
          <button
            onClick={generateShareLink}
            className={`${styles['winner-display__button']} ${styles['winner-display__button--secondary']}`}
          >
            {showShareLink ? '✓ Link Copied!' : '🔗 Share Link'}
          </button>
          <button
            onClick={openShareView}
            className={`${styles['winner-display__button']} ${styles['winner-display__button--primary']}`}
          >
            📸 Open Share View
          </button>
        </div>
      </div>

      {/* Fullscreen Share View */}
      {showShareView && (
        <div className={styles['share-view']} onClick={closeShareView}>
          <div className={styles['share-view__content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['share-view__card']} style={{ background: shareGradient }}>
              <div className={styles['share-view__header']}>
                <h1>🎉 Giveaway {winners.length === 1 ? 'Winner' : 'Winners'} 🎉</h1>
              </div>
              
              <div className={styles['share-view__stats']}>
                <div className={styles['share-view__stat']}>
                  <div className={styles['share-view__stat-value']}>{totalEntries}</div>
                  <div className={styles['share-view__stat-label']}>Total Entries</div>
                </div>
                <div className={styles['share-view__stat']}>
                  <div className={styles['share-view__stat-value']}>{uniqueUsers}</div>
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

              <div className={`${styles['share-view__winners']} ${winners.length > 5 ? styles['share-view__winners--condensed'] : ''}`}>
                {winners.map((winner, index) => (
                  <div key={`${winner.username}-${index}`} className={styles['share-view__winner']}>
                    <div className={styles['share-view__winner-rank']}>
                      {index + 1}
                    </div>
                    <div className={styles['share-view__winner-info']}>
                      <div className={styles['share-view__winner-name']}>
                        @{winner.username}
                      </div>
                      {winners.length <= 5 && (
                        <div className={styles['share-view__winner-stats']}>
                          {winner.totalEntries} {winner.totalEntries === 1 ? 'entry' : 'entries'} • {((winner.totalEntries / totalEntries) * 100).toFixed(1)}% chance
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles['share-view__footer']}>
                Congratulations! 🎊
              </div>

              <div className={styles['share-view__watermark']}>
                <Image src="/luckypick.png" alt="Lucky Pick" width={40} height={40} className={styles['share-view__watermark-icon']} />
                <span>LuckyPick.win</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
