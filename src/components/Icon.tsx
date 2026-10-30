// Hand-drawn line icons on a 24 x 24 grid, all with the same stroke width.
// Icons are decoration next to a visible text label, so screen readers skip them.

const paths = {
  today: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <circle cx="12" cy="15.25" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  explore: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  words: <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.25L5.5 20.5v-16a1 1 0 0 1 1-1z" />,
  review: (
    <>
      <rect x="8" y="3.5" width="12" height="14" rx="2" />
      <path d="M4.5 7.5v11a2 2 0 0 0 2 2h9" />
    </>
  ),
  sentences: (
    <>
      <rect x="3.5" y="5.5" width="8" height="5" rx="1.5" />
      <rect x="13.5" y="5.5" width="7" height="5" rx="1.5" />
      <rect x="3.5" y="13.5" width="11" height="5" rx="1.5" />
    </>
  ),
  write: (
    <>
      <path d="M4.5 19.5h4l10.25-10.25a2.83 2.83 0 0 0-4-4L4.5 15.5z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  developer: <path d="m8 7.5-4.5 4.5L8 16.5M16 7.5l4.5 4.5-4.5 4.5M13.5 5l-3 14" />,
  progress: <path d="M4 20h16M7 16.5v-4M12 16.5v-8M17 16.5V5" />,
  settings: (
    <>
      <path d="M4 7.5h8.5M17.5 7.5H20M4 16.5h2.5M11.5 16.5H20" />
      <circle cx="15" cy="7.5" r="2.5" />
      <circle cx="9" cy="16.5" r="2.5" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
}

export type IconName = keyof typeof paths

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
