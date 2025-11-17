import { Metadata } from 'next';
import styles from './privacy.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Policy - Instagram Giveaway Picker',
  description: 'Privacy policy for Instagram Giveaway Picker. We do not collect, store, or transmit any personal data. All processing happens locally on your device.',
  openGraph: {
    title: 'Privacy Policy - Instagram Giveaway Picker',
    description: 'Learn about our privacy practices. We do not collect or store any personal data.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: November 16, 2025</p>

        <section>
          <h2>Introduction</h2>
          <p>
            This privacy policy applies to the Instagram Comment Scraper for Giveaways Chrome extension and the Giveaway Picker web application. We are committed to protecting your privacy and being transparent about our data practices.
          </p>
        </section>

        <section>
          <h2>Data Collection</h2>
          <p>
            <strong>We do NOT collect, store, or transmit any personal data.</strong> This includes but is not limited to:
          </p>
          <ul>
            <li>Instagram usernames or profile information</li>
            <li>Comment data or text content</li>
            <li>Passwords or authentication credentials</li>
            <li>Browsing history or activity</li>
            <li>Personal information of any kind</li>
          </ul>
        </section>

        <section>
          <h2>How the Extension Works</h2>
          <p>The Instagram Comment Scraper Chrome extension:</p>
          <ul>
            <li>Only accesses the Instagram post page when you explicitly click the extension icon</li>
            <li>Reads comment data directly from the page you're viewing in your browser</li>
            <li>Processes all data locally on your device</li>
            <li>Exports data to a CSV file that is saved directly to your Downloads folder</li>
            <li>Does NOT send any data to external servers</li>
          </ul>
        </section>

        <section>
          <h2>How the Web App Works</h2>
          <p>The Giveaway Picker web application:</p>
          <ul>
            <li>Processes all giveaway data client-side in your browser</li>
            <li>Does NOT store comment data or giveaway results on any server</li>
            <li>Only uses Instagram OAuth for API access (optional - only required for URL input mode)</li>
            <li>Does NOT access your Instagram account data beyond public comment information</li>
          </ul>
        </section>

        <section>
          <h2>Permissions Explained</h2>
          <h3>Chrome Extension Permissions:</h3>
          <ul>
            <li>
              <strong>activeTab:</strong> Allows the extension to access the current Instagram post page only when you click the extension icon. Cannot access other tabs or pages.
            </li>
            <li>
              <strong>downloads:</strong> Needed to save the exported CSV file to your Downloads folder.
            </li>
            <li>
              <strong>scripting:</strong> Allows the extension to read comment data from the Instagram page's visible content.
            </li>
            <li>
              <strong>host_permissions (instagram.com):</strong> Restricts the extension to only work on Instagram pages for security.
            </li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Access</h2>
          <p>
            We do NOT share, sell, or transmit any data to third parties. All processing happens locally on your device.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            Our extension and web app do not knowingly collect information from children under 13. The tools are designed for content creators and social media managers.
          </p>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            Since we don't collect or store any data, there is no data to be compromised. All processing happens locally on your device, and you maintain full control over any exported CSV files.
          </p>
        </section>

        <section>
          <h2>Open Source</h2>
          <p>
            This project is open source. You can review the code to verify our privacy practices at any time.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            If we make changes to this privacy policy, we will update the "Last Updated" date at the top of this page.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy, please contact us through our GitHub repository or at the contact information provided on our website.
          </p>
        </section>
      </div>
    </div>
  );
}
