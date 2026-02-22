import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Serendipity - AI-Powered Networking',
  description: 'Transform networking from manual to ambient with AI-powered event intel and relationship management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
