"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { LoginForm } from "@/components/login-form";
import { Dashboard } from "@/components/dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const user = useAppStore((s) => s.user);
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);
  const checkAuth = useAppStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
