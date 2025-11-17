import NextAuth, { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://www.facebook.com/v18.0/dialog/oauth",
        params: {
          scope: "instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement",
        },
      },
      token: "https://graph.facebook.com/v18.0/oauth/access_token",
      userinfo: {
        url: "https://graph.facebook.com/me",
        async request({ tokens }) {
          // First get the user's Facebook pages
          const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokens.access_token}`
          );
          const pagesData = await pagesResponse.json();
          
          // Then get Instagram Business Account ID from the first page
          if (pagesData.data && pagesData.data.length > 0) {
            const pageId = pagesData.data[0].id;
            const igResponse = await fetch(
              `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${tokens.access_token}`
            );
            const igData = await igResponse.json();
            
            if (igData.instagram_business_account) {
              const igAccountId = igData.instagram_business_account.id;
              const igUserResponse = await fetch(
                `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username&access_token=${tokens.access_token}`
              );
              return await igUserResponse.json();
            }
          }
          
          // Fallback to Facebook user info
          const fbUserResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${tokens.access_token}`
          );
          return await fbUserResponse.json();
        },
      },
      clientId: process.env.INSTAGRAM_APP_ID!,
      clientSecret: process.env.INSTAGRAM_APP_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username || profile.name,
          email: null,
          image: null,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.userId = token.userId as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
