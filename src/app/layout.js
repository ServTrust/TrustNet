import './globals.css'

export const metadata = {
  title: 'TrustNet - Structural Knowledge Translation',
  description: 'Bridge expert knowledge to collective understanding through structural translation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

