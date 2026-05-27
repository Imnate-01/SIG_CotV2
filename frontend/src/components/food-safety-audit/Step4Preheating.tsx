"use client";

import React from "react";
import { Camera } from "lucide-react";
import { ParameterRangeRow } from "./ParameterRangeRow";
import { EvidenceUploader, EvidenceImageItem } from "./EvidenceUploader";

/* ─────────────────────────────────────────
   DATOS DE PARÁMETROS — Preheating & SST
───────────────────────────────────────── */

// Parámetros de Preheating & Drying por volumen
const PREHEATING_SETPOINTS = [
  { feature: "Temp. Preheating 500ml / Drive ON",       unidad: "°C", hh: 5,  hs: 5,  sp: 130, l: -5, ll: -5 },
  { feature: "Temp. Preheating 750ml / Drive ON",       unidad: "°C", hh: 5,  hs: 5,  sp: 170, l: -5, ll: -5 },
  { feature: "Temp. Preheating 960-1000ml / Drive ON",  unidad: "°C", hh: 5,  hs: 5,  sp: 230, l: -5, ll: -5 },
  { feature: "Temp. Preheating All / Drive OFF",        unidad: "°C", hh: 5,  hs: 5,  sp: 100, l: -5, ll: -5 },
  { feature: "Temp. Drying 500ml / Drive ON",           unidad: "°C", hh: 5,  hs: 5,  sp: 120, l: -5, ll: -5 },
  { feature: "Temp. Drying 750ml / Drive ON",           unidad: "°C", hh: 5,  hs: 5,  sp: 140, l: -5, ll: -5 },
  { feature: "Temp. Drying 960-1000ml / Drive ON",      unidad: "°C", hh: 5,  hs: 5,  sp: 180, l: -5, ll: -5 },
  { feature: "Temp. Drying All / Drive OFF",            unidad: "°C", hh: 5,  hs: 5,  sp: 100, l: -5, ll: -5 },
];

// SST (Steam Sterilization) - temperaturas principales
const SST_PARAMS = [
  { feature: "Steam supply",       unidad: "°C", hh: 170, hs: 165, sp: 155, l: 130, ll: 125 },
  { feature: "Temperatures SST",   unidad: "°C", hh: 140, hs: 135, sp: 125, l: 121, ll: 115 },
];

// Steam barriers
const STEAM_BARRIERS = [
  { feature: "Steam barrier behind controller (R)", unidad: "°C", hh: 140, hs: 135, sp: 125, l: 115, ll: 102 },
  { feature: "Steam barrier behind controller (A)", unidad: "°C", hh: 140, hs: 135, sp: 115, l: 110, ll: 102 },
  { feature: "Steam barrier (R) — passive",         unidad: "°C", hh: 140, hs: 135, sp: 40,  l: 30,  ll: 25  },
  { feature: "Steam injection tr 1/2",              unidad: "°C", hh: 140, hs: 135, sp: 125, l: 110, ll: 102 },
  { feature: "Steam injection tr 3/4",              unidad: "°C", hh: 140, hs: 135, sp: 125, l: 110, ll: 102 },
];

// Condensate barrier (dairy)
const CONDENSATE_BARRIERS = [
  { feature: "Condensate barrier with steam",     unidad: "°C", hh: 140, hs: 135, sp: 115, l: 110, ll: 102 },
  { feature: "Condensate barrier flushing",       unidad: "°C", hh: 135, hs: 130, sp: 90,  l: 80,  ll: 75  },
  { feature: "Condensate barrier with condensate",unidad: "°C", hh: 75,  hs: 65,  sp: 35,  l: 25,  ll: 20  },
];

type ParamRow = {
  feature: string; unidad: string;
  hh?: number | null; hs?: number | null; sp?: number | null; l?: number | null; ll?: number | null;
};
type ParamValues = Record<string, number | null>;

