import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/Bio"

export function getAssetPath(path: string): string {
  if (path.startsWith("http")) return path
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${BASE_PATH}${normalizedPath}`
}
