import type { Track, SocialLink, ProfileStat } from "./types"

export const ANIMATION_CONFIG = {
  sweep: { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const },
  fade: { duration: 0.3, ease: "easeOut" as const },
  spring: { type: "spring", stiffness: 300, damping: 30 } as const,
}

export const TRACKS: Track[] = [
  {
    title: "Kita Ikuyo dances with doodle song (喜多郁代で推しの子OPダンス)",
    artist: "Kita Ikuyo",
    duration: "1:24",
    src: "/music/kita_ikuyo_dances.mp3",
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Twitter",
    platform: "twitter",
    href: "https://x.com/_Delmu",
    username: "@_Delmu",
    bio: "たまに動画作る厨二病のひと...",
  },
  {
    name: "Instagram",
    platform: "instagram",
    href: "https://www.instagram.com/_delmu/",
    username: "@_delmu",
    bio: "品性の欠片も無いです。リョ...",
  },
  {
    name: "YouTube",
    platform: "youtube",
    href: "https://www.youtube.com/@Delmu",
    username: "@Delmu",
    bio: "🇯🇵/20↑ All fiction. My delusion.",
  },
]

export const PROFILE_STATS: ProfileStat[] = [
  { value: "WaveBox", label: "δあくむ✁︎🥀" },
  { value: "X", label: "@_Delmu" },
  { value: "Facebook", label: "δあくむ" },
]

export const PROFILE = {
  name: "月白あくむ",
  username: "@Tofu",
  bio: "This is just a placeholder text to show how the bio will look on the profile card. ♡ ૮꒰ ˶• ༝ •˶꒱ა",
  avatar: "/avatar/avatar.png",
}
