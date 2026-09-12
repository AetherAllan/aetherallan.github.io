import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { GlobalContactWindow } from "@/components/contact-modal"
import "./globals.css"

const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" })
export const metadata: Metadata = {
  title: "AetherAllan — Software, systems & curiosity",
  description: "A personal portfolio for product software, AI, Web3, games, and technical writing.",
  icons: { icon: "/avatar.png" },
}
export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <GlobalContactWindow />
      </body>
    </html>
  )
}
