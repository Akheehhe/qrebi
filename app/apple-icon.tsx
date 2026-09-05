import { ImageResponse } from 'next/og'
import { PodiumMark } from '@/lib/brand'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// iOS applies its own mask, so the tile is drawn square.
export default function AppleIcon() {
  return new ImageResponse(<PodiumMark size={180} rounded={false} />, { ...size })
}
