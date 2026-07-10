import type React from "react"
import type { Metadata, Viewport } from "next"
import { DotGothic16, M_PLUS_Rounded_1c, Fredoka } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const dotGothic = DotGothic16({ weight: "400", subsets: ["latin"], variable: "--font-pixel" })
const mPlusRounded = M_PLUS_Rounded_1c({ weight: "400", subsets: ["latin"] })
const fredoka = Fredoka({ weight: ["400", "500", "600", "700"], subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tofu ( ⓛ ω ⓛ *)",
  description: "hello gays <3",
  generator: "Holaaaaaaaaa",
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
  themeColor: "#ffc0cb",
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
      <body className={`font-sans ${fredoka.className} ${dotGothic.variable}`} style={{ "--font-jp": mPlusRounded.style.fontFamily } as React.CSSProperties}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
