/**
 * The Podium mark drawn with plain boxes so it renders identically in the
 * browser and inside next/og's ImageResponse (which supports flexbox, gradients,
 * border radius and box shadows, but no SVG paths).
 */
export function PodiumMark({ size, rounded = true }: { size: number; rounded?: boolean }) {
  const bar = (h: number, glow?: boolean) => ({
    width: size * 0.17,
    height: size * h,
    borderRadius: size * 0.035,
    background: 'linear-gradient(180deg, #F6D98A 0%, #DCAA48 55%, #B8863B 100%)',
    boxShadow: glow ? `0 0 ${size * 0.05}px rgba(61, 220, 151, 0.55)` : `0 ${size * 0.02}px ${size * 0.05}px rgba(0,0,0,0.5)`,
    display: 'flex',
  })
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: size * 0.05,
        padding: `0 ${size * 0.18}px ${size * 0.26}px`,
        background: 'linear-gradient(180deg, #17171f 0%, #0b0b0f 100%)',
        borderRadius: rounded ? size * 0.225 : 0,
      }}
    >
      <div style={bar(0.28)} />
      <div style={{ ...bar(0.46, true), position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: size * 0.025,
            borderRadius: size * 0.035,
            background: '#3DDC97',
            display: 'flex',
          }}
        />
      </div>
      <div style={bar(0.2)} />
    </div>
  )
}
