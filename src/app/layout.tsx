import type { Metadata } from 'next';
import './globals.css';
import DemoBanner from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: 'DSP & DSC ERP & CRM',
  description: 'Academic ERP & Branch CRM for Coaching Institutes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 flex flex-col min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
