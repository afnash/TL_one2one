"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eraser, Pencil, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PEN_COLORS = ["#0c1470", "#17a3a3", "#f5b942", "#e11d48"];
const PEN_NAMES: Record<string, string> = { "#0c1470": "navy", "#17a3a3": "teal", "#f5b942": "yellow", "#e11d48": "red" };

export function CanvasSandbox() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [isEraser, setIsEraser] = useState(false);

  const paintBackground = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#d6daea";
    for (let x = 20; x < w; x += 28) {
      for (let y = 20; y < h; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const paintSample = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    paintBackground(canvas);
    ctx.font = "600 20px Outfit, system-ui, sans-serif";
    ctx.fillStyle = "#0c1470";
    ctx.fillText("f(x) = 2x² + 4x + 1", 24, 40);
    ctx.font = "14px \"DM Sans\", system-ui, sans-serif";
    ctx.fillStyle = "#17a3a3";
    ctx.fillText("Vertex (−1, −1)", 24, 66);

    // Parabola y = 2x² + 4x + 1, plotted around its vertex.
    const ox = 150;
    const oy = 150;
    const sx = 38;
    const sy = 22;
    ctx.strokeStyle = "#17a3a3";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = -2.2; i <= 0.2; i += 0.05) {
      const y = 2 * i * i + 4 * i + 1;
      const px = ox + i * sx;
      const py = oy - y * sy;
      if (i === -2.2) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = "#f5b942";
    ctx.beginPath();
    ctx.arc(ox - sx, oy + sy, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    paintSample(canvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // offsetX/Y are in the canvas's own coordinates, so drawing stays under the pen on the tilted card.
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => ({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? "#ffffff" : penColor;
    ctx.lineWidth = isEraser ? 22 : 3;
    drawing.current = true;
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  const clearSandbox = () => {
    if (canvasRef.current) paintBackground(canvasRef.current);
  };

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-5">
      <Reveal className="flex flex-col gap-4 lg:col-span-2">
        <h2 className="text-3xl font-semibold sm:text-4xl">Try the board</h2>
        <p className="text-white/70">
          Pick a pen and finish the parabola. This sandbox runs only in your browser. In a real lesson, teacher and student draw on the same canvas live.
        </p>
        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Drawing tools">
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Pen colour ${PEN_NAMES[c]}`}
              aria-pressed={!isEraser && penColor === c}
              onClick={() => {
                setPenColor(c);
                setIsEraser(false);
              }}
              className={cn(
                "size-8 rounded-full border-2 border-white/25 transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                !isEraser && penColor === c && "ring-2 ring-white ring-offset-2 ring-offset-navy",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white",
              isEraser && "bg-white text-navy hover:bg-white hover:text-navy",
            )}
            onClick={() => setIsEraser(!isEraser)}
            aria-pressed={isEraser}
          >
            <Eraser data-icon="inline-start" />
            Eraser
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={clearSandbox}
          >
            <RotateCcw data-icon="inline-start" />
            Clear
          </Button>
        </div>
        <Button variant="secondary" className="w-fit" asChild>
          <Link href="/login">
            <Pencil data-icon="inline-start" />
            Open the full whiteboard
          </Link>
        </Button>
      </Reveal>
      <Reveal delay={80} className="lg:col-span-3">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          aria-label="Drawing sandbox"
          className="h-64 w-full touch-none cursor-crosshair rounded-2xl bg-white shadow-2xl sm:h-80"
        />
      </Reveal>
    </div>
  );
}
