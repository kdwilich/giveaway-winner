import type { Metadata } from "next";
import "./styles/globals.scss";

export const metadata: Metadata = {
  title: "Lucky Pick - Free Instagram Giveaway Picker",
  description: "Free Instagram giveaway picker tool. Select random winners fairly from Instagram comments. Count entries by tags or comments, set entry limits, and export results. No data stored.",
  keywords: ["instagram giveaway", "giveaway picker", "random winner picker", "instagram contest", "winner selector", "giveaway tool", "instagram giveaway winner", "comment picker", "lucky pick"],
  authors: [{ name: "Lucky Pick" }],
  creator: "Lucky Pick",
  publisher: "Lucky Pick",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://giveaway-picker.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Lucky Pick - Free Instagram Giveaway Picker",
    description: "Free Instagram giveaway picker tool. Select random winners fairly from Instagram comments. Perfect for influencers, brands, and content creators.",
    url: '/',
    siteName: 'Lucky Pick',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Lucky Pick - Free Instagram Giveaway Picker",
    description: "Free Instagram giveaway picker tool. Select random winners fairly from Instagram comments.",
    creator: '@giveawaypicker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a88bfb" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
