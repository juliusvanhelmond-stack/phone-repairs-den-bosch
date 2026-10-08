import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("eyebrow mb-4", tone === "dark" && "text-blue-300")}>{eyebrow}</p>}
      <Heading
        className={cn(
          "text-headline font-semibold text-balance",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Heading>
      {intro && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed text-pretty",
            tone === "dark" ? "text-slate-300" : "text-muted",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
