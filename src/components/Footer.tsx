import { Github } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Author and Version */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-foreground font-medium">Ghost Drive</p>
              <p className="text-xs text-muted-foreground">© {currentYear} Built with codingcat0405</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-xs font-medium text-cyan-400">Beta v1.0</span>
            </div>
          </div>

          {/* Right: GitHub Link */}
          <a
            href="https://github.com/codingcat0405/ghost-drive-fe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors duration-200"
            aria-label="Visit Ghost Drive on GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="text-sm font-medium">GitHub</span>
          </a>
        </div>

        {/* Bottom: Additional Info */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Ghost Drive - End-to-end encrypted file storage. Your data, your control.
          </p>
        </div>
      </div>
    </footer>
  )
}
