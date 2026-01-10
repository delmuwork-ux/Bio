import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

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
      <body className={`font-sans antialiased ${inter.className}`}>
        {/* Animated Gradient Background */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 animate-gradient-move"
          style={{
            background: "linear-gradient(120deg, #00f2fe 0%, #4facfe 30%, #43e97b 60%, #fa709a 100%)",
            backgroundSize: "200% 200%",
            opacity: 0.95,
            filter: "blur(32px) saturate(1.5)",
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
