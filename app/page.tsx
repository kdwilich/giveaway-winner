'use client';

import { SessionProvider } from 'next-auth/react';
import GiveawayForm from './components/GiveawayForm/GiveawayForm';

export default function Home() {
  return (
    <SessionProvider>
      <main>
        <GiveawayForm />
      </main>
    </SessionProvider>
  );
}
