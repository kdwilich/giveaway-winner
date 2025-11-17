# Instagram Giveaway App - Setup Guide

## ✅ Project Status

Your Instagram Giveaway Winner Picker app is now set up and running at **http://localhost:3000**

## 🔧 What's Been Built

### Core Features
- ✅ Instagram OAuth authentication flow
- ✅ Instagram Graph API integration for fetching comments
- ✅ Customizable giveaway criteria (unique entries, max entries per user, tag requirements)
- ✅ Manual entry support for bonus entries
- ✅ Random winner selection algorithm
- ✅ Beautiful Radix-UI inspired design with glassmorphism effects
- ✅ Light/dark theme support based on system preferences
- ✅ Winner display with copy-to-clipboard and Instagram Story formatting

### Project Structure
```
giveaway-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth configuration
│   │   └── instagram/comments/route.ts   # Instagram API integration
│   ├── components/
│   │   ├── GiveawayForm/               # Main form component
│   │   └── WinnerDisplay/              # Winner results display
│   ├── styles/
│   │   ├── _variables.scss             # Theme variables
│   │   └── globals.scss                # Global styles
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── giveawayLogic.ts                # Winner selection logic
├── types/
│   ├── giveaway.ts                     # TypeScript interfaces
│   └── next-auth.d.ts                  # NextAuth types
└── .env.local                          # Environment variables
```

## 🚀 Next Steps

### 1. Configure Instagram App

You need to set up an Instagram app to use the Graph API:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (select "Business" type)
3. Add **Instagram Graph API** product
4. Configure **Instagram Basic Display** for OAuth
5. Add OAuth Redirect URI: `http://localhost:3000/api/auth/callback/instagram`
6. Get your **App ID** and **App Secret**

### 2. Update Environment Variables

Edit `.env.local` and add your credentials:

```bash
# Instagram API Configuration
INSTAGRAM_APP_ID=your_actual_app_id_here
INSTAGRAM_APP_SECRET=your_actual_app_secret_here
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/callback/instagram

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_this_with_openssl_rand_base64_32
```

Generate the NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Test the App

1. Open http://localhost:3000
2. Click "Connect Instagram"
3. Authorize the app with your Instagram account
4. Try the features:
   - Paste an Instagram post URL
   - Set winner count and criteria
   - Add manual entries (one username per line)
   - Click "Pick Winners"

## 📝 Important Notes

### Instagram Graph API Requirements
- Your Instagram account must be a **Business** or **Creator** account
- The account must be connected to a Facebook Page
- You'll need approval for certain permissions in production

### Current Limitations
- Only works with Instagram Business accounts
- Comments API requires specific permissions
- Rate limiting applies to API calls

### SCSS Warnings
You'll see deprecation warnings about `@import` - these are harmless. SCSS still fully supports `@import`, the warnings are just about future versions.

## 🎨 Styling

The app uses:
- **BEM CSS naming** conventions for components
- **SCSS** with variables for theming
- **Glassmorphism** effects inspired by Radix UI
- **Automatic light/dark mode** based on system preferences
- **CSS custom properties** for easy theming

## 🚢 Deployment to Vercel

When ready to deploy:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update Instagram OAuth redirect URI to your production domain
5. Deploy!

## 🔮 Future Enhancements (Planned)

- 🎡 Animated wheel spinner for winner selection
- ⏱️ Countdown timer for dramatic reveals
- 📊 Entry statistics and analytics
- 💾 Giveaway history and saved results
- 🎥 Screen recording feature for Instagram Stories
- 📱 Mobile-optimized UI

## 🐛 Troubleshooting

### OAuth Not Working
- Verify Instagram App ID and Secret are correct
- Check that OAuth redirect URI matches exactly
- Ensure Instagram account is Business/Creator type

### Comments Not Fetching
- Verify the post belongs to your connected account
- Check Graph API permissions are approved
- Ensure post URL format is correct

### Styling Issues
- Clear browser cache
- Restart dev server: `npm run dev`
- Check that SCSS files are in correct locations

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [NextAuth.js](https://next-auth.js.org/)
- [SCSS Guide](https://sass-lang.com/guide)

---

**Need help?** Check the README.md or review the code comments for more details.
