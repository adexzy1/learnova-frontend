"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-destructive text-sm">
        {(error as any).message || "Something went wrong"}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
