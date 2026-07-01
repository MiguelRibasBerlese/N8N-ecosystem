export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="url(#pulsegrid-bg)" />
      <path
        d="M5 20h4l2.5-8 4 15 3-11 2 4h6.5"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="27" cy="20" r="1.8" fill="white" />
      <defs>
        <linearGradient id="pulsegrid-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>
    </svg>
  )
}
