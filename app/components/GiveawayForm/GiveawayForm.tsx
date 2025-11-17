'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { GiveawayCriteria, InstagramComment, Winner } from '@/types/giveaway';
import { processEntries, selectWinners } from '@/lib/giveawayLogic';
import styles from './GiveawayForm.module.scss';
import WinnerDisplay from '../WinnerDisplay/WinnerDisplay';

const THEME_GRADIENTS = [
  { name: 'Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Blue', gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' },
  { name: 'Green', gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' },
  { name: 'Orange', gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' },
  { name: 'Pink', gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)' },
  { name: 'Teal', gradient: 'linear-gradient(135deg, #009688 0%, #00796B 100%)' },
  { name: 'Red', gradient: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)' },
  { name: 'Indigo', gradient: 'linear-gradient(135deg, #3F51B5 0%, #303F9F 100%)' },
];

export default function GiveawayForm() {
  const { data: session, status } = useSession();
  const [inputMode, setInputMode] = useState<'url' | 'csv'>('url');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [customHex, setCustomHex] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [criteria, setCriteria] = useState<GiveawayCriteria>({
    postUrl: '',
    numberOfWinners: 1,
    uniqueEntriesOnly: false,
    maxEntriesPerUser: 0,
    requireTag: true,
    manualEntries: [],
  });
  
  const [manualEntriesText, setManualEntriesText] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvComments, setCsvComments] = useState<InstagramComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [error, setError] = useState('');
  const [totalEntries, setTotalEntries] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);

  // Extract primary color from gradient for app theming
  const extractPrimaryColor = (gradient: string): string => {
    const match = gradient.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : '#8b5cf6';
  };

  // Update CSS variables when theme changes
  const updateAppTheme = (gradient: string) => {
    const primaryColor = extractPrimaryColor(gradient);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    
    // Adjust hover color (slightly darker)
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);
    const hoverColor = `#${Math.max(0, r - 20).toString(16).padStart(2, '0')}${Math.max(0, g - 20).toString(16).padStart(2, '0')}${Math.max(0, b - 20).toString(16).padStart(2, '0')}`;
    document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
    
    // Add alpha version for shadows
    document.documentElement.style.setProperty('--color-primary-alpha', `${primaryColor}40`);
  };

  // Handle theme selection
  const handleThemeSelect = (index: number) => {
    setSelectedTheme(index);
    setShowCustomInput(false);
    updateAppTheme(THEME_GRADIENTS[index].gradient);
  };

  // Handle custom hex input
  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomHex(value);
    
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const customGradient = `linear-gradient(135deg, ${value} 0%, ${value} 100%)`;
      updateAppTheme(customGradient);
    }
  };

  // Get current gradient for share view
  const getCurrentGradient = () => {
    if (showCustomInput && /^#[0-9A-Fa-f]{6}$/.test(customHex)) {
      return `linear-gradient(135deg, ${customHex} 0%, ${customHex} 100%)`;
    }
    return THEME_GRADIENTS[selectedTheme].gradient;
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    setError('');
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      // Find column indices
      const usernameIdx = headers.findIndex(h => h.includes('username'));
      const commentIdx = headers.findIndex(h => h.includes('comment'));
      const timestampIdx = headers.findIndex(h => h.includes('timestamp'));
      
      if (usernameIdx === -1 || commentIdx === -1) {
        throw new Error('CSV must have "username" and "comment_text" columns');
      }
      
      const comments: InstagramComment[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (handle quoted fields)
        const fields: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"') {
            if (inQuotes && line[j + 1] === '"') {
              currentField += '"';
              j++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            fields.push(currentField);
            currentField = '';
          } else {
            currentField += char;
          }
        }
        fields.push(currentField);
        
        const username = fields[usernameIdx]?.trim();
        const text = fields[commentIdx]?.trim();
        const timestamp = timestampIdx >= 0 ? fields[timestampIdx]?.trim() : undefined;
        
        if (username && text) {
          comments.push({
            id: `csv-${i}`,
            text,
            username,
            timestamp: timestamp || '',
          });
        }
      }
      
      setCsvComments(comments);
      setError(`✓ Loaded ${comments.length} comments from CSV`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV');
      setCsvFile(null);
      setCsvComments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWinners([]);
    setLoading(true);

    try {
      let comments: InstagramComment[] = [];
      
      // Use CSV comments if uploaded
      if (inputMode === 'csv' && csvComments.length > 0) {
        comments = csvComments;
      }
      // Fetch Instagram comments if URL provided
      else if (criteria.postUrl && criteria.postUrl.trim()) {
        const response = await fetch('/api/instagram/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postUrl: criteria.postUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch comments');
        }

        const data = await response.json();
        comments = data.comments;
      }

      // Parse manual entries
      const manualEntries = manualEntriesText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const criteriaWithManual = {
        ...criteria,
        manualEntries,
      };

      // Process entries and select winners
      const entries = processEntries(comments, criteriaWithManual);
      
      console.log('Processing results:', {
        totalComments: comments.length,
        totalEntries: entries.length,
        requireTag: criteriaWithManual.requireTag,
        sampleComments: comments.slice(0, 5).map(c => ({
          username: c.username || c.from?.username,
          text: c.text,
          tags: c.text.match(/@(\w+)/g)
        }))
      });
      
      setTotalEntries(entries.length);
      
      // Calculate unique users
      const uniqueUsernames = new Set(entries.map(e => e.username));
      setUniqueUsers(uniqueUsernames.size);
      
      if (entries.length === 0) {
        setError('No entries found. Please check your criteria or add manual entries.');
        return;
      }

      const selectedWinners = selectWinners(entries, criteriaWithManual);
      setWinners(selectedWinners);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles['giveaway-form__container']}>
        <div className={styles['giveaway-form__card']}>
          <div className={styles['giveaway-form__loading']}>
            <div className={styles['giveaway-form__loading-spinner']} />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles['giveaway-form__container']}>
        <div className={styles['giveaway-form__card']}>
          <div className={styles['giveaway-form__auth']}>
            <h1>Instagram Giveaway Picker</h1>
            <p>Connect your Instagram account to fetch comments and pick winners</p>
            <button
              onClick={() => signIn('instagram')}
              className={`${styles['giveaway-form__button']} ${styles['giveaway-form__button--primary']}`}
            >
              Connect Instagram
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['giveaway-form__container']}>
      <div className={styles['giveaway-form__card']}>
        <div className={styles['giveaway-form__header']}>          
          <h1>Instagram Giveaway Picker</h1>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={styles['giveaway-form__settings-button']}
            title="Color Settings"
          >
            ⚙️
          </button>
        </div>

        {showSettings && (
          <div className={styles['giveaway-form__settings-panel']}>
            <div className={styles['giveaway-form__settings-header']}>
              <h3>Color Theme</h3>
            </div>
            <div className={styles['giveaway-form__theme-options']}>
              {THEME_GRADIENTS.map((theme, index) => (
                <button
                  key={theme.name}
                  type="button"
                  className={`${styles['giveaway-form__theme-option']} ${selectedTheme === index && !showCustomInput ? styles['giveaway-form__theme-option--active'] : ''}`}
                  style={{ background: theme.gradient }}
                  onClick={() => handleThemeSelect(index)}
                  title={theme.name}
                />
              ))}
              <button
                type="button"
                className={`${styles['giveaway-form__theme-option']} ${styles['giveaway-form__theme-option--custom']} ${showCustomInput ? styles['giveaway-form__theme-option--active'] : ''}`}
                onClick={() => setShowCustomInput(!showCustomInput)}
                title="Custom Color"
              >
                +
              </button>
            </div>
            {showCustomInput && (
              <div className={styles['giveaway-form__custom-hex']}>
                <label htmlFor="custom-hex">Custom Hex Color:</label>
                <input
                  id="custom-hex"
                  type="text"
                  placeholder="#8b5cf6"
                  value={customHex}
                  onChange={handleCustomHexChange}
                  maxLength={7}
                />
              </div>
            )}
          </div>
        )}

        <div className={styles['giveaway-form__user-info']}>
          <p>Connected as @{session.user?.name}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className={`${styles['giveaway-form__button']} ${styles['giveaway-form__button--secondary']}`}
          >
            Disconnect
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles['giveaway-form__field']}>
            <label>Input Method</label>
            <div className={styles['giveaway-form__radio-group']}>
              <div className={styles['giveaway-form__radio']}>
                <input
                  type="radio"
                  id="inputUrl"
                  name="inputMode"
                  checked={inputMode === 'url'}
                  onChange={() => setInputMode('url')}
                />
                <label htmlFor="inputUrl">Instagram URL</label>
              </div>
              <div className={styles['giveaway-form__radio']}>
                <input
                  type="radio"
                  id="inputCsv"
                  name="inputMode"
                  checked={inputMode === 'csv'}
                  onChange={() => setInputMode('csv')}
                />
                <label htmlFor="inputCsv">Upload CSV</label>
              </div>
            </div>
          </div>

          {inputMode === 'url' ? (
            <div className={styles['giveaway-form__field']}>
              <label htmlFor="postUrl">Instagram Post URL</label>
              <input
                type="text"
                id="postUrl"
                placeholder="https://www.instagram.com/p/..."
                value={criteria.postUrl}
                onChange={(e) => setCriteria({ ...criteria, postUrl: e.target.value })}
              />
              <div className={styles['giveaway-form__help-text']}>
                Paste the Instagram post URL to fetch comments
              </div>
            </div>
          ) : (
            <div className={styles['giveaway-form__field']}>
              <label htmlFor="csvFile">Upload CSV File</label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleCsvUpload}
              />
              <div className={styles['giveaway-form__help-text']}>
                Upload CSV from Chrome extension with columns: username, comment_text, timestamp
                {csvComments.length > 0 && ` (${csvComments.length} comments loaded)`}
              </div>
            </div>
          )}

          <div className={styles['giveaway-form__field']}>
            <label htmlFor="manualEntries">Manual Entries (one username per line)</label>
            <textarea
              id="manualEntries"
              placeholder="username1&#10;username2&#10;username3"
              value={manualEntriesText}
              onChange={(e) => setManualEntriesText(e.target.value)}
            />
            <div className={styles['giveaway-form__help-text']}>
              Add bonus entries or entries from other sources
            </div>
          </div>

          <div className={styles['giveaway-form__field']}>
            <label htmlFor="numberOfWinners">Number of Winners</label>
            <input
              type="number"
              id="numberOfWinners"
              min="1"
              value={criteria.numberOfWinners}
              onChange={(e) => setCriteria({ ...criteria, numberOfWinners: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className={styles['giveaway-form__checkbox-group']}>
            <div className={styles['giveaway-form__checkbox']}>
              <input
                type="checkbox"
                id="uniqueEntries"
                checked={criteria.uniqueEntriesOnly}
                onChange={(e) => setCriteria({
                  ...criteria,
                  uniqueEntriesOnly: e.target.checked,
                  maxEntriesPerUser: e.target.checked ? 1 : criteria.maxEntriesPerUser,
                })}
              />
              <label htmlFor="uniqueEntries">Unique entries only (one entry per user)</label>
            </div>

            {!criteria.uniqueEntriesOnly && (
              <div className={styles['giveaway-form__field']}>
                <label htmlFor="maxEntries">Max entries per user (0 = unlimited)</label>
                <input
                  type="number"
                  id="maxEntries"
                  min="0"
                  value={criteria.maxEntriesPerUser}
                  onChange={(e) => setCriteria({ ...criteria, maxEntriesPerUser: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className={styles['giveaway-form__checkbox']}>
              <input
                type="checkbox"
                id="requireTag"
                checked={criteria.requireTag}
                onChange={(e) => setCriteria({ ...criteria, requireTag: e.target.checked })}
              />
              <label htmlFor="requireTag">Require user to tag someone (@mention)</label>
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-lg)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${styles['giveaway-form__button']} ${styles['giveaway-form__button--primary']}`}
          >
            {loading ? 'Processing...' : 'Pick Winners'}
          </button>
        </form>
      </div>

      {winners.length > 0 && (
        <WinnerDisplay 
          winners={winners} 
          totalEntries={totalEntries} 
          uniqueUsers={uniqueUsers}
          shareGradient={getCurrentGradient()}
        />
      )}
    </div>
  );
}
