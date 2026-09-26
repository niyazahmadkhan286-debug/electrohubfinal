import type { Metadata } from 'next';
import './globals.css';
import { ElectroHubProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'ELECTROHUB | Smart Electronics Inventory & Management System',
  description:
    'Manage your electronics business smarter, faster and from one place. Complete platform for electronic components, real-time inventory alerts, order workflows, customer CRM, and workforce management.',
  keywords: [
    'Electronics Inventory',
    'Component Management',
    'Next.js Supabase',
    'Microcontrollers',
    'Hardware ERP',
    'ElectroHub',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <ElectroHubProvider>{children}</ElectroHubProvider>
      </body>
    </html>
  );
}
