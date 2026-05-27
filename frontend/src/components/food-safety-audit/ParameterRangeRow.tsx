"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Minus } from "lucide-react";

interface ParameterRangeRowProps {
  feature: string;
  unidad: string;
  hh?: number | null;
  hs?: number | null;
  sp?: number | null;
  l?: number | null;
  ll?: number | null;
  ultimoValor?: number | null;
  valorActual?: number | null;
  valorActualSuperior?: number | null;
  valorActualInferior?: number | null;
  onChange: (val: number | null) => void;
  onChangeSuperior?: (val: number | null) => void;
  onChangeInferior?: (val: number | null) => void;
  observacion?: string;
  onObservacionChange?: (val: string) => void;
  showObservacion?: boolean;
  track?: number;
  actualMode?: "single" | "dual";
}

type CellState = "empty" | "ok" | "warn" | "error";

function getCellState(
  val: number | null | undefined,
  hh: number | null | undefined,
  hs: number | null | undefined,
  l: number | null | undefined,
  ll: number | null | undefined
): CellState {
  if (val === null || val === undefined || (val === 0 && hh === null)) return "empty";
  if (ll != null && val < ll) return "error";
  if (hh != null && val > hh) return "error";
  if (
    (ll != null && l != null && val >= ll && val < l) ||
    (hs != null && hh != null && val > hs && val <= hh)
  ) return "warn";
  return "ok";
}

function formatLimit(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("es-MX", { maximumFractionDigits: 3 });
}

const getCellClass = (state: CellState) => state === "ok" ? "fsa-cell-ok"
  : state === "warn" ? "fsa-cell-warn"
  : state === "error" ? "fsa-cell-error"
  : "";

const getStatusIcon = (state: CellState) => state === "ok" ? <CheckCircle2 size={14} color="#16a34a" />
  : state === "warn" ? <AlertTriangle size={14} color="#d97706" />
  : state === "error" ? <AlertTriangle size={14} color="#dc2626" />
  : null;

export function ParameterRangeRow({
  feature, unidad, hh, hs, sp, l, ll,
  ultimoValor, valorActual, valorActualSuperior, valorActualInferior, onChange,
  onChangeSuperior, onChangeInferior,
  observacion = "", onObservacionChange, showObservacion = false,
  track, actualMode = "single"
}: ParameterRangeRowProps) {
  const actualSuperior = valorActualSuperior ?? valorActual ?? null;
  const actualInferior = valorActualInferior ?? null;
  const observationColSpan = actualMode === "dual" ? 9 : 8;

  const singleState = useMemo(
    () => getCellState(valorActual, hh, hs, l, ll),
    [valorActual, hh, hs, l, ll]
  );

  const upperState = useMemo(
    () => getCellState(actualSuperior, hh, hs, l, ll),
    [actualSuperior, hh, hs, l, ll]
  );

  const lowerState = useMemo(
    () => getCellState(actualInferior, hh, hs, l, ll),
    [actualInferior, hh, hs, l, ll]
  );

  const renderActualInput = (
    value: number | null,
    state: CellState,
    handleChange: (val: number | null) => void,
    label: string,
  ) => (
    <td className={getCellClass(state)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <input
          type="number"
          step="any"
          value={value ?? ""}
          onChange={e => handleChange(e.target.value === "" ? null : parseFloat(e.target.value))}
          className="fsa-value-input"
          placeholder={label}
          aria-label={`${feature} ${label}`}
        />
        {getStatusIcon(state)}
      </div>
    </td>
  );

  return (
    <>
      <tr>
        <td>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {track !== undefined && (
              <span style={{
                background: "#f1f5f9", color: "#64748b",
                fontSize: 10, fontWeight: 700, borderRadius: 4,
                padding: "1px 5px", whiteSpace: "nowrap"
              }}>
                TR{track}
              </span>
            )}
            <span style={{ fontSize: 13 }}>{feature}</span>
          </div>
          {unidad && (
            <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: track !== undefined ? 32 : 0 }}>
              [{unidad}]
            </span>
          )}
        </td>
        <td><span className="fsa-limit-cell fsa-limit-hh">{formatLimit(hh)}</span></td>
        <td><span className="fsa-limit-cell fsa-limit-hs">{formatLimit(hs)}</span></td>
        <td><span className="fsa-limit-cell fsa-limit-sp">{formatLimit(sp)}</span></td>
        <td><span className="fsa-limit-cell fsa-limit-l">{formatLimit(l)}</span></td>
        <td><span className="fsa-limit-cell fsa-limit-ll">{formatLimit(ll)}</span></td>
        <td>
          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
            {ultimoValor != null ? formatLimit(ultimoValor) : <Minus size={12} color="#cbd5e1" />}
          </span>
        </td>
        {actualMode === "dual" ? (
          <>
            {renderActualInput(actualSuperior, upperState, onChangeSuperior ?? onChange, "Sup.")}
            {renderActualInput(actualInferior, lowerState, onChangeInferior ?? onChange, "Inf.")}
          </>
        ) : (
          renderActualInput(valorActual ?? null, singleState, onChange, "—")
        )}
      </tr>
      {showObservacion && onObservacionChange && (
        <tr>
          <td colSpan={observationColSpan} style={{ paddingTop: 0, paddingLeft: 16, paddingBottom: 8 }}>
            <input
              type="text"
              value={observacion}
              onChange={e => onObservacionChange(e.target.value)}
              className="fsa-input"
              style={{ fontSize: 12, padding: "6px 12px" }}
              placeholder="Observacion (opcional)..."
            />
          </td>
        </tr>
      )}
    </>
  );
}
