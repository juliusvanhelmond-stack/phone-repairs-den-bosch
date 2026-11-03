import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Hover swaps the colours (client request 2026-11-03): green buttons turn white, white buttons turn green.
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white shadow-[0_1px_2px_rgb(34_34_34/0.12),inset_0_1px_0_rgb(255_255_255/0.14)] hover:bg-white hover:text-accent hover:ring-1 hover:ring-accent hover:ring-inset",
        dark: "bg-night text-white hover:bg-night-soft",
        secondary: "bg-surface text-ink shadow-[var(--shadow-ring)] hover:bg-accent hover:text-white",
        ghost: "text-ink hover:bg-mist",
        light: "bg-surface text-ink hover:bg-accent hover:text-white",
        "outline-light": "text-white ring-1 ring-white/25 ring-inset hover:bg-accent hover:ring-accent",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-13 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
