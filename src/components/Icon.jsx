const paths = {
  rose: (
    <>
      <circle cx="12" cy="10" r="3" />
      <path d="M12 7c-3-4-7-2-6 2 1 3 4 4 6 4M12 7c3-4 7-2 6 2-1 3-4 4-6 4M12 14v8M12 18c-2-3-5-3-6-2M12 19c2-3 5-3 6-2" />
    </>
  ),
  clap: <path d="M4 9h16v11H4zM4 9l1.5-4.5 14 3L20 9M9 5l2 3.5M14 6l2 3" />,
  cal: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
  news: <path d="M4 5h14v14H4zM18 9h3v9a2 2 0 0 1-2 2H6M8 9h6M8 13h6" />,
  home: <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z" />,
  play: <path d="M7 4l13 8-13 8z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  pause: <path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" />,
  back10: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
  fwd10: <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />,
  full: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  out: <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
}

export default function Icon({ name, className = 'ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
