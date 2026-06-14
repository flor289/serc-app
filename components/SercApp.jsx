"use client";
import { useState } from "react";

const SITUACIONES = {
  1: { label: "Normal", color: "#22c55e", bg: "#052e16", desc: "Al día con sus obligaciones." },
  2: { label: "Riesgo bajo", color: "#facc15", bg: "#1c1a05", desc: "Atrasos menores de 90 días." },
  3: { label: "Riesgo medio", color: "#f97316", bg: "#1c0e05", desc: "Mora mayor a 90 días." },
  4: { label: "Riesgo alto", color: "#ef4444", bg: "#1c0505", desc: "Alto riesgo de insolvencia." },
  5: { label: "Irrecuperable", color: "#7f1d1d", bg: "#150202", desc: "Deuda incobrable o en quiebra." },
};

function formatCUIT(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

function SituacionBadge({ sit }) {
  const s = SITUACIONES[sit] || { label: `Situación ${sit}`, color: "#94a3b8", bg: "#0f172a" };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40`, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
      {sit} — {s.label}
    </span>
  );
}

export default function SercApp() {
  const [cuit, setCuit] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const cuitLimpio = cuit.replace(/\D/g, "");
  const cuitValido = cuitLimpio.length === 11;

  async function consultar() {
    if (!cuitValido) return;
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch(`/api/deudor/${cuitLimpio}`);
      if (!res.ok) throw new Error("Error al consultar el BCRA");
      const data = await res.json();
      setResultado(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const entidades = resultado?.results?.periodos?.[0]?.entidades || resultado?.periodos?.[0]?.entidades || [];
  const situMax = entidades.length ? Math.max(...entidades.map(e => e.situacion)) : null;
  const totalDeuda = entidades.reduce((a, e) => a + (e.monto || 0), 0);
  const s = situMax ? SITUACIONES[situMax] : null;

  const veredicto = !s ? null : situMax === 1 ? "APTO PARA CRÉDITO" : situMax === 2 ? "APTO CON OBSERVACIONES" : situMax === 3 ? "EVALUACIÓN REQUERIDA" : "NO APTO";

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 16px" }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "white" }}>S</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>SERC</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 8 }}>EVALUACIÓN CREDITICIA — {resultado?.results?.denominacion || resultado?.denominacion}</div>
          </div>
        </div>

        <label style={{ fontSize: 12, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>CUIT / CUIL del solicitante</label>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input value={cuit} onChange={e => setCuit(formatCUIT(e.target.value))} placeholder="20-12345678-9" maxLength={13}
            style={{ flex: 1, background: "#0f172a", border: `1px solid ${cuitValido ? "#3b82f6" : "#1e293b"}`, borderRadius: 8, padding: "12px 16px", color: "#e2e8f0", fontSize: 18, fontFamily: "monospace", outline: "none" }}
            onKeyDown={e => e.key === "Enter" && consultar()} />
          <button onClick={consultar} disabled={!cuitValido || loading}
            style={{ background: cuitValido ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#1e293b", color: cuitValido ? "white" : "#475569", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: cuitValido ? "pointer" : "default", minWidth: 100 }}>
            {loading ? "..." : "Consultar"}
          </button>
        </div>

        {error && <div style={{ background: "#1c0505", border: "1px solid #7f1d1d", borderRadius: 10, padding: "14px 18px", color: "#fca5a5", fontSize: 14, marginBottom: 24 }}>⚠ {error}</div>}

        {resultado && s && (
          <>
            <div style={{ background: "#0f172a", border: `1px solid ${s.color}30`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 8 }}>EVALUACIÓN CREDITICIA — {resultado.denominacion}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 8, fontFamily: "monospace" }}>{veredicto}</div>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 16 }}>
                <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>SITUACIÓN MÁX.</div><SituacionBadge sit={situMax} /></div>
                <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>DEUDA TOTAL</div><span style={{ fontWeight: 700 }}>$ {totalDeuda.toLocaleString("es-AR")}</span></div>
                <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ENTIDADES</div><span style={{ fontWeight: 700 }}>{entidades.length}</span></div>
              </div>
            </div>

            {entidades.map((e, i) => (
              <div key={i} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "16px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div><div style={{ fontWeight: 700, marginBottom: 4 }}>{e.entidad}</div><div style={{ fontSize: 12, color: "#64748b" }}>Garantía: {e.garantia}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, fontFamily: "monospace", marginBottom: 4 }}>$ {(e.monto || 0).toLocaleString("es-AR")}</div><SituacionBadge sit={e.situacion} /></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
                                                                                                            }
