import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn("Supabase credentials missing. Returning mock views.")
      return NextResponse.json({ views: 1337 })
    }

    const cookieStore = await cookies()
    const hasVisited = cookieStore.has("visited_bio_page")

    let count = 0

    if (hasVisited) {
      // Just fetch the current count without incrementing
      const response = await fetch(`${SUPABASE_URL}/rest/v1/page_views?id=eq.home&select=count`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 0 } // Bypass Next.js cache for real-time reads
      })
      
      if (response.ok) {
        const data = await response.json()
        count = data?.[0]?.count ?? 0
      } else {
        console.error("Failed to fetch views from Supabase:", await response.text())
      }
    } else {
      // Call the RPC function to increment the count
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_page_views`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_id: "home" }),
        next: { revalidate: 0 }
      })

      if (response.ok) {
        count = await response.json()
        
        // Set cookie to prevent subsequent increments in this session
        cookieStore.set("visited_bio_page", "true", {
          path: "/",
          httpOnly: true,
          maxAge: 60 * 60 * 24, // 1 day
          sameSite: "lax",
        })
      } else {
        console.error("Failed to increment views in Supabase:", await response.text())
      }
    }

    return NextResponse.json({ views: count })
  } catch (error) {
    console.error("Error in views API:", error)
    return NextResponse.json({ views: 0 }, { status: 500 })
  }
}
