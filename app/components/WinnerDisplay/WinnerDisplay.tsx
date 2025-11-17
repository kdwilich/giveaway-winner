'use client';

import { Winner } from '@/types/giveaway';
import styles from './WinnerDisplay.module.scss';
import { useState } from 'react';

interface WinnerDisplayProps {
  winners: Winner[];
  totalEntries: number;
  uniqueUsers: number;
  shareGradient: string;
}

export default function WinnerDisplay({ winners, totalEntries, uniqueUsers, shareGradient }: WinnerDisplayProps) {
  const [showShareView, setShowShareView] = useState(false);

  const copyWinners = () => {
    const text = winners.map((w, i) => `${i + 1}. @${w.username}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const shareToInstagram = () => {
    const text = winners.map((w, i) => `${i + 1}. @${w.username}`).join('\n');
    const shareText = `🎉 Giveaway Winners! 🎉\n\n${text}\n\nCongratulations! 🎊`;
    
    // Copy to clipboard for easy sharing
    navigator.clipboard.writeText(shareText);
    alert('Winners copied to clipboard! You can now paste in Instagram Stories.');
  };
  
  const openShareView = () => {
    setShowShareView(true);
  };
  
  const closeShareView = () => {
    setShowShareView(false);
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

        <div className={styles['winner-display__list']}>
          {winners.map((winner, index) => (
            <div key={`${winner.username}-${index}`} className={styles['winner-display__winner']}>
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
              <div className={styles['winner-display__winner-badge']}>
                Winner
              </div>
            </div>
          ))}
        </div>

        <div className={styles['winner-display__actions']}>
          <button
            onClick={copyWinners}
            className={`${styles['winner-display__button']} ${styles['winner-display__button--secondary']}`}
          >
            📋 Copy Winners
          </button>
          <button
            onClick={shareToInstagram}
            className={`${styles['winner-display__button']} ${styles['winner-display__button--secondary']}`}
          >
            📱 Copy for Instagram Story
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
                <h1>🎉 Giveaway Winners 🎉</h1>
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

              <div className={styles['share-view__winners']}>
                {winners.map((winner, index) => (
                  <div key={`${winner.username}-${index}`} className={styles['share-view__winner']}>
                    <div className={styles['share-view__winner-rank']}>
                      {index + 1}
                    </div>
                    <div className={styles['share-view__winner-info']}>
                      <div className={styles['share-view__winner-name']}>
                        @{winner.username}
                      </div>
                      <div className={styles['share-view__winner-stats']}>
                        {winner.totalEntries} {winner.totalEntries === 1 ? 'entry' : 'entries'} • {((winner.totalEntries / totalEntries) * 100).toFixed(1)}% chance
                      </div>
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
      )}
    </>
  );
}
