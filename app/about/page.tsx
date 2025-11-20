import Link from 'next/link';
import styles from './about.module.scss';

export const metadata = {
  title: 'About - Lucky Pick',
  description: 'Learn why we built a truly fair and transparent Instagram giveaway picker that considers every single comment.',
};

export default function AboutPage() {
  return (
    <div className={styles['about__container']}>
      <div className={styles['about__card']}>
        <h1>About This Tool</h1>
        
        <section className={styles['about__section']}>
          <h2>Why We Built This</h2>
          <p>
            Most free Instagram giveaway pickers don't work as advertised. They miss comments, skip entries, 
            and rely on Instagram's unpredictable API which often fails to return all comments - especially on 
            posts with thousands of entries.
          </p>
          <p>
            We built this tool to be <strong>completely fair</strong>. Every single comment is counted. 
            No hidden limitations. No premium features locked behind a paywall. Just honest, transparent winner selection.
          </p>
        </section>

        <section className={styles['about__section']}>
          <h2>How It Works</h2>
          <p>
            Our free Chrome extension fetches all comments directly from Instagram while you&apos;re logged in. 
            Since it runs in your browser using your authenticated session, it can access every comment on posts 
            you can view, whether public or private.
          </p>
          <p>
            The extension carefully throttles requests to avoid Instagram&apos;s rate limits. This is why fetching takes 
            time. We&apos;re being respectful of Instagram&apos;s servers while ensuring we get every single comment. 
            You can adjust the speed in the extension settings.
          </p>
        </section>

        <section className={styles['about__section']}>
          <h2>Your Privacy</h2>
          <p>
            Everything happens in your browser. We don't collect, store, or transmit your data anywhere. 
            The Chrome extension and this picker run entirely client-side. Your Instagram session stays private, 
            and the comments you export never leave your device unless you choose to share results.
          </p>
        </section>

        <section className={styles['about__section']}>
          <h2>Completely Free</h2>
          <p>
            No trials. No premium tiers. No credit card required. The code is open source, and you can verify 
            exactly how winners are selected.
          </p>
        </section>

        <div className={styles['about__cta']}>
          <Link href="/" className={styles['about__button']}>
            Start Picking Winners
          </Link>
          <a 
            href="https://github.com/kdwilich/giveaway-winner" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles['about__button-secondary']}
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
