export function GhostLogo() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
      <div className="relative bg-gradient-to-br from-primary to-primary/60 rounded-2xl p-3 shadow-lg">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10 text-primary-foreground"
        >
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          <circle cx="6.5" cy="11.5" r="1.5" />
          <circle cx="9.5" cy="7.5" r="1.5" />
          <circle cx="14.5" cy="7.5" r="1.5" />
          <circle cx="17.5" cy="11.5" r="1.5" />
        </svg>
      </div>
    </div>
  )
}
