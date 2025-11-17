# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] **Build succeeds locally**
  ```bash
  npm run build
  ```
  ✅ Should complete without errors

- [ ] **Environment variables ready**
  - [ ] `INSTAGRAM_APP_ID` from Facebook Developer Console
  - [ ] `INSTAGRAM_APP_SECRET` from Facebook Developer Console
  - [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32`
  
- [ ] **Code committed to Git**
  ```bash
  git add .
  git commit -m "Ready for deployment"
  git push origin main
  ```

- [ ] **`.gitignore` excludes sensitive files**
  - [ ] `.env.local` is NOT committed
  - [ ] `.env*` pattern is in `.gitignore`

## Vercel Setup

- [ ] **Import repository to Vercel**
  - Go to https://vercel.com/new
  - Select your GitHub repository
  - Click "Import"

- [ ] **Configure project settings**
  - Framework Preset: **Next.js** (auto-detected)
  - Root Directory: `./` (default)
  - Build Command: `npm run build` (default)
  - Output Directory: `.next` (default)
  - Install Command: `npm install` (default)

- [ ] **Add environment variables in Vercel**
  - Go to: Settings → Environment Variables
  - Add for **all environments** (Production, Preview, Development):
    - `INSTAGRAM_APP_ID`
    - `INSTAGRAM_APP_SECRET`
    - `NEXTAUTH_SECRET`
    - `NEXTAUTH_URL` (set after first deploy to get domain)
    - `INSTAGRAM_REDIRECT_URI` (set after first deploy to get domain)

## First Deployment

- [ ] **Deploy project**
  - Click "Deploy" button in Vercel
  - Wait for build to complete
  - Note your deployment URL (e.g., `https://your-app-abc123.vercel.app`)

- [ ] **Update environment variables with production URL**
  - Go to: Settings → Environment Variables
  - Update `NEXTAUTH_URL` to your Vercel URL
  - Update `INSTAGRAM_REDIRECT_URI` to: `https://your-app-abc123.vercel.app/api/auth/callback/instagram`
  - Redeploy: Deployments → Click "..." → Redeploy

## Facebook App Configuration

- [ ] **Add production redirect URI**
  - Go to https://developers.facebook.com/apps
  - Select your app
  - Navigate to: Facebook Login → Settings
  - Add to **Valid OAuth Redirect URIs**:
    ```
    https://your-app-abc123.vercel.app/api/auth/callback/instagram
    ```
  - Save changes

- [ ] **Add app domain**
  - Go to: Settings → Basic
  - Add to **App Domains**: `your-app-abc123.vercel.app`
  - Save changes

- [ ] **Switch to Production Mode** (when ready for public use)
  - Go to: Settings → Basic
  - Toggle app mode from "Development" to "Live"
  - Note: Requires Privacy Policy URL and Terms of Service URL

## Testing

- [ ] **Test authentication flow**
  - Visit your deployed app
  - Click "Connect Instagram"
  - Verify OAuth popup appears
  - Authorize the app
  - Confirm successful login

- [ ] **Test CSV upload workflow**
  - Upload a test CSV file
  - Configure giveaway settings
  - Select winners
  - Verify results display correctly

- [ ] **Test Instagram API (if using OAuth)**
  - Connect Instagram account
  - Paste an Instagram post URL
  - Fetch comments
  - Pick winners

- [ ] **Test theme customization**
  - Click settings cog
  - Select different color themes
  - Verify app colors update
  - Test custom hex input

- [ ] **Test share view**
  - After selecting winners
  - Click "Open Share View"
  - Verify gradient applies correctly
  - Take test screenshot

## Custom Domain (Optional)

- [ ] **Add custom domain in Vercel**
  - Go to: Settings → Domains
  - Add your domain (e.g., `giveaway.yourdomain.com`)
  - Follow DNS configuration instructions

- [ ] **Update environment variables**
  - `NEXTAUTH_URL`: `https://giveaway.yourdomain.com`
  - `INSTAGRAM_REDIRECT_URI`: `https://giveaway.yourdomain.com/api/auth/callback/instagram`
  - Redeploy

- [ ] **Update Facebook app**
  - Add custom domain to **Valid OAuth Redirect URIs**
  - Add custom domain to **App Domains**

## Post-Deployment

- [ ] **Monitor deployment**
  - Check Vercel dashboard for errors
  - Review function logs
  - Monitor performance metrics

- [ ] **Set up automatic deployments**
  - Vercel auto-deploys on git push (enabled by default)
  - Preview deployments for pull requests
  - Production deployment on main branch

- [ ] **Document your deployment**
  - Save your Vercel URL
  - Note environment variable values (securely)
  - Document any custom domain configuration

## Security Checklist

- [ ] **Environment variables secured**
  - Never commit `.env.local` to Git
  - Use strong, unique `NEXTAUTH_SECRET`
  - Rotate secrets if compromised

- [ ] **HTTPS enabled**
  - Vercel provides automatic HTTPS (enabled by default)
  - Verify site loads with `https://`

- [ ] **Facebook app permissions**
  - Review and minimize requested scopes
  - Only request necessary Instagram permissions

## Troubleshooting

If issues occur, check:

1. **Build Errors**: Review Vercel build logs
2. **OAuth Errors**: Verify redirect URIs match exactly
3. **API Errors**: Check Facebook app permissions and mode
4. **Missing Data**: Confirm all environment variables are set

## Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ App loads at production URL
- ✅ OAuth flow works (if using Instagram API)
- ✅ CSV upload accepts files
- ✅ Winner selection produces results
- ✅ Share view displays correctly
- ✅ Theme customization updates colors
- ✅ No console errors in browser

## Next Steps

After successful deployment:

1. Share your app URL with users
2. Distribute Chrome extension (if needed)
3. Monitor usage and performance
4. Collect user feedback
5. Plan feature enhancements

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Facebook Developers**: https://developers.facebook.com/docs
- **Project Issues**: Check your GitHub repository issues

---

**Deployment Date**: _________________

**Deployed URL**: _________________

**Notes**: _________________
