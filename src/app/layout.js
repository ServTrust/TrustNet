import './globals.css'

export const metadata = {
  title: 'Cognitive Bridge - Structural Knowledge Translation',
  description: 'Bridge expert knowledge to collective understanding through structural translation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}

