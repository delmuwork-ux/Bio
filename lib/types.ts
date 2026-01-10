export interface Track {
  title: string
  artist: string
  duration: string
  src: string
}

export interface SocialLink {
  name: string
  href: string
  username: string
  bio: string
  platform: "twitter" | "instagram" | "youtube" | "github" | "discord"
}

export interface ProfileStat {
  value: string
  label: string
}
