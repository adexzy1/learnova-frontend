"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const COUNTDOWN_SECONDS = 10;

const Complete = () => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const redirect = useCallback(() => {
    sessionStorage.removeItem("onboarding_step");
    window.location.href = "/";
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      redirect();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, redirect]);

  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 space-y-8">
      {/* Animated success icon */}
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20 animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-in fade-in duration-700 delay-300" />
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping [animation-duration:2s]" />
      </div>

      {/* Heading */}
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <h1 className="text-3xl font-bold tracking-tight">Setup Complete!</h1>
        <p className="text-muted-foreground max-w-md">
          Your school has been configured successfully. You&apos;re all set to
          start managing your institution.
        </p>
      </div>

      {/* Countdown */}
      <div className="space-y-3 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Redirecting to login in
          </p>
          <div className="relative flex items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-primary transition-all duration-1000 ease-linear"
                strokeWidth="2"
                strokeDasharray="97.4"
                strokeDashoffset={97.4 - (progress / 100) * 97.4}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-bold tabular-nums">
              {countdown}
            </span>
          </div>
        </div>

        <Button onClick={redirect} className="w-full gap-2" size="lg">
          <LogIn className="h-4 w-4" />
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default Complete;
