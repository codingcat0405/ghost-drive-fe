import { Link } from "react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VaultHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-foreground hover:text-cyan-400 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Lock className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Secret Vault</span>
          </div>
        </Link>
        <Link to="/">
          <Button variant="outline" size="sm">
            Back to Files
          </Button>
        </Link>
      </div>
    </header>
  );
}
