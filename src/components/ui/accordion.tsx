"use client";

import { Accordion as AccordionPrimitive } from "radix-ui";
import { Plus } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b border-line", className)} {...props} />;
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between gap-6 py-6 text-left text-[1.0625rem] font-medium tracking-tight text-ink transition-colors hover:text-accent",
          className,
        )}
        {...props}
      >
        {children}
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mist ring-1 ring-line transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-ink group-data-[state=open]:text-white group-data-[state=open]:ring-ink">
          <Plus className="size-4" aria-hidden />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-[collapse_0.25s_ease-out] data-[state=open]:animate-[expand_0.3s_ease-out]"
      {...props}
    >
      <div className={cn("max-w-2xl pb-6 text-[0.975rem] leading-relaxed text-muted", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
