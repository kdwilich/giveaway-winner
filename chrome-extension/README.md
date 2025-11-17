# Instagram Giveaway Comment Scraper

Chrome extension to scrape comments from Instagram posts and export to CSV for giveaway entry processing.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

## Usage

1. Navigate to an Instagram post (e.g., `https://www.instagram.com/p/SHORTCODE/`)
2. **Important:** Scroll down to load all comments
3. Click "View replies" buttons to expand nested comments
4. Click the extension icon in your toolbar
5. Click "Scrape Comments & Download CSV"
6. CSV file will download automatically

## CSV Format

The extension exports a CSV with the following columns:
- `username` - Instagram username
- `comment_text` - Full comment text including @mentions
- `timestamp` - Comment timestamp
- `is_reply` - Whether comment is a reply (true/false)

## Using CSV with Giveaway App

After downloading the CSV:
1. Go to your giveaway app
2. Select "Upload CSV" instead of "Instagram URL"
3. Upload the CSV file
4. Configure giveaway settings (winners, unique entries, etc.)
5. Pick winners!

## Notes

- Make sure to scroll and expand all comments before scraping
- Instagram's DOM structure may change - extension may need updates
- Only works on Instagram post pages (`/p/SHORTCODE/`)
