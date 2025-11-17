# Facebook App Setup for Instagram Graph API

## Important: Use Facebook App, Not Instagram Basic Display

Instagram Graph API (for business accounts) requires a **Facebook App**, not an Instagram Basic Display app.

## Step-by-Step Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type
4. Fill in:
   - **App Name**: "Giveaway Picker" (or your choice)
   - **App Contact Email**: Your email
   - Click **"Create App"**

### 2. Add Instagram Graph API

1. In your app dashboard, click **"Add Products"**
2. Find **"Instagram Graph API"** and click **"Set Up"**
3. This will add Instagram capabilities to your Facebook app

### 3. Configure Facebook Login

1. In the left sidebar, click **"Facebook Login"** → **"Settings"**
2. Add OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/instagram
   ```
   For production, add:
   ```
   https://yourdomain.com/api/auth/callback/instagram
   ```

### 4. Get Your Credentials

1. In left sidebar, go to **"Settings"** → **"Basic"**
2. Copy your **App ID**
3. Click **"Show"** on **App Secret** and copy it
4. Add these to your `.env.local`:
   ```
   INSTAGRAM_APP_ID=your_app_id_here
   INSTAGRAM_APP_SECRET=your_app_secret_here
   ```

### 5. Connect Instagram Business Account

**IMPORTANT:** Your Instagram account must be:
- ✅ Converted to a **Business** or **Creator** account
- ✅ Connected to a **Facebook Page**

To connect:
1. Open Instagram app
2. Go to **Settings** → **Account** → **Switch to Professional Account**
3. Choose **Business** or **Creator**
4. Connect to a Facebook Page (or create one)

### 6. Add Test Users (Development Mode)

While your app is in development mode:

1. Go to **App Roles** → **Roles**
2. Add test users or add your Instagram account
3. Or go to **App Roles** → **Test Users** to create test accounts

### 7. Request Permissions (For Production)

For production use, you'll need to request these permissions:

1. Go to **App Review** → **Permissions and Features**
2. Request:
   - `instagram_basic` - Basic profile info
   - `instagram_manage_comments` - Read and manage comments
   - `pages_show_list` - List Facebook pages
   - `pages_read_engagement` - Read page engagement

### 8. App Review (Production Only)

Before going live:
1. Complete **App Review** in Facebook dashboard
2. Provide privacy policy URL
3. Explain how you use Instagram data
4. Submit for review (can take 1-2 weeks)

## Testing Your Setup

1. Update `.env.local` with your App ID and App Secret
2. Generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```
3. Restart your dev server:
   ```bash
   npm run dev
   ```
4. Go to http://localhost:3000
5. Click **"Connect Instagram"**
6. You should see Facebook OAuth popup
7. Authorize with your Facebook account
8. App will access your connected Instagram Business account

## Common Issues

### "Invalid OAuth Redirect URI"
- Make sure redirect URI in Facebook app matches exactly: `http://localhost:3000/api/auth/callback/instagram`
- No trailing slash
- Protocol must match (http vs https)

### "Instagram account not found"
- Your Instagram must be Business/Creator account
- Must be connected to a Facebook Page
- The Facebook account you log in with must have access to that Page

### "Permissions error"
- In development mode, add your Facebook account as a test user
- Or add it under App Roles → Roles

### "Comments not showing"
- Post must belong to your Instagram Business account
- Need `instagram_manage_comments` permission
- Account must have proper page role permissions

## Useful Links

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
- [Facebook Login Setup](https://developers.facebook.com/docs/facebook-login/web)
- [App Review Process](https://developers.facebook.com/docs/app-review)
- [Instagram Business Account Setup](https://help.instagram.com/502981923235522)

## Development vs Production

### Development Mode (Default)
- ✅ Works immediately after setup
- ✅ Can test with your own account
- ⚠️ Only works for accounts added as test users/roles
- ⚠️ Limited to test users

### Production Mode (After App Review)
- ✅ Works for any Instagram Business account
- ✅ No test user restrictions
- ⚠️ Requires App Review approval
- ⚠️ Must comply with Facebook Platform Policy

---

**Current Status:** Your app is configured for Facebook OAuth. Update your `.env.local` with Facebook App credentials!
