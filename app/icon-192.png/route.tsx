import { ImageResponse } from 'next/og'
import { PodiumMark } from '@/lib/brand'

export function GET() {
  return new ImageResponse(<PodiumMark size={192} rounded={false} />, { width: 192, height: 192 })
}
