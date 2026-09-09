import type { Metadata } from 'next';
import './globals.css';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'UrbanGaon — Chakramsar Farmhouse Master Schedule & ERP',
  description: 'Executive-grade interactive Gantt schedule, material procurement matrix, and contractor tracking for Chakramsar Farmhouse by UrbanGaon.',
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let embeddedCss = '';
  try {
    const cssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    embeddedCss = fs.readFileSync(cssPath, 'utf8');
  } catch (e) {
    // fallback if file read fails
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/favicon.jpg" />
        <link rel="apple-touch-icon" href="/favicon.jpg" />
        {embeddedCss && (
          <style
            id="executive-design-system"
            dangerouslySetInnerHTML={{ __html: embeddedCss }}
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
