import { usePathname } from "next/navigation";

export function useAppBase(): string {
  const pathname = usePathname();
  const safePathname = pathname ?? "/";
  return safePathname.startsWith("/stelllar") ? "/stelllar" : "";
}
