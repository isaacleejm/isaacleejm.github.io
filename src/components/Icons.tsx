export function Arrow({
  diagonal = false,
  down = false,
}: {
  diagonal?: boolean
  down?: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      className={`arrow${down ? ' arrow-down' : ''}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {diagonal ? (
        <path d="M6 18 18 6M6 6h12v12" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  )
}

export function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      i<span>.</span>
    </span>
  )
}
