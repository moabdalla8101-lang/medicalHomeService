import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

// This layout is for non-localized routes (admin, provider, medical-centre)
// Customer-facing routes should use [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For root path, redirect to default locale
  return children;
}

