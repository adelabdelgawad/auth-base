import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent border-solid rounded-full",
        className
      )}
    />
  );
}