const upperValueKey = (key: string) => `${key}__upper`;
const lowerValueKey = (key: string) => `${key}__lower`;

// ─── Componente reutilizable de tabla de parámetros ───
function ParamTable({
  title, icon, subtitle, params, values, onChange,
}: {
  title: string; icon: string; subtitle?: string;
  params: ParamRow[]; values: ParamValues;
  onChange: (key: string, val: number | null) => void;
}) {
  return (
    <div className="fsa-section-card">
      <div className="fsa-section-card-header">
        <div className="fsa-section-card-icon">
          <span style={{ fontSize: 18 }}>{icon}</span>
        </div>
        <div>
          <div className="fsa-section-card-title">{title}</div>
          {subtitle && <div className="fsa-section-card-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="fsa-param-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: 260 }}>Parámetro</th>
              <th style={{ color: "#dc2626" }}>HH</th>
              <th style={{ color: "#f97316" }}>HS</th>
              <th style={{ color: "#2563eb" }}>SP</th>
              <th style={{ color: "#f97316" }}>L</th>
              <th style={{ color: "#dc2626" }}>LL</th>
              <th>Último</th>
              <th>Actual Sup.</th>
              <th>Actual Inf.</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p, i) => (
              <ParameterRangeRow
                key={`${p.feature}-${i}`}
                feature={p.feature}
                unidad={p.unidad}
                hh={p.hh}
                hs={p.hs}
                sp={p.sp}
                l={p.l}
                ll={p.ll}
                actualMode="dual"
                valorActualSuperior={values[upperValueKey(p.feature)] ?? values[p.feature] ?? null}
                valorActualInferior={values[lowerValueKey(p.feature)] ?? null}
                onChange={(val) => onChange(upperValueKey(p.feature), val)}
                onChangeSuperior={(val) => onChange(upperValueKey(p.feature), val)}
                onChangeInferior={(val) => onChange(lowerValueKey(p.feature), val)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tabla de medición por track para Preheating dinámico ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TrackMeasurementCard({
  values, onChange,
}: {
  values: ParamValues;
  onChange: (key: string, val: number | null) => void;
}) {
  const tracks = [1, 2, 3, 4];
  const params = [
    { label: "pdyn preheating (NW 19)", key: "pdyn_preh", unidad: "mmwc", sp: 34 },
    { label: "Temperature preheating",  key: "temp_preh", unidad: "°C",   sp: 100 },
    { label: "pdyn drying (NW 19)",     key: "pdyn_dry",  unidad: "mmwc", sp: 26 },
    { label: "Temperature drying",      key: "temp_dry",  unidad: "°C",   sp: 100 },
  ];

  return (
    <div className="fsa-section-card">
      <div className="fsa-section-card-header">
        <div className="fsa-section-card-icon">
          <span style={{ fontSize: 18 }}>🔥</span>
        </div>
        <div>
          <div className="fsa-section-card-title">Medición de Nozzles por Track</div>
          <div className="fsa-section-card-subtitle">Valores pdyn y temperatura por track (1–4)</div>
        </div>
      </div>
      <div style={{ overflowX: "auto", padding: "0 0 4px 0" }}>
        <table className="fsa-param-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: 220 }}>Parámetro</th>
              <th>Unidad</th>
              <th>SP ref.</th>
              {tracks.flatMap((t) => [
                <th key={`tr${t}-sup`} style={{ color: "#2563eb" }}>Tr {t} Sup.</th>,
                <th key={`tr${t}-inf`} style={{ color: "#2563eb" }}>Tr {t} Inf.</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.key}>
                <td style={{ fontWeight: 500, color: "#334155" }}>{p.label}</td>
                <td style={{ textAlign: "center", color: "#94a3b8", fontSize: 12 }}>{p.unidad}</td>
                <td style={{ textAlign: "center", fontFamily: "monospace", color: "#2563eb", fontSize: 13 }}>
                  {p.sp} ±2
                </td>
                {tracks.map((t) => {
                  const fieldKey = `${p.key}_tr${t}`;
                  const val = values[fieldKey];
                  const isOk = val !== null && val !== undefined && Math.abs(val - p.sp) <= 2;
                  const isWarn = val !== null && val !== undefined && !isOk && Math.abs(val - p.sp) <= 5;
                  return (
                    <td key={t} className={isOk ? "fsa-cell-ok" : isWarn ? "fsa-cell-warn" : ""}>
                      <input
                        type="number"
                        step="0.1"
                        className="fsa-value-input"
                        placeholder="—"
                        value={val ?? ""}
                        onChange={(e) => onChange(fieldKey, e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Componente principal del Paso 4 ─── */
function TrackMeasurementCardDual({
  values, onChange,
}: {
  values: ParamValues;
  onChange: (key: string, val: number | null) => void;
}) {
  const tracks = [1, 2, 3, 4];
  const params = [
    { label: "pdyn preheating (NW 19)", key: "pdyn_preh", unidad: "mmwc", sp: 34 },
    { label: "Temperature preheating",  key: "temp_preh", unidad: "°C",   sp: 100 },
    { label: "pdyn drying (NW 19)",     key: "pdyn_dry",  unidad: "mmwc", sp: 26 },
    { label: "Temperature drying",      key: "temp_dry",  unidad: "°C",   sp: 100 },
  ];

  const renderTrackInput = (key: string, val: number | null, label: string, sp: number) => {
    const isOk = val !== null && val !== undefined && Math.abs(val - sp) <= 2;
    const isWarn = val !== null && val !== undefined && !isOk && Math.abs(val - sp) <= 5;
    return (
      <td key={key} className={isOk ? "fsa-cell-ok" : isWarn ? "fsa-cell-warn" : ""}>
        <input
          type="number"
          step="0.1"
          className="fsa-value-input"
          placeholder={label}
          value={val ?? ""}
          onChange={(e) => onChange(key, e.target.value === "" ? null : Number(e.target.value))}
        />
      </td>
    );
  };

  return (
    <div className="fsa-section-card">
      <div className="fsa-section-card-header">
        <div className="fsa-section-card-icon">
          <span style={{ fontSize: 18 }}>🔥</span>
        </div>
        <div>
          <div className="fsa-section-card-title">Medición de Nozzles por Track</div>
          <div className="fsa-section-card-subtitle">Lecturas superior e inferior de pdyn y temperatura por track (1-4)</div>
        </div>
      </div>
      <div style={{ overflowX: "auto", padding: "0 0 4px 0" }}>
        <table className="fsa-param-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: 220 }}>Parámetro</th>
              <th>Unidad</th>
              <th>SP ref.</th>
              {tracks.flatMap((t) => [
                <th key={`tr${t}-sup`} style={{ color: "#2563eb" }}>Tr {t} Sup.</th>,
                <th key={`tr${t}-inf`} style={{ color: "#2563eb" }}>Tr {t} Inf.</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.key}>
                <td style={{ fontWeight: 500, color: "#334155" }}>{p.label}</td>
                <td style={{ textAlign: "center", color: "#94a3b8", fontSize: 12 }}>{p.unidad}</td>
                <td style={{ textAlign: "center", fontFamily: "monospace", color: "#2563eb", fontSize: 13 }}>
                  {p.sp} ±2
                </td>
                {tracks.flatMap((t) => {
                  const fieldKey = `${p.key}_tr${t}`;
                  const upperKey = upperValueKey(fieldKey);
                  const lowerKey = lowerValueKey(fieldKey);
                  return [
                    renderTrackInput(upperKey, values[upperKey] ?? values[fieldKey] ?? null, "Sup.", p.sp),
                    renderTrackInput(lowerKey, values[lowerKey] ?? null, "Inf.", p.sp),
                  ];
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface Step4PreheatingProps {
  values: ParamValues;
  onChange: (key: string, val: number | null) => void;
  auditId?: number;
  images?: EvidenceImageItem[];
  onImageUploaded?: (img: EvidenceImageItem) => void;
  onImageDeleted?: (id: number) => void;
  onImageReplaced?: (oldId: number, newImg: EvidenceImageItem) => void;
  onImageCaptionChange?: (id: number, caption: string) => void;
}

export function Step4Preheating({ values, onChange, auditId, images = [], onImageUploaded, onImageDeleted, onImageReplaced, onImageCaptionChange }: Step4PreheatingProps) {
  return (
    <div className="fsa-step-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header informativo */}
      <div className="fsa-section-card">
        <div className="fsa-section-card-header">
          <div className="fsa-section-card-icon">
            <span style={{ fontSize: 18 }}>🌡️</span>
          </div>
          <div>
            <div className="fsa-section-card-title">Preheating, Drying & SST</div>
            <div className="fsa-section-card-subtitle">
              Calentamiento previo, secado y esterilización por vapor
            </div>
          </div>
        </div>
        <div className="fsa-section-card-body">
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
            Registre los valores medidos para el sistema de calentamiento previo (Preheating), secado y
            esterilización por vapor (SST). Las barreras de vapor son críticas para la inocuidad — cualquier
            lectura por debajo de LL debe documentarse como hallazgo inmediato.
          </div>
        </div>
      </div>

      {/* Nozzles por Track (medición dinámica) */}
      <TrackMeasurementCardDual values={values} onChange={onChange} />

      {/* Setpoints por volumen */}
      <ParamTable
        title="Setpoints de Temperatura por Volumen"
        icon="📐"
        subtitle="Preheating y Drying según el volumen del envase y estado del drive"
        params={PREHEATING_SETPOINTS}
        values={values}
        onChange={onChange}
      />

      {/* SST principal */}
      <ParamTable
        title="Steam Sterilization (SST)"
        icon="♨️"
        subtitle="Temperatura de vapor de suministro y puntos SST"
        params={SST_PARAMS}
        values={values}
        onChange={onChange}
      />

      {/* Steam Barriers */}
      <ParamTable
        title="Steam Barriers"
        icon="🔒"
        subtitle="Barreras de vapor detrás del controlador e inyección por track"
        params={STEAM_BARRIERS}
        values={values}
        onChange={onChange}
      />

      {/* Condensate Barrier (Dairy) */}
      <ParamTable
        title="Condensate Barrier (Dairy)"
        icon="💧"
        subtitle="Barreras de condensado para plantas de lácteos"
        params={CONDENSATE_BARRIERS}
        values={values}
        onChange={onChange}
      />

      {/* Evidencias fotográficas */}
      <div className="fsa-section-card">
        <div className="fsa-section-card-header">
          <div className="fsa-section-card-icon">
            <Camera size={18} color="#64748b" />
          </div>
          <div>
            <div className="fsa-section-card-title">Evidencias Fotográficas</div>
            <div className="fsa-section-card-subtitle">Fotos de campo del sistema de Preheating & SST (opcional)</div>
          </div>
        </div>
        <div className="fsa-section-card-body">
          {auditId ? (
            <EvidenceUploader
              auditId={auditId}
              paramId={4}
              images={images}
              onUploaded={onImageUploaded ?? (() => {})}
              onDeleted={onImageDeleted ?? (() => {})}
              onReplaced={onImageReplaced}
              onCaptionChange={onImageCaptionChange ?? (() => {})}
              maxImages={10}
            />
          ) : (
            <div style={{
              background: "#fff", border: "1px dashed #cbd5e1",
              borderRadius: 8, padding: "14px", fontSize: 12, color: "#94a3b8",
              textAlign: "center"
            }}>
              💾 Guarda el reporte primero para habilitar la carga de imágenes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
