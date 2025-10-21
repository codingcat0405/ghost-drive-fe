import Footer from "@/components/Footer";
import { RegisterForm } from "@/components/auth/register-form";
import { GhostLogo } from "@/components/ghost-logo";
import useUserStore from "@/store/user";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  useEffect(() => {
    if (user.id) {
      navigate("/");
    }
  }, [user]);
  return (
    <div>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <GhostLogo />
            <h1 className="text-3xl font-bold tracking-tight">
              Create account
            </h1>
            <p className="text-muted-foreground text-center">
              Start storing your files with end-to-end encryption
            </p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
