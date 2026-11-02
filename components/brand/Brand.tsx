import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// The logo is a transparent PNG (1452x504); height is controlled through className.
export function Brand({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} aria-label="sofiaa home" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/logo.png"
        alt="sofiaa"
        width={1452}
        height={504}
        priority
        className="h-11 w-auto select-none"
      />
    </Link>
  );
}
