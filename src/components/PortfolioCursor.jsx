import GhostCursor from './GhostCursor'

export const cursorMedia = '(any-hover: hover) and (any-pointer: fine)'

export default function PortfolioCursor({ className, zIndex = 0 }) {
  return (
    <GhostCursor
      className={className}
      color="#B497CF"
      size={80}
      trailLength={50}
      inertia={0.5}
      turbulence={0.5}
      drift={0.3}
      bloomStrength={0.6}
      grainIntensity={0.05}
      targetPixels={320000}
      maxDevicePixelRatio={1.5}
      intro={false}
      mixBlendMode="normal"
      zIndex={zIndex}
    />
  )
}
