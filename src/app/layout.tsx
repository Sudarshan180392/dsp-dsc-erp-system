import type { Metadata } from 'next';
import './globals.css';

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
      <body className="antialiased bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
