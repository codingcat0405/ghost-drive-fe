export function GhostLogo() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
      <div className="relative bg-gradient-to-br from-primary to-primary/60 rounded-2xl p-3 shadow-lg">
        <img src="/ghostdrive-logo.png" alt="Ghost Drive" className="w-full h-full" />
      </div>
    </div>
  )
}
