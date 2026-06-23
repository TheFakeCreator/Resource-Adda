import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center p-8">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />

        {/* Main Spinner */}
        <div className="relative flex items-center justify-center h-20 w-20 bg-card border border-border shadow-2xl rounded-2xl">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>

        {/* Text */}
        <p className="mt-6 text-lg font-medium tracking-tight animate-pulse text-foreground/80">
          Loading...
        </p>
      </div>
    </div>
  );
}
