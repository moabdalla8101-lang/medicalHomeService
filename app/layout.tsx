import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Home Medical Services - Kuwait',
  description: 'Book home medical services in Kuwait',
}

// This layout is for non-localized routes (admin, provider, medical-centre)
// Customer-facing routes should use [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}

