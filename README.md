# Instagram Giveaway Winner Picker

An Instagram giveaway winner picker app built with Next.js that helps you run fair and transparent giveaways.

## Features

- 📤 CSV upload support for Instagram comment data
- 🧩 **[Chrome Extension](https://github.com/kdwilich/giveaway-winner-extension)** available separately for scraping Instagram comments
- 🎲 Random winner selection with customizable criteria
- ✨ Support for unique entries or multiple entries per user
- 🏷️ Option to require tagged users (@mentions) in comments
- 📝 Manual entry list for bonus entries
- 🎨 Beautiful Radix-UI inspired design with glassmorphism
- 🌈 Customizable color themes with app-wide branding
- 🌓 Automatic light/dark theme based on system preferences
- 📸 Shareable screenshot view optimized for Instagram Stories
- 📊 Comprehensive statistics (total entries, participants, win rates)

## Quick Start

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
# Clone the repository
git clone https://github.com/kdwilich/giveaway-winner.git
cd giveaway-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Chrome Extension

For scraping Instagram comments (bypasses Instagram's comment limits), check out the separate [Chrome Extension repository](https://github.com/kdwilich/giveaway-winner-extension).

## Usage

1. **Get Instagram Comments**
   - Use the [Chrome Extension](https://github.com/kdwilich/giveaway-winner-extension) to scrape comments from any Instagram post
   - Download the CSV file
   - Or create your own CSV with columns: `username`, `comment_text`

2. **Pick Winners**
   - Upload your CSV file
   - Configure giveaway settings (number of winners, max entries per user, tag requirements)
   - Add manual bonus entries (optional)
   - Click "Pick Winners"
   - Customize color theme
   - Share via link or open share view for screenshots

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: SCSS with BEM naming conventions
- **Deployment**: Vercel-ready
- **TypeScript**: Full type safety

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kdwilich/giveaway-winner)

Or use the CLI:

```bash
npm i -g vercel
vercel
```

No environment variables required!

## License

MIT
