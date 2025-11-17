import type { Metadata } from "next";
import "./styles/globals.scss";

export const metadata: Metadata = {
  title: "Instagram Giveaway Picker",
  description: "Pick random winners for your Instagram giveaways",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
