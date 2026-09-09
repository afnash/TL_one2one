"use client";

import { useLMS } from "@/lib/store";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  ChangeEvent,
} from "react";
import {
  Whiteboard,
  WhiteboardElement,
  WhiteboardElementType,
} from "@/types";
import {
  MousePointer,
  Hand,
  Pencil,
  Highlighter,
  Eraser,
  Minus,
  MoveRight,
  Square,
  Circle as CircleIcon,
  Type,
  StickyNote,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Download,
  FileDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhiteboardCanvasProps {
  initialWhiteboard?: Whiteboard;
  whiteboardId?: string;
  onSave?: (elements: WhiteboardElement[], previousElements?: WhiteboardElement[]) => void;
  readOnly?: boolean;
  roleLabel?: string;
  showTeacherTools?: boolean;
  className?: string;
  onAddQuestion?: () => void;
}

const COLOR_PALETTE = [
  "#1e293b", // Slate black
  "#4f46e5", // Indigo
  "#0284c7", // Sky blue
  "#16a34a", // Emerald green
  "#ea580c", // Amber orange
  "#dc2626", // Crimson red
  "#9333ea", // Purple
];

const STROKE_WIDTHS = [2, 4, 8, 14];

export function WhiteboardCanvas({
  initialWhiteboard,
  onSave,
  readOnly: suppliedReadOnly = false,
  roleLabel = "Live Board",
  showTeacherTools = true,
  className,
}: WhiteboardCanvasProps) {
  const { user, role, sessions, submissions, saving, connectionError } = useLMS();
  const session = sessions.find(s => s.whiteboardId === initialWhiteboard?.id);
  const readOnly = suppliedReadOnly || (role === "STUDENT" && (initialWhiteboard?.category === "ASSIGNMENT_QUESTION" || submissions.some(s=>s.whiteboardId===initialWhiteboard?.id && ["SUBMITTED","REVIEWED"].includes(s.status)))) || (role === "STUDENT" && !!session && (session.status !== "LIVE" || ((session.studentIds?.length || 1) > 1 && !session.writerIds?.includes(user.id))));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageCacheRef = useRef(new Map<string, HTMLImageElement>());
  const [imageLoadVersion, setImageLoadVersion] = useState(0);

  // Whiteboard elements state with undo/redo history
  const [elements, setElements] = useState<WhiteboardElement[]>(
    initialWhiteboard?.elements || []
  );
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Active Tool state
  const [activeTool, setActiveTool] = useState<WhiteboardElementType | "pan" | "select">("pen");
  const [activeColor, setActiveColor] = useState<string>("#4f46e5");
  const [activeStrokeWidth, setActiveStrokeWidth] = useState<number>(3);
  const [activeStamp, setActiveStamp] = useState<"correct" | "incorrect" | "review" | "star">("correct");

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
    before: WhiteboardElement[];
    currentX: number;
    currentY: number;
  } | null>(null);

  // Text input overlay state
  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

  // Notify parent of updates
  const notifySave = useCallback(
    (newElements: WhiteboardElement[]) => {
      if (onSave) {
        onSave(newElements, elements);
      }
    },
    [onSave, elements]
  );

  // Push element state to history
  const pushToHistory = useCallback(
    (newElements: WhiteboardElement[]) => {
      setHistory((prev) => {
        const nextHist = prev.slice(0, historyIndex + 1);
        return [...nextHist, newElements];
      });
      setHistoryIndex((prev) => prev + 1);
      setElements(newElements);
      notifySave(newElements);
    },
    [historyIndex, notifySave]
  );

  // Sync with initial whiteboard when changed
  useEffect(() => {
    if (initialWhiteboard?.elements) {
      setElements(initialWhiteboard.elements);
      setHistory([initialWhiteboard.elements]);
      setHistoryIndex(0);
    }
  }, [initialWhiteboard?.id]);

  useEffect(() => { if (!isDrawing && !draggedElement && initialWhiteboard?.elements) setElements(initialWhiteboard.elements); }, [initialWhiteboard?.elements, isDrawing, draggedElement]);

  // Handle canvas sizing and redraw
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Apply Pan & Zoom transformation
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw all confirmed elements
    const allToDraw = currentElement ? [...elements, currentElement] : elements;

    allToDraw.forEach((el) => {
      ctx.save();

      switch (el.type) {
        case "pen":
        case "highlighter": {
          if (!el.points || el.points.length === 0) break;
          ctx.beginPath();
          ctx.strokeStyle = el.strokeColor;
          ctx.lineWidth = el.strokeWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          if (el.type === "highlighter") {
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = el.strokeWidth * 3.5;
          }
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
          break;
        }

        case "line": {
          if (!el.points || el.points.length < 2) break;
          ctx.beginPath();
          ctx.strokeStyle = el.strokeColor;
          ctx.lineWidth = el.strokeWidth;
          ctx.lineCap = "round";
          ctx.moveTo(el.points[0].x, el.points[0].y);
          ctx.lineTo(el.points[1].x, el.points[1].y);
          ctx.stroke();
          break;
        }

        case "arrow": {
          if (!el.points || el.points.length < 2) break;
          const from = el.points[0];
          const to = el.points[1];
          ctx.beginPath();
          ctx.strokeStyle = el.strokeColor;
          ctx.fillStyle = el.strokeColor;
          ctx.lineWidth = el.strokeWidth;
          ctx.lineCap = "round";
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();

          // Draw arrowhead
          const headlen = 14;
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          ctx.beginPath();
          ctx.moveTo(to.x, to.y);
          ctx.lineTo(
            to.x - headlen * Math.cos(angle - Math.PI / 6),
            to.y - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            to.x - headlen * Math.cos(angle + Math.PI / 6),
            to.y - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
          break;
        }

        case "rectangle": {
          ctx.beginPath();
          ctx.strokeStyle = el.strokeColor;
          ctx.lineWidth = el.strokeWidth;
          if (el.fillColor) {
            ctx.fillStyle = el.fillColor;
            ctx.fillRect(el.x, el.y, el.width || 100, el.height || 80);
          }
          ctx.strokeRect(el.x, el.y, el.width || 100, el.height || 80);
          break;
        }

        case "circle": {
          ctx.beginPath();
          ctx.strokeStyle = el.strokeColor;
          ctx.lineWidth = el.strokeWidth;
          const radiusX = Math.abs((el.width || 80) / 2);
          const radiusY = Math.abs((el.height || 80) / 2);
          const centerX = el.x + radiusX;
          const centerY = el.y + radiusY;
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          if (el.fillColor) {
            ctx.fillStyle = el.fillColor;
            ctx.fill();
          }
          ctx.stroke();
          break;
        }

        case "sticky": {
          // Sticky note container
          ctx.fillStyle = el.fillColor || "#fef3c7";
          ctx.strokeStyle = el.strokeColor || "#f59e0b";
          ctx.lineWidth = 1;
          const sw = el.width || 220;
          const sh = el.height || 140;
          ctx.fillRect(el.x, el.y, sw, sh);
          ctx.strokeRect(el.x, el.y, sw, sh);

          // Header tape / pin
          ctx.fillStyle = "rgba(0,0,0,0.06)";
          ctx.fillRect(el.x, el.y, sw, 20);

          // Content
          if (el.text) {
            ctx.font = "14px 'Inter', sans-serif";
            ctx.fillStyle = "#1e293b";
            const lines = el.text.split("\n");
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x + 12, el.y + 42 + idx * 20);
            });
          }
          break;
        }

        case "image": {
          if (!el.imageUrl) break;
          let image = imageCacheRef.current.get(el.imageUrl);
          if (!image) {
            image = new Image();
            image.onload = () => setImageLoadVersion((version) => version + 1);
            image.src = el.imageUrl;
            imageCacheRef.current.set(el.imageUrl, image);
          }
          const imageWidth = el.width || 320;
          const imageHeight = el.height || 240;
          if (image.complete && image.naturalWidth) {
            ctx.drawImage(image, el.x, el.y, imageWidth, imageHeight);
          }
          ctx.strokeStyle = el.id === selectedElementId ? "#4f46e5" : "#cbd5e1";
          ctx.lineWidth = (el.id === selectedElementId ? 2 : 1) / zoom;
          ctx.setLineDash(el.id === selectedElementId ? [7 / zoom, 5 / zoom] : []);
          ctx.strokeRect(el.x, el.y, imageWidth, imageHeight);
          break;
        }

        case "question_card": {
          const qw = el.width || 440;
          const qh = el.height || 100;
          // Card background
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(el.x, el.y, qw, qh, 8) : ctx.rect(el.x, el.y, qw, qh);
          ctx.fill();
          ctx.stroke();

          // Left indicator bar
          ctx.fillStyle = el.strokeColor || "#4f46e5";
          ctx.fillRect(el.x, el.y, 6, qh);

          // Header
          ctx.font = "bold 13px 'Inter', sans-serif";
          ctx.fillStyle = el.strokeColor || "#4f46e5";
          ctx.fillText(`QUESTION ${el.questionNumber || 1}`, el.x + 18, el.y + 26);

          // Question Prompt
          ctx.font = "500 14px 'Inter', sans-serif";
          ctx.fillStyle = "#0f172a";
          if (el.questionText) {
            ctx.fillText(el.questionText, el.x + 18, el.y + 54);
          }
          break;
        }

        case "text": {
          if (!el.text) break;
          ctx.font = `${el.fontSize || 16}px 'Inter', sans-serif`;
          ctx.fillStyle = el.strokeColor || "#1e293b";
          const lines = el.text.split("\n");
          lines.forEach((line, idx) => {
            ctx.fillText(line, el.x, el.y + idx * ((el.fontSize || 16) * 1.3));
          });
          break;
        }

        case "stamp": {
          const size = 32;
          ctx.lineWidth = 2;
          if (el.stampType === "correct") {
            ctx.fillStyle = "#16a34a";
            ctx.beginPath();
            ctx.arc(el.x + size / 2, el.y + size / 2, size / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.font = "bold 18px 'Inter', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("✓", el.x + 10, el.y + 23);
          } else if (el.stampType === "incorrect") {
            ctx.fillStyle = "#dc2626";
            ctx.beginPath();
            ctx.arc(el.x + size / 2, el.y + size / 2, size / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.font = "bold 18px 'Inter', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("✗", el.x + 11, el.y + 23);
          } else if (el.stampType === "review") {
            ctx.fillStyle = "#d97706";
            ctx.beginPath();
            ctx.arc(el.x + size / 2, el.y + size / 2, size / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.font = "bold 16px 'Inter', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("!", el.x + 13, el.y + 22);
          } else if (el.stampType === "star") {
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.arc(el.x + size / 2, el.y + size / 2, size / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.font = "bold 16px 'Inter', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("★", el.x + 10, el.y + 22);
          }
          break;
        }
      }

      ctx.restore();
    });

    ctx.restore();
  }, [elements, currentElement, pan, zoom, selectedElementId]);

  useEffect(() => {
    // imageLoadVersion redraws newly decoded clipboard images from the cache.
    if (imageLoadVersion >= 0) redrawCanvas();
  }, [redrawCanvas, imageLoadVersion]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => redrawCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [redrawCanvas]);

  // Prevent trackpad/wheel panning from scrolling the page and moving the toolbar.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleCanvasWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        setZoom((previous) => Math.min(3, Math.max(0.4, previous * zoomFactor)));
      } else {
        setPan((previous) => ({
          x: previous.x - event.deltaX,
          y: previous.y - event.deltaY,
        }));
      }
    };
    canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleCanvasWheel);
  }, []);

  // Paste bitmap images into the visible center of the virtual canvas.
  useEffect(() => {
    if (readOnly) return;
    const handlePaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.items || [])
        .find((item) => item.kind === "file" && item.type.startsWith("image/"))?.getAsFile();
      if (!file) return;
      event.preventDefault();
      if (file.size > 10 * 1024 * 1024) {
        window.alert("Paste an image smaller than 10 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const source = typeof reader.result === "string" ? reader.result : "";
        const pastedImage = new Image();
        pastedImage.onload = () => {
          const maxSide = 1000;
          const scale = Math.min(1, maxSide / Math.max(pastedImage.naturalWidth, pastedImage.naturalHeight));
          const pixelWidth = Math.max(1, Math.round(pastedImage.naturalWidth * scale));
          const pixelHeight = Math.max(1, Math.round(pastedImage.naturalHeight * scale));
          const buffer = document.createElement("canvas");
          buffer.width = pixelWidth;
          buffer.height = pixelHeight;
          const context = buffer.getContext("2d");
          if (!context) return;
          context.drawImage(pastedImage, 0, 0, pixelWidth, pixelHeight);
          const imageUrl = buffer.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.86);
          if (imageUrl.length > 1_800_000) {
            window.alert("This image is too detailed for the shared whiteboard. Paste a smaller image.");
            return;
          }
          const canvas = canvasRef.current;
          if (!canvas) return;
          const displayScale = Math.min(1, 520 / pixelWidth, 380 / pixelHeight);
          const width = Math.max(80, pixelWidth * displayScale);
          const height = Math.max(60, pixelHeight * displayScale);
          const x = (canvas.clientWidth / 2 - pan.x) / zoom - width / 2;
          const y = (canvas.clientHeight / 2 - pan.y) / zoom - height / 2;
          const imageElement: WhiteboardElement = {
            id: crypto.randomUUID(), type: "image", x, y, width, height, imageUrl,
            strokeColor: "#cbd5e1", strokeWidth: 1,
          };
          pushToHistory([...elements, imageElement]);
          setSelectedElementId(imageElement.id);
          setActiveTool("select");
        };
        pastedImage.src = source;
      };
      reader.readAsDataURL(file);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [elements, pan.x, pan.y, pushToHistory, readOnly, zoom]);

  // Mouse Coordinates converted to Virtual Canvas Coordinates
  const getCanvasCoords = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    return {
      x: (rawX - pan.x) / zoom,
      y: (rawY - pan.y) / zoom,
    };
  };

  // Mouse Down
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const { x, y } = getCanvasCoords(e);

    // Pan mode or Middle mouse button
    if (activeTool === "pan" || e.button === 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (activeTool === "select") {
      const image = [...elements].reverse().find((element) =>
        element.type === "image" && x >= element.x && x <= element.x + (element.width || 320) &&
        y >= element.y && y <= element.y + (element.height || 240)
      );
      setSelectedElementId(image?.id || null);
      if (image) {
        setDraggedElement({
          id: image.id, offsetX: x - image.x, offsetY: y - image.y,
          before: elements, currentX: image.x, currentY: image.y,
        });
      }
      return;
    }

    if (activeTool === "text") {
      setTextInput({
        visible: true,
        x,
        y,
        text: "",
      });
      return;
    }

    if (activeTool === "stamp") {
      const newElement: WhiteboardElement = {
        id: crypto.randomUUID(),
        type: "stamp",
        x: x - 16,
        y: y - 16,
        stampType: activeStamp,
        strokeColor: activeColor,
        strokeWidth: 2,
      };
      pushToHistory([...elements, newElement]);
      return;
    }

    if (activeTool === "sticky") {
      const newElement: WhiteboardElement = {
        id: crypto.randomUUID(),
        type: "sticky",
        x: x - 100,
        y: y - 60,
        width: 220,
        height: 120,
        text: "Note:\nType your comment here...",
        strokeColor: "#f59e0b",
        fillColor: "#fef3c7",
        strokeWidth: 1,
      };
      pushToHistory([...elements, newElement]);
      return;
    }

    if (activeTool === "eraser") {
      // Find element closest to click point to delete
      const filtered = elements.filter((el) => {
        if (el.points && el.points.length > 0) {
          return !el.points.some(
            (p) => Math.hypot(p.x - x, p.y - y) < (el.strokeWidth + 12)
          );
        }
        const w = el.width || 80;
        const h = el.height || 80;
        return !(x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h);
      });
      if (filtered.length !== elements.length) {
        pushToHistory(filtered);
      }
      return;
    }

    setIsDrawing(true);

    if (activeTool === "pen" || activeTool === "highlighter") {
      setCurrentElement({
        id: crypto.randomUUID(),
        type: activeTool,
        x,
        y,
        points: [{ x, y }],
        strokeColor: activeColor,
        strokeWidth: activeStrokeWidth,
      });
    } else if (activeTool === "line" || activeTool === "arrow") {
      setCurrentElement({
        id: `el-${Date.now()}`,
        type: activeTool,
        x,
        y,
        points: [
          { x, y },
          { x, y },
        ],
        strokeColor: activeColor,
        strokeWidth: activeStrokeWidth,
      });
    } else if (activeTool === "rectangle" || activeTool === "circle") {
      setCurrentElement({
        id: `el-${Date.now()}`,
        type: activeTool,
        x,
        y,
        width: 0,
        height: 0,
        strokeColor: activeColor,
        strokeWidth: activeStrokeWidth,
      });
    }
  };

  // Mouse Move
  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }

    if (draggedElement) {
      const { x, y } = getCanvasCoords(e);
      const nextX = x - draggedElement.offsetX;
      const nextY = y - draggedElement.offsetY;
      setElements((previous) => previous.map((element) => element.id === draggedElement.id
        ? { ...element, x: nextX, y: nextY }
        : element));
      setDraggedElement((previous) => previous ? { ...previous, currentX: nextX, currentY: nextY } : null);
      return;
    }

    if (!isDrawing || !currentElement) return;
    const { x, y } = getCanvasCoords(e);

    if (currentElement.type === "pen" || currentElement.type === "highlighter") {
      setCurrentElement((prev) => {
        if (!prev || !prev.points) return prev;
        return {
          ...prev,
          points: [...prev.points, { x, y }],
        };
      });
    } else if (currentElement.type === "line" || currentElement.type === "arrow") {
      setCurrentElement((prev) => {
        if (!prev || !prev.points) return prev;
        return {
          ...prev,
          points: [prev.points[0], { x, y }],
        };
      });
    } else if (currentElement.type === "rectangle" || currentElement.type === "circle") {
      setCurrentElement((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          width: x - prev.x,
          height: y - prev.y,
        };
      });
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggedElement) {
      const movedElements = draggedElement.before.map((element) => element.id === draggedElement.id
        ? { ...element, x: draggedElement.currentX, y: draggedElement.currentY }
        : element);
      setElements(movedElements);
      setHistory((previous) => [...previous.slice(0, historyIndex + 1), movedElements]);
      setHistoryIndex((previous) => previous + 1);
      onSave?.(movedElements, draggedElement.before);
      setDraggedElement(null);
      return;
    }

    if (isDrawing && currentElement) {
      setIsDrawing(false);
      pushToHistory([...elements, currentElement]);
      setCurrentElement(null);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setElements(history[nextIdx]);
      notifySave(history[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setElements(history[nextIdx]);
      notifySave(history[nextIdx]);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear this whiteboard?")) {
      pushToHistory([]);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.text.trim()) {
      setTextInput({ visible: false, x: 0, y: 0, text: "" });
      return;
    }

    const newElement: WhiteboardElement = {
      id: crypto.randomUUID(),
      type: "text",
      x: textInput.x,
      y: textInput.y,
      text: textInput.text,
      strokeColor: activeColor,
      strokeWidth: 2,
      fontSize: 18,
    };

    pushToHistory([...elements, newElement]);
    setTextInput({ visible: false, x: 0, y: 0, text: "" });
  };

  // Export as PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `whiteboard-${initialWhiteboard?.title || "export"}.png`;
    a.click();
  };

  // Export as PDF (Vector print simulation)
  const handleExportPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const imgData = canvas.toDataURL("image/png");
    printWindow.document.write(`
      <html>
        <head>
          <title>${initialWhiteboard?.title || "Whiteboard Export"}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; background: #f8fafc; }
            .header { width: 100%; max-width: 900px; padding: 24px; display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; }
            img { max-width: 95%; height: auto; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background: white; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin:0;color:#1e293b;">${initialWhiteboard?.title || "1-to-1 Learning Whiteboard"}</h2>
              <p style="margin:4px 0 0 0;color:#64748b;font-size:13px;">Subject: ${initialWhiteboard?.subject || "General"} | Student: ${initialWhiteboard?.studentName || "Class"}</p>
            </div>
            <div style="text-align:right;color:#64748b;font-size:12px;">
              Generated: ${new Date().toLocaleDateString()}
            </div>
          </div>
          <img src="${imgData}" onload="window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative isolate w-full h-full min-h-[480px] flex flex-col bg-white overflow-hidden overscroll-contain select-none border border-slate-200 rounded-xl shadow-xs",
        className
      )}
    >
      {/* Top Floating Control Toolbar */}
      {!readOnly && (
        <div className="absolute top-4 left-4 z-40 flex max-w-[calc(100%-8rem)] flex-wrap items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-sm text-slate-700">
          {/* Tool Selector Buttons */}
          <button
            title="Select & Move (V)"
            onClick={() => setActiveTool("select")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "select" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          <button
            title="Hand / Pan Infinite Canvas (H)"
            onClick={() => setActiveTool("pan")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "pan" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <Hand className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

          <button
            title="Pen (P)"
            onClick={() => setActiveTool("pen")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "pen" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            title="Highlighter"
            onClick={() => setActiveTool("highlighter")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "highlighter" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            title="Eraser (E)"
            onClick={() => setActiveTool("eraser")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "eraser" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

          {/* Shapes */}
          <button
            title="Line"
            onClick={() => setActiveTool("line")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "line" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            title="Arrow"
            onClick={() => setActiveTool("arrow")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "arrow" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <MoveRight className="w-4 h-4" />
          </button>

          <button
            title="Rectangle"
            onClick={() => setActiveTool("rectangle")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "rectangle" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            title="Circle"
            onClick={() => setActiveTool("circle")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "circle" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <CircleIcon className="w-4 h-4" />
          </button>

          <button
            title="Text Box"
            onClick={() => setActiveTool("text")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "text" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            title="Sticky Note"
            onClick={() => setActiveTool("sticky")}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center hover:bg-slate-100",
              activeTool === "sticky" && "bg-indigo-50 text-indigo-600 font-semibold shadow-xs"
            )}
          >
            <StickyNote className="w-4 h-4" />
          </button>

          {/* Teacher Grading & Annotation Stamps */}
          {showTeacherTools && (
            <>
              <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
              <div className="flex items-center gap-1 bg-slate-50 px-1 py-0.5 rounded-lg border border-slate-200">
                <button
                  title="Correct Mark Stamp (✓)"
                  onClick={() => {
                    setActiveTool("stamp");
                    setActiveStamp("correct");
                  }}
                  className={cn(
                    "p-1.5 rounded transition-all text-emerald-600 hover:bg-emerald-50",
                    activeTool === "stamp" && activeStamp === "correct" && "bg-emerald-100 font-bold ring-1 ring-emerald-400"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  title="Incorrect Mark Stamp (✗)"
                  onClick={() => {
                    setActiveTool("stamp");
                    setActiveStamp("incorrect");
                  }}
                  className={cn(
                    "p-1.5 rounded transition-all text-rose-600 hover:bg-rose-50",
                    activeTool === "stamp" && activeStamp === "incorrect" && "bg-rose-100 font-bold ring-1 ring-rose-400"
                  )}
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  title="Needs Review Stamp (!)"
                  onClick={() => {
                    setActiveTool("stamp");
                    setActiveStamp("review");
                  }}
                  className={cn(
                    "p-1.5 rounded transition-all text-amber-600 hover:bg-amber-50",
                    activeTool === "stamp" && activeStamp === "review" && "bg-amber-100 font-bold ring-1 ring-amber-400"
                  )}
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
                <button
                  title="Star Stamp (★)"
                  onClick={() => {
                    setActiveTool("stamp");
                    setActiveStamp("star");
                  }}
                  className={cn(
                    "p-1.5 rounded transition-all text-yellow-500 hover:bg-yellow-50",
                    activeTool === "stamp" && activeStamp === "star" && "bg-yellow-100 font-bold ring-1 ring-yellow-400"
                  )}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            </>
          )}

          <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

          {/* Color Palette Picker */}
          <div className="flex items-center gap-1 px-1">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setActiveColor(c)}
                className={cn(
                  "w-4 h-4 rounded-full transition-transform border border-slate-300",
                  activeColor === c ? "scale-125 ring-2 ring-indigo-500 ring-offset-1" : "hover:scale-110"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw}
                onClick={() => setActiveStrokeWidth(sw)}
                className={cn(
                  "px-1.5 py-1 text-[11px] font-medium rounded hover:bg-slate-100 transition-colors",
                  activeStrokeWidth === sw && "bg-slate-200 text-slate-900 font-bold"
                )}
              >
                {sw}px
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Right Action Tools (Undo/Redo, Zoom, PDF/PNG Export) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-sm text-slate-700">
        {!readOnly && (
          <>
            <button
              title="Undo (Ctrl+Z)"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              title="Redo (Ctrl+Y)"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
          </>
        )}

        {/* Zoom Controls */}
        <button
          title="Zoom Out"
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-slate-600 min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          title="Zoom In"
          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          title="Reset View"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

        {/* Export options */}
        <button
          title="Export as PNG"
          onClick={handleExportPNG}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          title="Export as PDF"
          onClick={handleExportPDF}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" />
          PDF
        </button>

        {!readOnly && (
          <button
            title="Clear Board"
            onClick={handleClear}
            className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Drawing Canvas with Dot Grid */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          "w-full h-full min-h-0 flex-1 bg-grid-dots bg-[#fafbfd] touch-none cursor-crosshair",
          activeTool === "pan" && "cursor-grab active:cursor-grabbing",
          activeTool === "select" && (draggedElement ? "cursor-grabbing" : "cursor-grab"),
          activeTool === "eraser" && "cursor-pointer"
        )}
      />

      {/* Inline Text Editor Popup */}
      {textInput.visible && (
        <div
          className="absolute z-30 p-2 bg-white border border-slate-300 rounded-lg shadow-lg"
          style={{
            left: `${textInput.x * zoom + pan.x}px`,
            top: `${textInput.y * zoom + pan.y}px`,
          }}
        >
          <textarea
            autoFocus
            rows={3}
            value={textInput.text}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setTextInput((prev) => ({ ...prev, text: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit();
              }
            }}
            placeholder="Type your notes or mathematical expressions..."
            className="w-64 p-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
          <div className="flex justify-end gap-1 mt-1">
            <button
              onClick={() => setTextInput({ visible: false, x: 0, y: 0, text: "" })}
              className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleTextSubmit}
              className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Place Text
            </button>
          </div>
        </div>
      )}



      {/* Bottom Status & Info Bar */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg text-xs text-slate-500 shadow-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{initialWhiteboard?.title || "Collaborative Canvas"}</span>
        </div>
        <span className="text-slate-300">|</span>
        <span>{elements.length} elements</span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1 text-indigo-600 font-medium">
          <Sparkles className="w-3 h-3" /> {connectionError ? "Not saved ? check connection" : saving ? "Saving?" : "Synced"}
        </span>
      </div>
    </div>
  );
}
