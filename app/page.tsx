import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Code2,
  BookOpen,
  Check,
  GraduationCap,
  Layers,
  LogIn,
  Menu,
  Users,
  Video,
} from "lucide-react";
import { Brand } from "@/components/brand/Brand";
import { Reveal } from "@/components/brand/Reveal";
import { CanvasSandbox } from "@/components/landing/CanvasSandbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#roles", label: "Students & teachers" },
  { href: "#canvas-demo", label: "Try the board" },
];

const STEPS = [
  { n: "01", title: "Book in seconds", body: "Teachers schedule a lesson and students see it the moment they sign in. No chasing links, no confusion." },
  { n: "02", title: "Learn face to face", body: "Video and a shared whiteboard open together, so explaining and showing happen in the same moment." },
  { n: "03", title: "Keep the momentum going", body: "Homework, grades and a short report follow every lesson, so the next one starts exactly where this one ended." },
];

const FEATURES = [
  { icon: Layers, title: "Shared whiteboard", body: "Sketch, write out formulas and annotate together on one canvas, in real time." },
  { icon: Video, title: "Video built in", body: "Crisp one-to-one video and audio right inside the lesson. Nothing extra to install or juggle." },
  { icon: BookOpen, title: "Materials", body: "Share notes, PDFs and videos, then let students ask the study assistant to find the answer in them." },
  { icon: Award, title: "Assignments and grading", body: "Mark question by question and leave a personal comment on every submission." },
  { icon: BarChart3, title: "Session reports", body: "Topics covered, attendance and ratings captured after each lesson, ready to review any time." },
  { icon: Code2, title: "Coding space", body: "Write and run code together during a lesson and watch the output appear for both of you." },
];

const ROLES = [
  {
    value: "student",
    title: "Pick up right where you left off",
    points: [
      "See your next lesson, past lessons and homework the moment you sign in.",
      "Work through problems on the shared whiteboard with your teacher right beside you.",
    ],
    href: "/student/dashboard",
    cta: "Open student portal",
  },
  {
    value: "teacher",
    title: "Teach, grade and report in one place",
    points: [
      "Run live lessons with video and a shared canvas that feels like one desk.",
      "Create assignments and mark them question by question, with comments that help.",
      "Wrap up every lesson with a short report on topics, attendance and ratings.",
    ],
    href: "/teacher/dashboard",
    cta: "Open teacher studio",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-brand/30">
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Button key={item.href} variant="ghost" className="text-muted-foreground" asChild>
                <a href={item.href}>{item.label}</a>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/login">
                <LogIn data-icon="inline-start" />
                Sign in
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <div className="flex flex-col gap-1 px-4">
                  {NAV.map((item) => (
                    <SheetClose key={item.href} asChild>
                      <Button variant="ghost" className="justify-start" asChild>
                        <a href={item.href}>{item.label}</a>
                      </Button>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(55%_60%_at_85%_0%,rgba(28,42,168,0.10),transparent),radial-gradient(40%_50%_at_5%_15%,rgba(23,163,163,0.10),transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-24">
          <Reveal className="flex flex-col items-start gap-7">
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] text-navy sm:text-6xl lg:text-7xl">
              Lessons that feel like sitting <span className="text-brand">side by side.</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Live video, a shared whiteboard, homework and progress reports. Everything one-to-one teaching needs, in one calm place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/student/dashboard">
                  <GraduationCap data-icon="inline-start" />
                  Open student portal
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/teacher/dashboard">
                  Teacher studio
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </Reveal>

          {/* Lesson room illustration */}
          <Reveal delay={90} className="relative">
            <div
              role="img"
              aria-label="Illustration of a live lesson with a shared whiteboard and a video tile"
              className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-navy/10"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">Quadratic functions</span>
                </div>
                <span className="text-xs text-muted-foreground">24:10</span>
              </div>
              <div className="relative h-72 bg-[radial-gradient(#d6daea_1.2px,transparent_1.2px)] [background-size:22px_22px] sm:h-80">
                <svg viewBox="0 0 400 260" className="absolute inset-0 size-full" aria-hidden>
                  <text x="28" y="48" fontSize="22" fontWeight="600" fill="#0c1470">
                    f(x) = 2x² + 4x + 1
                  </text>
                  <path d="M60 80 L60 230 M30 200 L300 200" stroke="#bfc7f6" strokeWidth="1.5" fill="none" />
                  <path
                    d="M90 100 Q165 330 240 100"
                    stroke="#17a3a3"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    className="draw-line"
                  />
                  <circle cx="165" cy="215" r="5" fill="#f5b942" />
                  <text x="176" y="236" fontSize="13" fill="#5a6180">
                    vertex (−1, −1)
                  </text>
                </svg>
                <div className="absolute bottom-4 right-4 w-28 overflow-hidden rounded-lg border bg-navy shadow-lg sm:w-32">
                  <div className="grid aspect-[4/3] place-items-center">
                    <span className="grid size-10 place-items-center rounded-full bg-white/15 text-sm font-medium text-white">
                      MK
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
                <Check className="size-4 text-emerald-600" />
                Homework added: graph three parabolas
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="max-w-xl text-3xl font-semibold text-navy sm:text-4xl">From first hello to follow-up</h2>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 60} className="border-t pt-5">
              <span className="font-heading text-sm font-medium text-brand">{step.n}</span>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-semibold text-navy sm:text-4xl">Everything around the lesson, covered</h2>
          </Reveal>
          <Reveal className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group bg-card p-7 transition-colors hover:bg-secondary">
                <Icon className="size-6 text-primary transition-transform group-hover:-translate-y-0.5" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">Made for students and teachers alike</h2>
        </Reveal>
        <Tabs defaultValue="student" className="items-center">
          <TabsList>
            <TabsTrigger value="student">
              <GraduationCap /> Students
            </TabsTrigger>
            <TabsTrigger value="teacher">
              <Users /> Teachers
            </TabsTrigger>
          </TabsList>
          {ROLES.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="w-full">
              <Card className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <CardHeader>
                  <CardTitle className="text-xl">{tab.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <ul className="flex flex-col gap-3">
                    {tab.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Button className="self-start" asChild>
                    <Link href={tab.href}>
                      {tab.cta}
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section id="canvas-demo" className="scroll-mt-20 bg-navy py-20 text-white">
        <CanvasSandbox />
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <Brand />
        <span>© {new Date().getFullYear()} sofiaa</span>
      </footer>
    </div>
  );
}
