"use client"

import { useState, useEffect } from "react"
import { Twitter, Instagram, Youtube, ArrowUpRight } from "lucide-react"

const links = [
  { name: "Twitter", icon: Twitter, href: "https://x.com/_Delmu", username: "@_Delmu", bio: "たまに動画作る厨二病のひと..." },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/_delmu/", username: "@_delmu", bio: "品性の欠片も無いです。リョ..." },
  { name: "YouTube", icon: Youtube, href: "https://www.youtube.com/@Delmu", username: "@Delmu", bio: "🇯🇵/20↑ All fiction. My delusion." },
]

type Phase = "hidden" | "sweep" | "done"

export function SocialLinks() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>("hidden")
  const [show, setShow] = useState(false)

  useEffect(() => {
    const start = () => setPhase("sweep")
    window.addEventListener("startSocialAnimation", start)
    return () => window.removeEventListener("startSocialAnimation", start)
  }, [])

  useEffect(() => {
    if (phase !== "sweep") return
    const t = setTimeout(() => { setPhase("done"); setShow(true) }, 500)
    return () => clearTimeout(t)
  }, [phase])

  const clipPath = phase === "hidden" ? "inset(0 100% 0 0)" : phase === "sweep" ? "inset(0)" : "inset(0 0 0 100%)"

  return (
    <div className="relative p-6 card overflow-hidden">
      <div
        className="absolute inset-0 bg-white z-30 pointer-events-none"
        style={{ clipPath, transition: "clip-path .5s cubic-bezier(.32,.72,0,1)" }}
      />
      <div className="space-y-1">
        {links.map((link, i) => {
          const active = hovered === i
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                opacity: show ? 1 : 0,
                transform: show ? "translateY(0)" : "translateY(10px)",
                transition: "opacity .3s, transform .3s",
                transitionDelay: `${i * 50}ms`,
              }}
            >
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 bg-white" style={{ width: active ? "50%" : 0, transition: "width .35s cubic-bezier(.22,1,.36,1)" }} />
                <div className="absolute top-0 bottom-0 right-0 bg-white" style={{ width: active ? "50%" : 0, transition: "width .35s cubic-bezier(.22,1,.36,1)" }} />
              </div>

              <div className="flex items-center gap-4 p-3 -mx-1 relative z-10" style={{ transition: "all .35s" }}>
                <div
                  className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
                  style={{
                    backgroundColor: active ? "black" : "rgba(255,255,255,.05)",
                    borderColor: active ? "black" : "rgba(255,255,255,.1)",
                    transition: "all .35s",
                  }}
                >
                  <link.icon className="w-4 h-4" style={{ color: active ? "white" : "rgba(255,255,255,.7)", transition: "color .35s" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-sm block font-medium" style={{ color: active ? "black" : "rgba(255,255,255,.8)", transition: "color .35s" }}>
                    {link.name}
                  </span>
                  <div className="overflow-hidden" style={{ maxHeight: active ? 40 : 0, opacity: active ? 1 : 0, transition: "max-height .4s cubic-bezier(.22,1,.36,1), opacity .25s" }}>
                    <span className="text-xs text-black/60 block mt-0.5">{link.username}</span>
                    <span className="text-[11px] text-black/40 block truncate">{link.bio}</span>
                  </div>
                </div>

                <ArrowUpRight
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: active ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.2)",
                    transform: active ? "translate(2px,-2px)" : "translate(0,0)",
                    transition: "all .35s",
                  }}
                />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
