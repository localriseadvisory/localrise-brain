import Image from 'next/image'

export function BrandLockup({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{
          width: size,
          height: size,
          background: '#111',
          border: '1px solid #1e1e1e',
          padding: size * 0.1,
        }}
      >
        <Image src="/logo-icon.png" alt="LocalRise" width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div>
        <div className="font-black leading-none text-white" style={{ fontSize: size * 0.38, letterSpacing: '-0.03em' }}>
          LocalRise
        </div>
        <div
          className="mt-0.5 font-semibold leading-none"
          style={{ fontSize: size * 0.23, color: '#E31B23', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Advisory
        </div>
      </div>
    </div>
  )
}
