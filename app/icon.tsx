import { ImageResponse } from 'next/og'
import { PodiumMark } from '@/lib/brand'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(<PodiumMark size={64} />, { ...size })
}
