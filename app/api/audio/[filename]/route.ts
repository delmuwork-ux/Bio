import { readFileSync } from "fs"
import { extname, join } from "path"

async function handleAudioRequest(
  params: Promise<{ filename: string }>,
  includeBody: boolean
) {
  try {
    const { filename } = await params
    const decodedFilename = decodeURIComponent(filename)
    
    const musicDir = join(process.cwd(), "public", "music")
    
    if (decodedFilename.includes("..") || decodedFilename.includes("/") || decodedFilename.includes("\\")) {
      return new Response("Invalid filename", { status: 400 })
    }

    const ext = extname(decodedFilename).toLowerCase()
    
    if (![".mp3", ".m4a", ".wav", ".ogg", ".flac"].includes(ext)) {
      return new Response("Invalid file type", { status: 400 })
    }

    const filepath = join(musicDir, decodedFilename)
    
    try {
      const fileBuffer = readFileSync(filepath)

      const mimeTypes: Record<string, string> = {
        ".mp3": "audio/mpeg",
        ".m4a": "audio/mp4",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
      }

      const headers = {
        "Content-Type": mimeTypes[ext] || "audio/mpeg",
        "Content-Length": fileBuffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      }

      return new Response(
        includeBody ? fileBuffer : null,
        {
          status: 200,
          headers,
        }
      )
    } catch (fileError) {
      return new Response("File not found", { status: 404 })
    }
  } catch (error) {
    return new Response("Internal server error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  return handleAudioRequest(params, true)
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  return handleAudioRequest(params, false)
}
