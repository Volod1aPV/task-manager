import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'TaskFlow',
  description: 'Webová aplikace pro správu úkolů',
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body className={geist.className}>
        {children}
      </body>
    </html>
  )
}