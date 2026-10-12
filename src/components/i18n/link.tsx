"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/components/i18n/locale-provider";

/**
 * next/link that takes the Dutch path used throughout the code and data
 * (`/reparaties/apple`) and links to it in the active language (`/en/repairs/apple`).
 */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { href: localize } = useI18n();
  const target = typeof href === "string" && href.startsWith("/") ? localize(href) : href;
  return <NextLink href={target} {...props} />;
}
