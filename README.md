# Instagram Giveaway Winner Picker

An Instagram giveaway winner picker app built with Next.js that helps you run fair and transparent giveaways. Features a Chrome extension for scraping Instagram comments to bypass API limitations.

## Features

- 🔐 Instagram OAuth authentication (optional - CSV upload available)
- 📱 Fetch comments from Instagram posts via Graph API
- 🧩 **Chrome Extension** for scraping all Instagram comments (bypasses API limits)
- 📤 CSV upload support for comment data
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
- Facebook Developer account (for Instagram OAuth - optional if using CSV)
- Google Chrome (for extension usage)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/giveaway-app.git
cd giveaway-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Generate NextAuth secret
openssl rand -base64 32
# Add the output to .env.local as NEXTAUTH_SECRET

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setup Guides

Detailed setup instructions are available in the `docs/` folder:

- **[SETUP.md](docs/SETUP.md)** - Complete local development setup
- **[FACEBOOK_APP_SETUP.md](docs/FACEBOOK_APP_SETUP.md)** - Instagram Graph API configuration
- **[CHROME_EXTENSION_SETUP.md](docs/CHROME_EXTENSION_SETUP.md)** - Chrome extension installation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment to Vercel

## Usage

### Method 1: Instagram API (Limited)
1. Connect Instagram via OAuth
2. Paste Instagram post URL
3. Note: API may only return ~35 comments on popular posts

### Method 2: Chrome Extension (Recommended for large posts)
1. Load the Chrome extension from `chrome-extension/` folder
2. Navigate to Instagram post
3. Scroll to load all comments and expand replies
4. Click "Scrape Comments" in extension popup
5. Download CSV file
6. Upload CSV to the app

### Pick Winners
1. Configure giveaway settings:
   - Number of winners
   - Max entries per user
   - Require tagged users
2. Add manual bonus entries (optional)
3. Click "Pick Winners"
4. Customize color theme
5. Open share view for Instagram Story screenshot

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v4 with Facebook/Instagram OAuth
- **Styling**: SCSS with BEM naming conventions
- **API**: Instagram Graph API v18.0
- **Extension**: Chrome Manifest V3
- **Deployment**: Vercel-ready
- **TypeScript**: Full type safety

## Deployment

Ready to deploy on Vercel with zero configuration:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete production setup including:
- Environment variable configuration
- Facebook app production settings
- Custom domain setup
- OAuth redirect URI updates

## Environment Variables

Required for production:

```env
INSTAGRAM_APP_ID=your_facebook_app_id
INSTAGRAM_APP_SECRET=your_facebook_app_secret
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/api/auth/callback/instagram
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

## License

MIT
