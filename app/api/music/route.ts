import { readdirSync, existsSync } from "fs"
import { extname, parse, join } from "path"
import type { Track } from "@/lib/types"

export async function GET() {
  try {
    // Try to read files from public/music directory
    // This works in both local dev and Vercel deployments
    const musicDir = join(process.cwd(), "public", "music")
    
    let files: string[] = []
    try {
      files = readdirSync(musicDir).filter((file) => {
        const ext = extname(file).toLowerCase()
        return [".mp3", ".m4a", ".wav", ".ogg", ".flac", ".mka"].includes(ext)
      })
    } catch (err) {
      console.warn("Could not read music directory:", err)
      // Return empty array if directory doesn't exist (e.g., in build-only Vercel deployments)
      return Response.json([])
    }

    // Transform to Track format
    const tracks: Track[] = files.map((file) => {
      const parsed = parse(file)
      const filename = parsed.name
      
      // Try to extract artist and title from filename if it contains " - "
      let title = filename
      let artist = "Unknown"
      
      if (filename.includes(" - ")) {
        const parts = filename.split(" - ")
        artist = parts[0].trim()
        title = parts.slice(1).join(" - ").trim()
      }

      // Check if a corresponding .png thumbnail exists
      const coverPath = join(musicDir, `${filename}.png`)
      const hasCover = existsSync(coverPath)
      const cover = hasCover ? `/music/${encodeURIComponent(filename)}.png` : undefined

      return {
        title,
        artist,
        duration: "0:00", // Will be updated by audio element
        src: `/api/audio/${encodeURIComponent(file)}`,
        cover,
      }
    })

    return Response.json(tracks)
  } catch (error) {
    console.error("Error reading music directory:", error)
    return Response.json([], { status: 500 })
  }
}
