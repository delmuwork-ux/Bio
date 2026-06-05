import type React from "react"
import type { Metadata, Viewport } from "next"
import { Pixelify_Sans, M_PLUS_Rounded_1c } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const pixelifySans = Pixelify_Sans({ subsets: ["latin"] })
const mPlusRounded = M_PLUS_Rounded_1c({ weight: "400", subsets: ["latin", "japanese"] })

export const metadata: Metadata = {
  title: "Bio | Minimal",
  description: "Welcome to my digital space",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/Bio/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/Bio/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/Bio/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/Bio/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans ${pixelifySans.className}`} style={{ "--font-jp": mPlusRounded.style.fontFamily } as React.CSSProperties}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
