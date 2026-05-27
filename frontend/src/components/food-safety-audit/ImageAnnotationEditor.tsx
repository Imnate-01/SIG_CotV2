"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  X, Square, Circle, ArrowRight, Pencil, Type,
  Undo2, Trash2, Loader2, Save,
} from "lucide-react";
import { foodSafetyAuditApi } from "@/services/foodSafetyAudit";
import { EvidenceImageItem } from "./EvidenceUploader";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Tool = "rect" | "ellipse" | "arrow" | "pen" | "text";

interface BaseShape { color: string; sw: number; }
interface RectShape   extends BaseShape { type: "rect";    x: number; y: number; w: number; h: number; }
interface EllShape    extends BaseShape { type: "ellipse"; x: number; y: number; w: number; h: number; }
interface ArrowShape  extends BaseShape { type: "arrow";   x1: number; y1: number; x2: number; y2: number; }
interface PenShape    extends BaseShape { type: "pen";     pts: [number, number][]; }
interface TextShape   extends BaseShape { type: "text";    x: number; y: number; text: string; size: number; }

type Shape = RectShape | EllShape | ArrowShape | PenShape | TextShape;

export interface ImageAnnotationEditorProps {
  auditId: number;
  copFindingId?: number;
  paramId?: number;
  image: EvidenceImageItem;
  onSaved: (oldId: number, newImg: EvidenceImageItem) => void;
  onClose: () => void;
}

// ─── Paleta y opciones ────────────────────────────────────────────────────────

const COLORS = [
  { hex: "#ef4444", label: "Rojo" },
  { hex: "#f97316", label: "Naranja" },
  { hex: "#facc15", label: "Amarillo" },
  { hex: "#22c55e", label: "Verde" },
  { hex: "#3b82f6", label: "Azul" },
  { hex: "#ffffff", label: "Blanco" },
  { hex: "#000000", label: "Negro" },
];

const WIDTHS: { val: number; label: string }[] = [
  { val: 3,  label: "Fino" },
  { val: 6,  label: "Medio" },
  { val: 12, label: "Grueso" },
];

// ─── Renderizado de formas ────────────────────────────────────────────────────

function renderShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.save();
  ctx.strokeStyle = shape.color;
  ctx.fillStyle   = shape.color;
  ctx.lineWidth   = shape.sw;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  // Sombra sutil para visibilidad sobre cualquier fondo
  ctx.shadowColor   = "rgba(0,0,0,0.6)";
  ctx.shadowBlur    = 5;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  switch (shape.type) {
    case "rect": {
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
      break;
    }
    case "ellipse": {
      const rx = Math.abs(shape.w) / 2;
      const ry = Math.abs(shape.h) / 2;
      ctx.beginPath();
      ctx.ellipse(shape.x + shape.w / 2, shape.y + shape.h / 2, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "arrow": {
      const { x1, y1, x2, y2 } = shape;
      const dx  = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 4) break;
      const angle   = Math.atan2(dy, dx);
      const headLen = Math.max(28, shape.sw * 5);

      // Línea del cuerpo (termina antes de la punta)
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 - Math.cos(angle) * headLen * 0.5, y2 - Math.sin(angle) * headLen * 0.5);
      ctx.stroke();

      // Cabeza de flecha rellena (triángulo)
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6.5), y2 - headLen * Math.sin(angle - Math.PI / 6.5));
      ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6.5), y2 - headLen * Math.sin(angle + Math.PI / 6.5));
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "pen": {
      if (shape.pts.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(shape.pts[0][0], shape.pts[0][1]);
      for (let i = 1; i < shape.pts.length; i++) ctx.lineTo(shape.pts[i][0], shape.pts[i][1]);
      ctx.stroke();
      break;
    }
    case "text": {
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      ctx.font = `bold ${shape.size}px Arial, sans-serif`;
      ctx.textBaseline = "top";
      const metrics = ctx.measureText(shape.text);
      const pad = 6;
      // Fondo oscuro para legibilidad
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(shape.x - pad, shape.y - pad, metrics.width + pad * 2, shape.size + pad * 2);
      // Texto
      ctx.fillStyle   = shape.color;
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur  = 3;
      ctx.fillText(shape.text, shape.x, shape.y);
      break;
    }
  }
  ctx.restore();
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ImageAnnotationEditor({
  auditId, copFindingId, paramId, image, onSaved, onClose,
}: ImageAnnotationEditorProps) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const imageRef       = useRef<HTMLImageElement | null>(null);
  const textInputRef   = useRef<HTMLInputElement>(null);

  const [tool,          setTool]         = useState<Tool>("rect");
  const [color,         setColor]        = useState("#ef4444");
  const [sw,            setSw]           = useState(6);
  const [shapes,        setShapes]       = useState<Shape[]>([]);
  const [history,       setHistory]      = useState<Shape[][]>([[]]);
  const [isDrawing,     setIsDrawing]    = useState(false);
  const [currentShape,  setCurrentShape] = useState<Shape | null>(null);
  const [imageLoaded,   setImageLoaded]  = useState(false);
  const [imageError,    setImageError]   = useState(false);
  const [saving,        setSaving]       = useState(false);
  // Text tool: pending placement
  const [textPending,   setTextPending]  = useState<{ dispX: number; dispY: number; cvX: number; cvY: number } | null>(null);
  const [textValue,     setTextValue]    = useState("");

  // ── Carga de imagen ──────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; }
      setImageLoaded(true);
    };
    img.onerror = () => setImageError(true);
    img.src = image.url_report;
  }, [image.url_report]);

  // ── Redibujado ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const img    = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    shapes.forEach(s => renderShape(ctx, s));
    if (currentShape) renderShape(ctx, currentShape);
  }, [shapes, currentShape, imageLoaded]);

  // ── Coordenadas canvas ───────────────────────────────────────────────────
  const toCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    return {
      x:     (e.clientX - rect.left) * (canvas.width  / rect.width),
      y:     (e.clientY - rect.top)  * (canvas.height / rect.height),
      dispX: e.clientX - rect.left,
      dispY: e.clientY - rect.top,
    };
  };

  // ── Eventos de dibujo ────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (tool === "text") {
      const { x, y, dispX, dispY } = toCanvas(e);
      setTextPending({ cvX: x, cvY: y, dispX, dispY });
      setTextValue("");
      setTimeout(() => textInputRef.current?.focus(), 30);
      return;
    }
    const { x, y } = toCanvas(e);
    setIsDrawing(true);
    if (tool === "rect")    setCurrentShape({ type: "rect",    x, y, w: 0, h: 0, color, sw });
    if (tool === "ellipse") setCurrentShape({ type: "ellipse", x, y, w: 0, h: 0, color, sw });
    if (tool === "arrow")   setCurrentShape({ type: "arrow",   x1: x, y1: y, x2: x, y2: y, color, sw });
    if (tool === "pen")     setCurrentShape({ type: "pen",     pts: [[x, y]], color, sw });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShape) return;
    const { x, y } = toCanvas(e);
    if (currentShape.type === "rect" || currentShape.type === "ellipse") {
      setCurrentShape({ ...currentShape, w: x - currentShape.x, h: y - currentShape.y });
    } else if (currentShape.type === "arrow") {
      setCurrentShape({ ...currentShape, x2: x, y2: y });
    } else if (currentShape.type === "pen") {
      setCurrentShape({ ...currentShape, pts: [...currentShape.pts, [x, y] as [number, number]] });
    }
  };

  const commitShape = () => {
    if (!isDrawing || !currentShape) return;
    setIsDrawing(false);
    // Solo confirmar si la forma tiene tamaño mínimo
    const ok = (() => {
      if (currentShape.type === "pen")  return currentShape.pts.length > 2;
      if (currentShape.type === "arrow") {
        const dx = currentShape.x2 - currentShape.x1, dy = currentShape.y2 - currentShape.y1;
        return Math.sqrt(dx * dx + dy * dy) > 12;
      }
      if (currentShape.type === "rect" || currentShape.type === "ellipse")
        return Math.abs(currentShape.w) > 6 || Math.abs(currentShape.h) > 6;
      return true;
    })();
    if (ok) {
      setShapes(prev => {
        const next = [...prev, currentShape!];
        setHistory(h => [...h, next]);
        return next;
      });
    }
    setCurrentShape(null);
  };

  // ── Herramienta de texto ─────────────────────────────────────────────────
  const commitText = useCallback(() => {
    if (textPending && textValue.trim()) {
      const canvas  = canvasRef.current;
      const fontSize = canvas ? Math.round(canvas.width / 28) : 40;
      const shape: TextShape = {
        type: "text", x: textPending.cvX, y: textPending.cvY,
        text: textValue.trim(), color, sw, size: Math.max(30, fontSize),
      };
      setShapes(prev => {
        const next = [...prev, shape];
        setHistory(h => [...h, next]);
        return next;
      });
    }
    setTextPending(null);
    setTextValue("");
  }, [textPending, textValue, color, sw]);

  // ── Historial ────────────────────────────────────────────────────────────
  const handleUndo = () => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setShapes(next[next.length - 1]);
      return next;
    });
  };

  const handleClear = () => { setShapes([]); setHistory([[]]); };

  // ── Guardar imagen anotada ────────────────────────────────────────────────
  // Usa el endpoint /replace que actualiza el registro EN LUGAR (mismo ID),
  // eliminando la ventana de tiempo donde existirían dos registros simultáneos
  // y evitando así la duplicación en el PDF.
  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || shapes.length === 0) return;
    setSaving(true);
    try {
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { reject(new Error("No se pudo exportar el canvas")); return; }
          try {
            const baseName = image.nombre_archivo.replace(/\.[^.]+$/, "_anotada.jpg");
            const file = new File([blob], baseName, { type: "image/jpeg" });
            const fd   = new FormData();
            fd.append("image",   file);
            if (copFindingId) fd.append("cop_finding_id", String(copFindingId));
            if (paramId)      fd.append("param_id",       String(paramId));
            // Reemplazar la imagen existente (actualiza el registro, mismo ID)
            const res = await foodSafetyAuditApi.images.replace(auditId, image.id, fd);
            if (!res.data?.success) throw new Error("Error al guardar la imagen anotada");
            onSaved(image.id, res.data.data as EvidenceImageItem);
            resolve();
          } catch (err) { reject(err); }
        }, "image/jpeg", 0.92);
      });
    } catch (err: any) {
      alert(`Error al guardar anotación: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [auditId, copFindingId, paramId, image, shapes.length, onSaved]);

  // ── Atajos de teclado ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (textPending) return; // No interferir con el input de texto
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); handleUndo(); }
      if (e.key === "Escape") onClose();
      if (e.key === "r") setTool("rect");
      if (e.key === "o") setTool("ellipse");
      if (e.key === "a") setTool("arrow");
      if (e.key === "p") setTool("pen");
      if (e.key === "t") setTool("text");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [textPending, onClose]);

  // ── Estilos de botones de herramienta ────────────────────────────────────
  const toolBtnStyle = (t: Tool): React.CSSProperties => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    padding: "7px 11px", borderRadius: 8, border: "none", cursor: "pointer",
    background: tool === t ? "#2563eb" : "#1e293b",
    color:      tool === t ? "#fff"    : "#94a3b8",
    fontSize: 10, fontWeight: 700, transition: "all 0.15s",
    outline: "none",
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.88)",
      display: "flex", flexDirection: "column",
      backdropFilter: "blur(6px)",
    }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", background: "#020617", flexShrink: 0,
        borderBottom: "1px solid #1e293b",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>
            ✏️ Editor de Anotaciones
          </span>
          <span style={{ fontSize: 11, color: "#64748b", background: "#0f172a", padding: "2px 8px", borderRadius: 20 }}>
            {image.nombre_archivo}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#475569" }}>
            R · O · A · P · T &nbsp;— atajos de herramienta &nbsp;|&nbsp; Ctrl+Z deshacer
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        padding: "10px 20px", background: "#0f172a", flexShrink: 0,
        borderBottom: "1px solid #1e293b",
      }}>
        {/* Herramientas */}
        <div style={{ display: "flex", gap: 5 }}>
          <button style={toolBtnStyle("rect")}    onClick={() => setTool("rect")}    title="Rectángulo (R)">
            <Square size={15} /> Rect.
          </button>
          <button style={toolBtnStyle("ellipse")} onClick={() => setTool("ellipse")} title="Círculo/elipse (O)">
            <Circle size={15} /> Círculo
          </button>
          <button style={toolBtnStyle("arrow")}   onClick={() => setTool("arrow")}   title="Flecha (A)">
            <ArrowRight size={15} /> Flecha
          </button>
          <button style={toolBtnStyle("pen")}     onClick={() => setTool("pen")}     title="Trazo libre (P)">
            <Pencil size={15} /> Trazo
          </button>
          <button style={toolBtnStyle("text")}    onClick={() => setTool("text")}    title="Texto (T)">
            <Type size={15} /> Texto
          </button>
        </div>

        <div style={{ width: 1, height: 36, background: "#1e293b" }} />

        {/* Colores */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {COLORS.map(c => (
            <button
              key={c.hex}
              title={c.label}
              onClick={() => setColor(c.hex)}
              style={{
                width: 22, height: 22, borderRadius: "50%", background: c.hex,
                border: color === c.hex ? "3px solid #fff" : "2px solid rgba(255,255,255,0.15)",
                cursor: "pointer", outline: "none", transition: "all 0.12s",
                boxShadow: color === c.hex ? "0 0 0 2px #3b82f6" : "none",
              }}
            />
          ))}
        </div>

        <div style={{ width: 1, height: 36, background: "#1e293b" }} />

        {/* Grosor */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {WIDTHS.map(w => (
            <button
              key={w.val}
              title={w.label}
              onClick={() => setSw(w.val)}
              style={{
                width: 38, height: 30, borderRadius: 7, border: "none", cursor: "pointer",
                background: sw === w.val ? "#1e3a5f" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                outline: sw === w.val ? "2px solid #3b82f6" : "none", outlineOffset: -2,
              }}
            >
              <div style={{
                width: 20, height: w.val === 3 ? 2 : w.val === 6 ? 4 : 7,
                borderRadius: 2, background: sw === w.val ? "#60a5fa" : "#475569",
              }} />
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 36, background: "#1e293b" }} />

        {/* Deshacer / limpiar */}
        <button
          onClick={handleUndo}
          disabled={history.length <= 1}
          title="Deshacer (Ctrl+Z)"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 7,
            border: "1px solid #1e293b", cursor: history.length <= 1 ? "not-allowed" : "pointer",
            background: "transparent", color: history.length <= 1 ? "#334155" : "#94a3b8", fontSize: 12,
          }}
        >
          <Undo2 size={13} /> Deshacer
        </button>
        <button
          onClick={handleClear}
          disabled={shapes.length === 0}
          title="Limpiar todas las anotaciones"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 7,
            border: "1px solid #1e293b", cursor: shapes.length === 0 ? "not-allowed" : "pointer",
            background: "transparent", color: shapes.length === 0 ? "#334155" : "#dc2626", fontSize: 12,
          }}
        >
          <Trash2 size={13} /> Limpiar
        </button>
      </div>

      {/* ── Área de canvas ── */}
      <div style={{
        flex: 1, overflow: "auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, background: "#020617",
      }}>
        {/* Estado de carga */}
        {!imageLoaded && !imageError && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#475569" }}>
            <Loader2 size={32} className="animate-spin" />
            <span style={{ fontSize: 13 }}>Cargando imagen para edición...</span>
          </div>
        )}
        {imageError && (
          <div style={{ textAlign: "center", color: "#ef4444", fontSize: 13 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>No se pudo cargar la imagen para edición.</p>
            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 12 }}>
              Verifica que el reporte esté guardado y que tengas conexión.
            </p>
          </div>
        )}

        {/* Canvas + input de texto */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            display: imageLoaded ? "inline-block" : "none",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              maxWidth: "min(90vw, 1100px)",
              maxHeight: "calc(100vh - 240px)",
              cursor: tool === "text" ? "text" : "crosshair",
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={commitShape}
            onMouseLeave={commitShape}
          />

          {/* Input flotante para la herramienta de texto */}
          {textPending && (
            <input
              ref={textInputRef}
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); commitText(); }
                if (e.key === "Escape") { setTextPending(null); setTextValue(""); }
              }}
              onBlur={commitText}
              placeholder="Escribir y Enter ↵"
              style={{
                position: "absolute",
                left: textPending.dispX,
                top:  Math.max(0, textPending.dispY - 26),
                background: "rgba(0,0,0,0.75)",
                color,
                border: `2px solid ${color}`,
                fontSize: 14, fontWeight: 700,
                padding: "4px 10px", borderRadius: 5, outline: "none",
                minWidth: 140, fontFamily: "Arial, sans-serif",
                boxShadow: `0 0 0 3px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.8)`,
                zIndex: 10,
              }}
            />
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", background: "#020617", borderTop: "1px solid #0f172a",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: "#334155" }}>
          {shapes.length === 0
            ? "Usa las herramientas para marcar áreas de interés en la foto"
            : `${shapes.length} anotación${shapes.length !== 1 ? "es" : ""} en la imagen`}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 22px", borderRadius: 8,
              border: "1px solid #1e293b", background: "transparent",
              color: "#64748b", cursor: "pointer", fontSize: 13,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || shapes.length === 0 || !imageLoaded}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 22px", borderRadius: 8, border: "none",
              background: saving || shapes.length === 0 ? "#1e293b" : "#2563eb",
              color:      saving || shapes.length === 0 ? "#475569" : "#fff",
              cursor: saving || shapes.length === 0 ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 700, transition: "all 0.15s",
            }}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Guardando...</>
              : <><Save size={14} /> Guardar imagen anotada</>}
          </button>
        </div>
      </div>
    </div>
  );
}
