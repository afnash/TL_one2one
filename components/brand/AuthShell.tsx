import { Check, Layers, Video, BarChart3 } from "lucide-react";
import { Brand } from "@/components/brand/Brand";
import { Reveal } from "@/components/brand/Reveal";

const POINTS = [
  { icon: Video, text: "Live one-to-one video lessons" },
  { icon: Layers, text: "A shared whiteboard for every subject" },
  { icon: BarChart3, text: "Homework, grades and reports in one place" },
];

type Variant = "user" | "admin";

const COPY: Record<Variant, { title: string; body: string }> = {
  user: {
    title: "Learning feels better one to one.",
    body: "Sign in to join your next lesson, hand in homework and see how you are progressing.",
  },
  admin: {
    title: "Run the whole platform from one place.",
    body: "Create accounts, assign teachers and keep an eye on lessons across every branch.",
  },
};

/** Two-column auth layout: a brand panel on large screens, just the form on small ones. */
export function AuthShell({ children, variant = "user" }: { children: React.ReactNode; variant?: Variant }) {
  const copy = COPY[variant];
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-secondary/40 p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_100%_0%,rgba(28,42,168,0.12),transparent),radial-gradient(50%_50%_at_0%_100%,rgba(23,163,163,0.14),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#c9cfe6_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black_40%,black_70%,transparent)]"
        />
        <Brand className="relative [&_img]:h-14" />

        <div className="relative flex max-w-md flex-col gap-8">
          <Reveal className="flex flex-col gap-3">
            <h2 className="text-balance text-4xl font-semibold leading-tight text-navy">{copy.title}</h2>
            <p className="text-muted-foreground">{copy.body}</p>
          </Reveal>

          <Reveal delay={60}>
            <div
              role="img"
              aria-label="Illustration of a whiteboard with a graph"
              className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-navy/10"
            >
              <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium">Quadratic functions</span>
              </div>
              <svg viewBox="0 0 400 190" className="block w-full bg-[radial-gradient(#d6daea_1.2px,transparent_1.2px)] [background-size:20px_20px]" aria-hidden>
                <text x="24" y="38" fontSize="18" fontWeight="600" fill="#0c1470">
                  f(x) = 2x² + 4x + 1
                </text>
                <path d="M60 60 L60 170 M30 150 L300 150" stroke="#bfc7f6" strokeWidth="1.5" fill="none" />
                <path d="M95 70 Q165 250 235 70" stroke="#17a3a3" strokeWidth="3.5" strokeLinecap="round" fill="none" className="draw-line" />
                <circle cx="165" cy="160" r="5" fill="#f5b942" />
              </svg>
            </div>
          </Reveal>

          <ul className="flex flex-col gap-3">
            {POINTS.map(({ icon: Icon, text }, i) => (
              <Reveal key={text} as="li" delay={120 + i * 50} className="flex items-center gap-3 text-sm">
                <span className="grid size-7 place-items-center rounded-lg bg-card text-primary shadow-sm ring-1 ring-border">
                  <Icon className="size-4" />
                </span>
                {text}
              </Reveal>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="size-3.5 text-brand" />
          Accounts are created by your school. There is no public sign-up.
        </p>
      </aside>

      {/* Form column */}
      <div className="relative grid place-items-center overflow-hidden p-4 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_90%_0%,rgba(23,163,163,0.12),transparent),radial-gradient(40%_40%_at_0%_100%,rgba(28,42,168,0.08),transparent)] lg:hidden"
        />
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <Brand className="lg:hidden [&_img]:h-16" />
          <Reveal className="w-full">{children}</Reveal>
        </div>
      </div>
    </main>
  );
}
