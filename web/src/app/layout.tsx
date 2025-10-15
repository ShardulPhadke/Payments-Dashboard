import type { Metadata } from 'next';
import Script from 'next/script';
import './global.css';
import ReduxProvider from '@/providers/ReduxProvider';
import MuiThemeProvider from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Payment Analytics Dashboard',
  description: 'Real-time payment monitoring and analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Only load env-config.js in production (Docker) */}
        {process.env.NODE_ENV === 'production' && (
          <Script src="/env-config.js" strategy="beforeInteractive" />
        )}
      </head>
      <body>
        <ReduxProvider>
          <MuiThemeProvider>
            {children}
          </MuiThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}