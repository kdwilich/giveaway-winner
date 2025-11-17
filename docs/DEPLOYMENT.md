# Deployment Guide for Vercel

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub account with this repository
3. Facebook Developer account with an app configured for Instagram Graph API

## Step 1: Prepare Facebook App for Production

1. Go to https://developers.facebook.com/apps
2. Select your app (or create a new one)
3. Add your production domain to **Valid OAuth Redirect URIs**:
   - Navigate to: Facebook Login → Settings
   - Add: `https://your-app-name.vercel.app/api/auth/callback/instagram`
4. Note down your **App ID** and **App Secret**

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

### Required Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `INSTAGRAM_APP_ID` | Your Facebook App ID | From Facebook Developer Console |
| `INSTAGRAM_APP_SECRET` | Your Facebook App Secret | From Facebook Developer Console |
| `INSTAGRAM_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/callback/instagram` | OAuth callback URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your production URL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Authentication secret |

**Important**: Add these variables for all environments (Production, Preview, Development)

## Step 4: Update Facebook App Settings

After deployment, update your Facebook app:

1. **App Domains**: Add `your-app.vercel.app`
2. **Valid OAuth Redirect URIs**: Add `https://your-app.vercel.app/api/auth/callback/instagram`
3. **Privacy Policy URL**: Add your privacy policy URL (required for production apps)
4. **Terms of Service URL**: Add your terms URL (required for production apps)

## Step 5: Test Production Deployment

1. Visit your deployed app: `https://your-app.vercel.app`
2. Click "Connect Instagram"
3. Verify OAuth flow works correctly
4. Test the complete workflow:
   - Upload CSV or paste Instagram URL
   - Configure giveaway settings
   - Select winners
   - Test share view screenshot

## Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project → **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables:
   - `NEXTAUTH_URL` → `https://yourdomain.com`
   - `INSTAGRAM_REDIRECT_URI` → `https://yourdomain.com/api/auth/callback/instagram`
5. Update Facebook app redirect URIs

## Troubleshooting

### OAuth Redirect Mismatch
- Ensure `INSTAGRAM_REDIRECT_URI` exactly matches Facebook app settings
- Check for trailing slashes (should not have one)

### Authentication Errors
- Verify `NEXTAUTH_SECRET` is set
- Check that `NEXTAUTH_URL` matches your deployment URL

### Build Failures
- Run `npm run build` locally to check for errors
- Check Vercel build logs for specific issues

### Instagram API Issues
- Verify Facebook app has correct permissions enabled
- Check that Instagram account is connected to Facebook app
- Ensure app is in Production mode (not Development mode)

## Environment Variables Checklist

Before deploying, verify you have:
- [ ] Generated a new `NEXTAUTH_SECRET`
- [ ] Set production `NEXTAUTH_URL`
- [ ] Set production `INSTAGRAM_REDIRECT_URI`
- [ ] Added Facebook app credentials
- [ ] Updated Facebook app redirect URIs
- [ ] Tested OAuth flow in production

## Chrome Extension Distribution (Optional)

The Chrome extension doesn't require separate deployment but can be distributed:

1. Create a `.zip` of the `chrome-extension` folder
2. Upload to Chrome Web Store Developer Dashboard
3. Or distribute the folder for manual installation:
   - Users navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

## Security Notes

- Never commit `.env.local` to version control
- Keep your `NEXTAUTH_SECRET` secure and unique
- Rotate secrets if compromised
- Use environment variables for all sensitive data
- Enable Vercel's automatic HTTPS
- Consider adding rate limiting for API routes

## Monitoring

Vercel provides built-in monitoring:
- **Analytics**: User behavior and performance
- **Logs**: Real-time function logs
- **Speed Insights**: Core Web Vitals

Access these in your Vercel project dashboard.
