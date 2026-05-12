type IconProps = { size?: number; color?: string; className?: string }

function svg(path: string, { size = 20, color = 'currentColor', className = '' }: IconProps = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  )
}

export function IconMapPin(p: IconProps) {
  return svg('M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', p)
}

export function IconGlobe(p: IconProps) {
  return svg('M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', p)
}

export function IconTrendingUp(p: IconProps) {
  return svg('M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', p)
}

export function IconFileText(p: IconProps) {
  return svg('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', p)
}

export function IconBarChart(p: IconProps) {
  return svg('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', p)
}

export function IconStar(p: IconProps) {
  return (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill={p.color ?? 'currentColor'}
      stroke={p.color ?? 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconUsers(p: IconProps) {
  return svg('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', p)
}

export function IconCheck(p: IconProps) {
  return svg('M5 13l4 4L19 7', p)
}

export function IconPhone(p: IconProps) {
  return svg('M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', p)
}

export function IconNavigation(p: IconProps) {
  return svg('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', p)
}

export function IconEye(p: IconProps) {
  return svg('M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', p)
}

export function IconCursor(p: IconProps) {
  return svg('M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5', p)
}

export function IconDollarSign(p: IconProps) {
  return svg('M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', p)
}

export function IconTarget(p: IconProps) {
  return svg('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z', p)
}

export function IconZap(p: IconProps) {
  return svg('M13 2L3 14h9l-1 8 10-12h-9l1-8z', p)
}

export function IconDownload(p: IconProps) {
  return svg('M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3', p)
}

export function IconActivity(p: IconProps) {
  return svg('M22 12h-4l-3 9L9 3l-3 9H2', p)
}

export function IconSearch(p: IconProps) {
  return svg('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', p)
}

export function IconArrowUp(p: IconProps) {
  return svg('M5 10l7-7 7 7M12 3v18', p)
}

export function IconArrowRight(p: IconProps) {
  return svg('M5 12h14M12 5l7 7-7 7', p)
}
