import { ImageResponse } from 'next/og'
import { PodiumMark } from '@/lib/brand'

export function GET() {
  return new ImageResponse(<PodiumMark size={512} rounded={false} />, { width: 512, height: 512 })
}
