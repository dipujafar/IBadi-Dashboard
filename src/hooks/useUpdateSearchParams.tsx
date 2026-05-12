"use client";

import { useSearchParams, useRouter } from "next/navigation";

type ParamValue = string | null;
type ParamsUpdate = Record<string, ParamValue>;

export function useUpdateSearchParams(targetId?: string) {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (updates: ParamsUpdate) => {
    const params = new URLSearchParams(searchParams.toString());

    // Apply all updates while preserving existing params
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const url = `?${params.toString()}`;
    router.push(url, { scroll: false });

    // Smooth scroll to target section after navigation
    if (targetId) {
      setTimeout(() => {
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };
}
