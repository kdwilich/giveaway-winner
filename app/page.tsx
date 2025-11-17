'use client';

import { SessionProvider } from 'next-auth/react';
import GiveawayForm from './components/GiveawayForm/GiveawayForm';
import Link from 'next/link';
import Script from 'next/script';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Instagram Giveaway Picker',
    description: 'Free Instagram giveaway picker tool for selecting random winners from Instagram comments',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Random winner selection',
      'Instagram comment fetching',
      'CSV upload support',
      'Entry counting by tags or comments',
      'Manual entry addition',
      'Fair and transparent selection',
      'No data storage',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
  };

  return (
    <SessionProvider>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <GiveawayForm />
        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          <Link href="/privacy" style={{ 
            color: 'var(--color-primary)', 
            textDecoration: 'none' 
          }}>
            Privacy Policy
          </Link>
        </footer>
      </main>
    </SessionProvider>
  );
}
