# Instagram Giveaway App - Chrome Extension Setup

## Overview

This solution bypasses Instagram API pagination limits by scraping comments directly from the browser, then processing them in the giveaway app.

## Components

1. **Chrome Extension** - Scrapes comments from Instagram posts
2. **Next.js Giveaway App** - Processes CSV and picks winners

## Setup Instructions

### 1. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Pin the extension to your toolbar

### 2. Create Extension Icons (Required)

The extension needs three icon files. Create simple PNG icons or use placeholders:

```bash
# Navigate to chrome-extension folder
cd chrome-extension

# Option 1: Create simple colored squares using ImageMagick (if installed)
convert -size 16x16 xc:#0095f6 icon16.png
convert -size 48x48 xc:#0095f6 icon48.png
convert -size 128x128 xc:#0095f6 icon128.png

# Option 2: Download icons from a generator like favicon-generator.org
# Save as icon16.png, icon48.png, icon128.png
```

### 3. Using the Extension

1. **Navigate to Instagram post**: `https://www.instagram.com/p/SHORTCODE/`

2. **Load all comments**:
   - Scroll down to load more comments
   - Click "View replies" to expand nested comments
   - Continue until all comments are visible

3. **Scrape comments**:
   - Click the extension icon in your toolbar
   - Click "Scrape Comments & Download CSV"
   - CSV file will download automatically

### 4. Process Giveaway in App

1. **Start the Next.js app**:
   ```bash
   npm run dev
   ```

2. **Open in browser**: `http://localhost:3000`

3. **Upload CSV**:
   - Select "Upload CSV" radio button
   - Choose the CSV file from extension
   - Configure giveaway settings:
     - Number of winners
     - Unique entries only (or max entries per user)
     - Require tag (counts each @mention as entry)
   
4. **Pick winners**: Click "Pick Winners" button

## CSV Format

The extension exports CSV with these columns:
- `username` - Instagram username
- `comment_text` - Full comment including @mentions
- `timestamp` - Comment timestamp
- `is_reply` - Whether it's a reply (true/false)

## Entry Counting Logic

The app processes entries based on your rules:

- **Require tag ON**: Each unique @mention = 1 entry (unlimited entries default)
- **Unique entries ON**: 1 entry per user regardless of tags
- **Max entries per user**: Limits entries (0 = unlimited)
- **Self-tags excluded**: Tagging yourself doesn't count

Example:
```
User @fishing_fan comments:
"Brook trout @friend1 @friend2 @friend3"

Result: 3 entries for @fishing_fan (each unique tag)
```

## Troubleshooting

### Extension not finding comments
- Make sure you've scrolled down to load all comments
- Expand all "View replies" buttons
- Instagram's DOM may have changed - check console for errors

### CSV not uploading
- Check CSV has required columns: `username`, `comment_text`
- Make sure file extension is `.csv`

### No entries found
- Enable "Require tag" option if comments have @mentions
- Check if users tagged themselves (self-tags are excluded)
- Review giveaway criteria settings

## Files Structure

```
chrome-extension/
├── manifest.json        # Extension configuration
├── content.js          # Scrapes comments from page
├── popup.html          # Extension UI
├── popup.js            # Handles scraping & CSV export
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # Extension documentation

app/
└── components/
    └── GiveawayForm/
        ├── GiveawayForm.tsx        # Updated with CSV upload
        └── GiveawayForm.module.scss # Styles
```

## Why This Solution?

Instagram Graph API has arbitrary pagination limits:
- Only returns ~35 comments on some posts (even with 1,600+ comments)
- Pagination stops without warning
- No way to access older/hidden comments via API

This Chrome extension solution:
- ✅ Accesses ALL visible comments
- ✅ Works with any post (no API restrictions)
- ✅ No rate limiting
- ✅ Includes nested replies
- ✅ One-time manual process per giveaway

## Next Steps

Test the complete workflow:
1. Find Instagram post with 100+ comments
2. Scroll and expand all comments
3. Use extension to export CSV
4. Upload CSV to giveaway app
5. Configure settings and pick winners!
