'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { GiveawayCriteria, InstagramComment, Winner } from '@/types/giveaway';
import { processEntries, selectWinners } from '@/lib/giveawayLogic';
import styles from './GiveawayForm.module.scss';
import WinnerDisplay from '../WinnerDisplay/WinnerDisplay';

const THEME_GRADIENTS = [
  { name: 'Purple', gradient: 'linear-gradient(135deg, #a88bfb 0%, #8b6fd9 100%)' },
  { name: 'Blue', gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' },
  { name: 'Green', gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' },
  { name: 'Orange', gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' },
  { name: 'Pink', gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)' },
  { name: 'Teal', gradient: 'linear-gradient(135deg, #009688 0%, #00796B 100%)' },
  { name: 'Red', gradient: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)' },
  { name: 'Indigo', gradient: 'linear-gradient(135deg, #3F51B5 0%, #303F9F 100%)' },
];

export default function GiveawayForm() {
  const [showSettings, setShowSettings] = useState(false);
  const winnerDisplayRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [customHex, setCustomHex] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [criteria, setCriteria] = useState<GiveawayCriteria>({
    postUrl: '',
    numberOfWinners: 1,
    uniqueEntriesOnly: false,
    maxEntriesPerUser: 0,
    requireTag: true,
    minTagsRequired: 1,
    minCommentsRequired: 1,
    manualEntries: [],
  });
  
  const [manualEntriesText, setManualEntriesText] = useState('');
  const [showManualEntries, setShowManualEntries] = useState(false);
  const [showMaxEntries, setShowMaxEntries] = useState(false);
  const [showMinRequirement, setShowMinRequirement] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvComments, setCsvComments] = useState<InstagramComment[]>([]);
  const [winnersInput, setWinnersInput] = useState('1');
  const [maxEntriesInput, setMaxEntriesInput] = useState('1');
  const [minTagsInput, setMinTagsInput] = useState('1');
  const [minCommentsInput, setMinCommentsInput] = useState('1');
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [error, setError] = useState('');
  const [totalEntries, setTotalEntries] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [fetchProgress, setFetchProgress] = useState('');

  // Scroll to winners when they're populated
  useEffect(() => {
    if (winners.length > 0 && winnerDisplayRef.current) {
      winnerDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [winners]);



  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedThemeIndex = localStorage.getItem('selectedTheme');
    const savedCustomHex = localStorage.getItem('customHex');
    const savedShowCustomInput = localStorage.getItem('showCustomInput');

    if (savedShowCustomInput === 'true' && savedCustomHex) {
      setShowCustomInput(true);
      setCustomHex(savedCustomHex);
      const normalizedHex = savedCustomHex.startsWith('#') ? savedCustomHex : `#${savedCustomHex}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
        const customGradient = `linear-gradient(135deg, ${normalizedHex} 0%, ${normalizedHex} 100%)`;
        updateAppTheme(customGradient);
      }
    } else if (savedThemeIndex !== null) {
      const index = parseInt(savedThemeIndex);
      if (index >= 0 && index < THEME_GRADIENTS.length) {
        setSelectedTheme(index);
        updateAppTheme(THEME_GRADIENTS[index].gradient);
      }
    } else {
      // Set default theme (Purple/index 0)
      updateAppTheme(THEME_GRADIENTS[0].gradient);
    }
  }, []);

  // Extract primary color from gradient for app theming
  const extractPrimaryColor = (gradient: string): string => {
    const match = gradient.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : '#a88bfb';
  };

  // Calculate relative luminance and determine if we need dark or light text
  const getContrastColor = (hex: string): string => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return black text for light backgrounds, white text for dark backgrounds
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };

  // Convert hex to OKLCH and generate accent color
  const hexToOKLCH = (hex: string) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    // Simple conversion to approximate OKLCH-like values
    // L (lightness) 0-1, C (chroma) 0-0.4, H (hue) 0-360
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    let h = 0;
    const d = max - min;
    
    if (d !== 0) {
      if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / d + 2) / 6;
      } else {
        h = ((r - g) / d + 4) / 6;
      }
    }
    
    const c = d / (1 - Math.abs(2 * l - 1) || 1);
    
    return { l, c, h: h * 360 };
  };

  const generateAccentColor = (primaryHex: string): string => {
    const { l, c, h } = hexToOKLCH(primaryHex);
    
    // Shift hue by 60-90 degrees for complementary accent
    const accentHue = (h + 75) % 360;
    
    // Convert back to RGB (approximate)
    const hueToRgb = (h: number) => {
      const k = (n: number) => (n + h / 30) % 12;
      const a = c * Math.min(l, 1 - l);
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      
      return [
        Math.round(f(0) * 255),
        Math.round(f(8) * 255),
        Math.round(f(4) * 255)
      ];
    };
    
    const [ar, ag, ab] = hueToRgb(accentHue);
    return `#${ar.toString(16).padStart(2, '0')}${ag.toString(16).padStart(2, '0')}${ab.toString(16).padStart(2, '0')}`;
  };

  // Update CSS variables when theme changes
  const updateAppTheme = (gradient: string) => {
    const primaryColor = extractPrimaryColor(gradient);
    const accentColor = generateAccentColor(primaryColor);
    const buttonTextColor = getContrastColor(primaryColor);
    
    console.log('Setting button text color:', buttonTextColor, 'for primary color:', primaryColor);
    
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-button-text', buttonTextColor);
    
    // Adjust hover color (slightly darker)
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);
    const hoverColor = `#${Math.max(0, r - 20).toString(16).padStart(2, '0')}${Math.max(0, g - 20).toString(16).padStart(2, '0')}${Math.max(0, b - 20).toString(16).padStart(2, '0')}`;
    document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
    
    // Add alpha version for shadows
    document.documentElement.style.setProperty('--color-primary-alpha', `${primaryColor}40`);
    
    // Update gradient orbs with dynamic colors
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const opacity = isDarkMode ? '0.25' : '0.15';
    
    // Extract secondary color from gradient if available
    const secondaryMatch = gradient.match(/#[0-9A-Fa-f]{6}/g);
    const secondaryColor = secondaryMatch && secondaryMatch[1] ? secondaryMatch[1] : primaryColor;
    
    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    document.documentElement.style.setProperty(
      '--gradient-orb-1',
      `radial-gradient(circle at 20% 50%, ${hexToRgba(primaryColor, opacity)} 0%, transparent 50%)`
    );
    document.documentElement.style.setProperty(
      '--gradient-orb-2',
      `radial-gradient(circle at 80% 20%, ${hexToRgba(accentColor, opacity)} 0%, transparent 50%)`
    );
    document.documentElement.style.setProperty(
      '--gradient-orb-3',
      `radial-gradient(circle at 40% 90%, ${hexToRgba(secondaryColor, opacity)} 0%, transparent 50%)`
    );
  };

  // Handle theme selection
  const handleThemeSelect = (index: number) => {
    setSelectedTheme(index);
    setShowCustomInput(false);
    updateAppTheme(THEME_GRADIENTS[index].gradient);
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', index.toString());
    localStorage.setItem('showCustomInput', 'false');
    localStorage.removeItem('customHex');
  };

  // Handle custom hex input
  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove # if present and add it back for consistency
    value = value.replace(/^#/, '');
    
    // Add # prefix for display
    const displayValue = value ? `#${value}` : '';
    setCustomHex(displayValue);
    
    // Validate hex color (with or without #)
    if (/^#?[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{6}$/.test(displayValue)) {
      const hexColor = value.startsWith('#') ? value : `#${value}`;
      const customGradient = `linear-gradient(135deg, ${hexColor} 0%, ${hexColor} 100%)`;
      updateAppTheme(customGradient);
      
      // Save to localStorage
      localStorage.setItem('customHex', displayValue);
      localStorage.setItem('showCustomInput', 'true');
    }
  };

  // Get current gradient for share view
  const getCurrentGradient = () => {
    // Normalize the hex value
    const normalizedHex = customHex.startsWith('#') ? customHex : `#${customHex}`;
    if (showCustomInput && /^#[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
      return `linear-gradient(135deg, ${normalizedHex} 0%, ${normalizedHex} 100%)`;
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
      
      // Validate required columns (flexible matching)
      const usernameIdx = headers.findIndex(h => h === 'username');
      const commentIdx = headers.findIndex(h => h === 'comment_text');
      
      if (usernameIdx === -1) {
        throw new Error('CSV must have a "username" column');
      }
      
      if (commentIdx === -1) {
        throw new Error('CSV must have a "comment_text" column');
      }
      
      // Optional columns
      const timestampIdx = headers.findIndex(h => h === 'timestamp');
      
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
      setError(`success:✓ Loaded ${comments.length} comments from CSV`);
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
    setFetchProgress('');

    try {
      // Use CSV comments (only input method now)
      const comments: InstagramComment[] = csvComments;

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

  return (
    <div className={styles['giveaway-form__container']}>
      <div className={styles['giveaway-form__card']}>
        <div className={styles['giveaway-form__header']}>          
          <div>
            <h1>Lucky Pick</h1>
            <p className={styles['giveaway-form__subtitle']}>Free Instagram Giveaway Picker</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <Link href="/about" className={styles['giveaway-form__about-link']} title="About">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a98afb">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={styles['giveaway-form__settings-button']}
              title="Color Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a98afb">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </button>
          </div>
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
                    onClick={() => {
                      const newValue = !showCustomInput;
                      setShowCustomInput(newValue);
                      localStorage.setItem('showCustomInput', newValue.toString());
                      if (!newValue) {
                        localStorage.removeItem('customHex');
                      }
                    }}
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

            <form onSubmit={handleSubmit}>
              <div style={{ 
                background: 'rgba(168, 139, 251, 0.05)',
                border: '2px solid rgba(168, 139, 251, 0.2)',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <h3 style={{ 
                  margin: '0 0 var(--spacing-sm) 0', 
                  color: 'var(--color-primary)',
                  fontSize: '16px',
                  fontWeight: 600
                }}>
                  📦 How to Get Instagram Comments
                </h3>
                <p style={{ 
                  margin: '0 0 var(--spacing-sm) 0',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  Use our free Chrome extension to fetch ALL comments from any Instagram post and export to CSV:
                </p>
                <ul style={{ 
                  margin: '0 0 var(--spacing-md) 0',
                  paddingLeft: 'var(--spacing-lg)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <li>Works with any post you can view (public or private)</li>
                  <li>Fetches all comments including replies automatically</li>
                  <li>Progress tracking with customizable rate limiting</li>
                  <li>100% privacy - all processing in your browser</li>
                </ul>
                <a
                  href="https://github.com/kdwilich/giveaway-winner-extension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles['giveaway-form__extension-button']}
                >
                  📥 Get Chrome Extension (Free)
                </a>
              </div>
              
              {/* CSV Upload Section */}
              <div className={styles['giveaway-form__field']} style={{ marginTop: 'var(--spacing-xl)' }}>
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

          {/* Number of Winners */}
          <div className={styles['giveaway-form__field']} style={{ marginTop: 'var(--spacing-xl)' }}>
            <label htmlFor="numberOfWinners">Number of Winners</label>
            <input
              type="number"
              id="numberOfWinners"
              min="1"
              value={winnersInput}
              onChange={(e) => {
                const val = e.target.value;
                setWinnersInput(val);
                if (val !== '' && parseInt(val) >= 1) {
                  setCriteria({ ...criteria, numberOfWinners: parseInt(val) });
                }
              }}
              onBlur={() => {
                if (winnersInput === '' || parseInt(winnersInput) < 1) {
                  setWinnersInput('1');
                  setCriteria({ ...criteria, numberOfWinners: 1 });
                }
              }}
            />
          </div>

          {/* Entry Rules Section */}
          <div className={styles['giveaway-form__checkbox-group']} style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className={styles['giveaway-form__field']}>
              <label>Entry Counting Method</label>
              <div className={styles['giveaway-form__help-text']} style={{ marginBottom: 'var(--spacing-md)' }}>
                Choose how entries are counted for each participant
              </div>
            </div>

            <div className={styles['giveaway-form__radio-group']}>
              <div className={styles['giveaway-form__radio']}>
                <input
                  type="radio"
                  id="countByTags"
                  name="entryCountingMethod"
                  checked={criteria.requireTag}
                  onChange={() => setCriteria({ ...criteria, requireTag: true, uniqueEntriesOnly: false })}
                />
                <label htmlFor="countByTags">Count by tags: Each unique @mention = 1 entry</label>
              </div>
              <div className={styles['giveaway-form__radio']}>
                <input
                  type="radio"
                  id="countByComments"
                  name="entryCountingMethod"
                  checked={!criteria.requireTag}
                  onChange={() => setCriteria({ ...criteria, requireTag: false })}
                />
                <label htmlFor="countByComments">Count by comments: Each comment = 1 entry</label>
              </div>
            </div>

            {/* Additional Configuration */}
            <div className={styles['giveaway-form__field']} style={{ marginTop: 'var(--spacing-xl)' }}>
              <label>Additional Configuration</label>
              <div className={styles['giveaway-form__help-text']} style={{ marginBottom: 'var(--spacing-md)' }}>
                Optional settings to customize entry requirements
              </div>
            </div>

            {/* Minimum Requirement Checkbox */}
            <div className={styles['giveaway-form__field']} style={{ marginTop: '0' }}>
              <div className={styles['giveaway-form__checkbox']}>
                <input
                  type="checkbox"
                  id="showMinRequirement"
                  checked={showMinRequirement}
                  onChange={(e) => {
                    setShowMinRequirement(e.target.checked);
                    if (!e.target.checked) {
                      setMinTagsInput('1');
                      setMinCommentsInput('1');
                      setCriteria({ ...criteria, minTagsRequired: 1, minCommentsRequired: 1 });
                    }
                  }}
                />
                <label htmlFor="showMinRequirement">Require minimum {criteria.requireTag ? 'tags' : 'comments'} to qualify</label>
              </div>
              {showMinRequirement && (
                <>
                  {criteria.requireTag ? (
                    <>
                      <label htmlFor="minTags" style={{ marginTop: 'var(--spacing-md)' }}>Minimum unique tags required</label>
                      <input
                        type="number"
                        id="minTags"
                        min="1"
                        value={minTagsInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMinTagsInput(val);
                          if (val !== '' && parseInt(val) >= 1) {
                            setCriteria({ ...criteria, minTagsRequired: parseInt(val) });
                          }
                        }}
                        onBlur={() => {
                          if (minTagsInput === '' || parseInt(minTagsInput) < 1) {
                            setMinTagsInput('1');
                            setCriteria({ ...criteria, minTagsRequired: 1 });
                          }
                        }}
                      />
                      <div className={styles['giveaway-form__help-text']}>
                        Users must tag at least this many unique people to qualify (e.g., &quot;3&quot; means tag 3 friends minimum)
                      </div>
                    </>
                  ) : (
                    <>
                      <label htmlFor="minComments" style={{ marginTop: 'var(--spacing-md)' }}>Minimum comments required</label>
                      <input
                        type="number"
                        id="minComments"
                        min="1"
                        value={minCommentsInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMinCommentsInput(val);
                          if (val !== '' && parseInt(val) >= 1) {
                            setCriteria({ ...criteria, minCommentsRequired: parseInt(val) });
                          }
                        }}
                        onBlur={() => {
                          if (minCommentsInput === '' || parseInt(minCommentsInput) < 1) {
                            setMinCommentsInput('1');
                            setCriteria({ ...criteria, minCommentsRequired: 1 });
                          }
                        }}
                      />
                      <div className={styles['giveaway-form__help-text']}>
                        Users must leave at least this many comments to qualify (e.g., &quot;2&quot; means must comment twice)
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Maximum Entries Checkbox */}
            <div className={styles['giveaway-form__field']} style={{ marginTop: 'var(--spacing-md)' }}>
              <div className={styles['giveaway-form__checkbox']}>
                <input
                  type="checkbox"
                  id="showMaxEntries"
                  checked={showMaxEntries}
                  onChange={(e) => {
                    setShowMaxEntries(e.target.checked);
                    if (!e.target.checked) {
                      setMaxEntriesInput('1');
                      setCriteria({ ...criteria, maxEntriesPerUser: 0, uniqueEntriesOnly: false });
                    } else {
                      setCriteria({ ...criteria, maxEntriesPerUser: 1, uniqueEntriesOnly: true });
                    }
                  }}
                />
                <label htmlFor="showMaxEntries">Limit entries per user</label>
              </div>
              {showMaxEntries && (
                <>
                  <label htmlFor="maxEntries" style={{ marginTop: 'var(--spacing-md)' }}>Max entries per user</label>
                  <input
                    type="number"
                    id="maxEntries"
                    min="1"
                    value={maxEntriesInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMaxEntriesInput(val);
                      if (val !== '' && parseInt(val) >= 1) {
                        setCriteria({ 
                          ...criteria, 
                          maxEntriesPerUser: parseInt(val),
                          uniqueEntriesOnly: parseInt(val) === 1
                        });
                      }
                    }}
                    onBlur={() => {
                      if (maxEntriesInput === '' || parseInt(maxEntriesInput) < 1) {
                        setMaxEntriesInput('1');
                        setCriteria({ ...criteria, maxEntriesPerUser: 1, uniqueEntriesOnly: true });
                      }
                    }}
                  />
                  <div className={styles['giveaway-form__help-text']}>
                    Set maximum number of entries each user can have
                  </div>
                </>
              )}
            </div>

            {/* Bonus Entries Checkbox */}
            <div className={styles['giveaway-form__field']} style={{ marginTop: 'var(--spacing-md)' }}>
              <div className={styles['giveaway-form__checkbox']}>
                <input
                  type="checkbox"
                  id="showManualEntries"
                  checked={showManualEntries}
                  onChange={(e) => {
                    setShowManualEntries(e.target.checked);
                    if (!e.target.checked) {
                      setManualEntriesText('');
                    }
                  }}
                />
                <label htmlFor="showManualEntries">Add bonus entries</label>
              </div>
              {showManualEntries && (
                <>
                  <label htmlFor="manualEntries" style={{ marginTop: 'var(--spacing-md)' }}>Bonus Entries (one username per line)</label>
                  <textarea
                    id="manualEntries"
                    placeholder="username1&#10;username2&#10;username3"
                    value={manualEntriesText}
                    onChange={(e) => setManualEntriesText(e.target.value)}
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    data-form-type="other"
                  />
                  <div className={styles['giveaway-form__help-text']}>
                    Add extra entries for specific users (e.g., social media shares, referrals, or other promotional activities). Each username entered gives one additional entry in the giveaway.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error and Progress Messages */}
          {error && (
            <div style={{ 
              color: error.startsWith('success:') ? 'var(--color-success)' : 'var(--color-error)', 
              marginBottom: 'var(--spacing-lg)' 
            }}>
              {error.replace('success:', '')}
            </div>
          )}

          {fetchProgress && (
            <div style={{ 
              color: 'var(--color-primary)', 
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'rgba(168, 139, 251, 0.1)',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid rgba(168, 139, 251, 0.2)'
            }}>
              {fetchProgress}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`${styles['giveaway-form__button']} ${styles['giveaway-form__button--primary']}`}
            style={{ marginTop: 'var(--spacing-xl)' }}
          >
            {loading ? 'Processing...' : 'Pick Winners'}
          </button>
        </form>
      </div>

      {winners.length > 0 && (
        <div ref={winnerDisplayRef}>
          <WinnerDisplay 
            winners={winners} 
            totalEntries={totalEntries} 
            uniqueUsers={uniqueUsers}
            shareGradient={getCurrentGradient()}
          />
        </div>
      )}
    </div>
  );
}
