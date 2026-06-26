import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, Roboto_Slab } from "next/font/google"
import { GlobalContactWindow } from "@/components/contact-modal"
import "./globals.css"

const slab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-slab",
  display: "swap",
})

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AetherAllan - About me",
  description: "A personal portfolio for product software, AI, Web3, games, and technical writing.",
  icons: {
    icon: "/avatar.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${slab.variable} ${mono.variable}`}>
      <body>
        {children}
        <GlobalContactWindow />
      </body>
    </html>
  )
}
