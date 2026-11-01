import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Page title block: one heading, one sentence, at most one primary action. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** A titled card. `href` adds a single quiet "View all" link in the header. */
export function Section({
  title,
  description,
  href,
  hrefLabel = "View all",
  className,
  children,
}: {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {href && (
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href={href}>
                {hrefLabel}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** A neutral number tile. Links are optional and the whole tile is the target. */
export function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col gap-1 rounded-xl border bg-card p-4",
        href && "transition-colors hover:border-ring/60 hover:bg-secondary/40",
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-heading text-3xl font-semibold tabular-nums text-foreground">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Plain, quiet empty message for a list that has nothing in it yet. */
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

/** One row in a list: title + meta on the left, optional action on the right. */
export function ListRow({
  title,
  meta,
  href,
  action,
  lead,
}: {
  title: string;
  meta?: string;
  href?: string;
  action?: React.ReactNode;
  lead?: React.ReactNode;
}) {
  const inner = (
    <>
      {lead}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {meta && <p className="truncate text-xs text-muted-foreground">{meta}</p>}
      </div>
      {action}
    </>
  );
  const cls = "flex items-center gap-3 rounded-lg px-3 py-2.5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:bg-secondary/60")}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Divided list wrapper so rows read as one group. */
export function RowList({ children }: { children: React.ReactNode }) {
  return <div className="-mx-3 flex flex-col divide-y divide-border/60">{children}</div>;
}

export function initials(name: string) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
