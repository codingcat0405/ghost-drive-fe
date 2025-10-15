import { LoginForm } from "@/components/auth/login-form";
import { GhostLogo } from "@/components/ghost-logo";


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <GhostLogo />
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-center">Sign in to access your encrypted files</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline font-medium">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}
