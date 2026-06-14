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

function formatPesos(n) {
  return "$ " + ((n || 0) * 1000).toLocaleString("es-AR");
}

function formatPeriodo(p) {
  if (!p || p.length < 6) return p;
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${meses[parseInt(p.slice(4,6))-1]} ${p.slice(0,4)}`;
}

function SituacionBadge({ sit }) {
  const s = SITUACIONES[sit] || { label: `Situación ${sit}`, color: "#94a3b8", bg: "#0f172a" };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40`, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
      {sit} — {s.label}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ color: "#e2e8f0", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{String(value ?? "—")}</span>
    </div>
  );
}

function EntidadCard({ e }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div onClick={() => setAbierto(!abierto)} style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 16px", marginBottom: 8, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{e.entidad}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{abierto ? "▲ Ocultar" : "▼ Ver detalle"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>{formatPesos(e.monto)}</div>
          <SituacionBadge sit={e.situacion} />
        </div>
      </div>
      {abierto && (
        <div style={{ marginTop: 12, borderTop: "1px solid #1e293b", paddingTop: 10 }}>
          <Row label="Días de atraso" value={e.diasAtrasoPago} />
          <Row label="Garantía" value={e.garantia || "Sin garantía"} />
          <Row label="Fecha sit. 1" value={e.fechaSit1} />
          <Row label="Refinanciaciones" value={e.refinanciaciones ? "Sí" : "No"} />
          <Row label="Proceso judicial" value={e.procesoJud ? "Sí" : "No"} />
          <Row label="En revisión" value={e.enRevision ? "Sí" : "No"} />
          <Row label="Recategorización" value={e.recategorizacionOblig ? "Sí" : "No"} />
        </div>
      )}
    </div>
  );
}

function GraficoHistorial({ periodos }) {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  if (!periodos || periodos.length === 0) return null;
  const ordenados = [...periodos].reverse();
  const maxMonto = Math.max(...ordenados.map(p => p.entidades?.reduce((a, e) => a + (e.monto || 0), 0) || 0));
  const periodoData = periodoSeleccionado ? periodos.find(p => p.periodo === periodoSeleccionado) : null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
        Historial 24 meses — tocá un mes
      </div>
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "16px 12px", marginBottom: 16, overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, minWidth: ordenados.length * 22, height: 90 }}>
          {ordenados.map((p, i) => {
            const total = p.entidades?.reduce((a, e) => a + (e.monto || 0), 0) || 0;
            const sitMax = Math.max(...(p.entidades?.map(e => e.situacion) || [1]));
            const s = SITUACIONES[sitMax] || SITUACIONES[1];
            const altura = maxMonto > 0 ? Math.max(4, (total / maxMonto) * 70) : 4;
            const seleccionado = periodoSeleccionado === p.periodo;
            return (
              <div key={i} onClick={() => setPeriodoSeleccionado(seleccionado ? null : p.periodo)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <div style={{
                  width: 10, height: altura,
                  background: s.color,
                  borderRadius: 2,
                  opacity: seleccionado ? 1 : 0.55,
                  border: seleccionado ? `1px solid white` : "1px solid transparent",
                  transition: "all 0.15s"
                }} />
                <div style={{ fontSize: 7, color: "#475569", writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>
                  {formatPeriodo(p.periodo)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {periodoData && (
        <div style={{ background: "#0f172a", border: "1px solid #3b82f6", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: 700, marginBottom: 12 }}>
            Detalle — {formatPeriodo(periodoData.periodo)}
          </div>
          {periodoData.entidades?.length > 0
            ? periodoData.entidades.map((e, i) => <EntidadCard key={i} e={e} />)
            : <div style={{ color: "#64748b", fontSize: 13 }}>Sin deudas registradas.</div>}
        </div>
      )}
    </div>
  );
}

function SeccionAFIP({ afip }) {
  if (!afip) return null;
  const d = afip.datosGenerales || afip;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Datos AFIP</div>
      <Row label="Razón social" value={d.razonSocial || d.apellido ? `${d.apellido}, ${d.nombre}` : "—"} />
      <Row label="Estado CUIT" value={d.estadoClave || "—"} />
      <Row label="Tipo persona" value={d.tipoPersona || "—"} />
      <Row label="Fecha inscripción" value={d.fechaInscripcion || "—"} />
      <Row label="Fecha contrato social" value={d.fechaContratoSocial || "—"} />
      {d.domicilioFiscal && <>
        <Row label="Domicilio fiscal" value={`${d.domicilioFiscal.direccion || ""}, ${d.domicilioFiscal.localidad || ""}`} />
        <Row label="Provincia" value={d.domicilioFiscal.descripcionProvincia || "—"} />
        <Row label="Código postal" value={d.domicilioFiscal.codPostal || "—"} />
      </>}
      {d.impuestos?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>IMPUESTOS INSCRIPTO</div>
          {d.impuestos.map((imp, i) => (
            <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
              • {imp.descripcionImpuesto} — desde {imp.periodoDesde}
            </div>
          ))}
        </div>
      )}
      {d.actividades?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>ACTIVIDADES ECONÓMICAS</div>
          {d.actividades.map((act, i) => (
            <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
              • {act.descripcionActividad} {act.nomenclador ? `(${act.nomenclador})` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SeccionCheques({ cheques }) {
  if (!cheques) return null;
  const causales = cheques.causales || [];
  const total = causales.reduce((a, c) => a + (c.detalle?.length || 0), 0);
  return (
    <div style={{ background: "#0f172a", border: `1px solid ${total > 0 ? "#ef444440" : "#1e293b"}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Cheques rechazados</div>
      {total === 0
        ? <div style={{ color: "#22c55e", fontWeight: 700 }}>✓ Sin cheques rechazados</div>
        : causales.map((c, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#f97316", fontWeight: 700, marginBottom: 6 }}>{c.causal}</div>
            {c.detalle?.map((d, j) => (
              <div key={j} style={{ background: "#0a0f1e", borderRadius: 6, padding: "8px 12px", marginBottom: 6, fontSize: 12 }}>
                <Row label="Entidad" value={d.entidad} />
                <Row label="Monto" value={`$ ${(d.monto || 0).toLocaleString("es-AR")}`} />
                <Row label="Fecha" value={d.fecha} />
                <Row label="N° cheque" value={d.nroCheque} />
              </div>
            ))}
          </div>
        ))
      }
    </div>
  );
}

function generarPDF(resultado, historial, afip, cheques, cuit) {
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const fp = (p) => {
    if (!p || p.length < 6) return p;
    return `${meses[parseInt(p.slice(4,6))-1]} ${p.slice(0,4)}`;
  };
  const entidades = resultado?.periodos?.[0]?.entidades || [];
  const situMax = entidades.length ? Math.max(...entidades.map(e => e.situacion)) : 1;
  const totalDeuda = entidades.reduce((a, e) => a + (e.monto || 0), 0);
  const veredicto = situMax === 1 ? "APTO PARA CRÉDITO" : situMax === 2 ? "APTO CON OBSERVACIONES" : situMax === 3 ? "EVALUACIÓN REQUERIDA" : "NO APTO";
  const d = afip?.datosGenerales || afip || {};
  const causales = cheques?.causales || [];
  const totalCheques = causales.reduce((a, c) => a + (c.detalle?.length || 0), 0);

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe SERC</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1e293b; margin: 40px; font-size: 13px; }
    h1 { color: #1e40af; font-size: 22px; margin-bottom: 4px; }
    h2 { color: #1e40af; font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; }
    .veredicto { font-size: 24px; font-weight: 900; color: ${situMax <= 1 ? "#16a34a" : situMax === 2 ? "#ca8a04" : situMax === 3 ? "#ea580c" : "#dc2626"}; margin: 12px 0; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 12px; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .ok { color: #16a34a; font-weight: 700; }
    .mal { color: #dc2626; font-weight: 700; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style></head><body>
  <h1>SERC — Sistema de Evaluación de Riesgo Crediticio</h1>
  <div style="color:#64748b; font-size:12px;">Informe generado el ${new Date().toLocaleDateString("es-AR")} a las ${new Date().toLocaleTimeString("es-AR")}</div>
  <div style="color:#64748b; font-size:12px;">CUIT consultado: ${cuit}</div>

  <h2>1. Identificación</h2>
  <table>
    <tr><th>Campo</th><th>Valor</th></tr>
    <tr><td>Denominación (BCRA)</td><td>${resultado?.denominacion || "—"}</td></tr>
    <tr><td>Razón social (AFIP)</td><td>${d.razonSocial || (d.apellido ? `${d.apellido}, ${d.nombre}` : "—")}</td></tr>
    <tr><td>Estado CUIT</td><td>${d.estadoClave || "—"}</td></tr>
    <tr><td>Tipo persona</td><td>${d.tipoPersona || "—"}</td></tr>
    <tr><td>Fecha inscripción AFIP</td><td>${d.fechaInscripcion || "—"}</td></tr>
    <tr><td>Domicilio fiscal</td><td>${d.domicilioFiscal ? `${d.domicilioFiscal.direccion || ""}, ${d.domicilioFiscal.localidad || ""}, ${d.domicilioFiscal.descripcionProvincia || ""}` : "—"}</td></tr>
  </table>

  ${d.actividades?.length > 0 ? `
  <h2>2. Actividades económicas (AFIP)</h2>
  <table>
    <tr><th>Actividad</th><th>Nomenclador</th></tr>
    ${d.actividades.map(a => `<tr><td>${a.descripcionActividad}</td><td>${a.nomenclador || "—"}</td></tr>`).join("")}
  </table>` : ""}

  ${d.impuestos?.length > 0 ? `
  <h2>3. Impuestos inscripto (AFIP)</h2>
  <table>
    <tr><th>Impuesto</th><th>Desde</th></tr>
    ${d.impuestos.map(i => `<tr><td>${i.descripcionImpuesto}</td><td>${i.periodoDesde || "—"}</td></tr>`).join("")}
  </table>` : ""}

  <h2>4. Evaluación crediticia (BCRA)</h2>
  <div class="veredicto">${veredicto}</div>
  <table>
    <tr><th>Campo</th><th>Valor</th></tr>
    <tr><td>Situación máxima</td><td>${situMax} — ${SITUACIONES[situMax]?.label || "—"}</td></tr>
    <tr><td>Deuda total</td><td>${formatPesos(totalDeuda)}</td></tr>
    <tr><td>Cantidad de entidades</td><td>${entidades.length}</td></tr>
  </table>

  <h2>5. Detalle de deudas actuales</h2>
  <table>
    <tr><th>Entidad</th><th>Monto</th><th>Situación</th><th>Días atraso</th><th>Garantía</th><th>Proc. judicial</th></tr>
    ${entidades.map(e => `<tr>
      <td>${e.entidad}</td>
      <td>${formatPesos(e.monto)}</td>
      <td>${e.situacion} — ${SITUACIONES[e.situacion]?.label || "—"}</td>
      <td>${e.diasAtrasoPago ?? "—"}</td>
      <td>${e.garantia || "Sin garantía"}</td>
      <td>${e.procesoJud ? "Sí" : "No"}</td>
    </tr>`).join("")}
  </table>

  ${historial?.periodos?.length > 0 ? `
  <h2>6. Historial crediticio (últimos 24 meses)</h2>
  <table>
    <tr><th>Período</th><th>Entidad</th><th>Monto</th><th>Situación</th></tr>
    ${[...historial.periodos].reverse().map(p =>
      (p.entidades || []).map(e => `<tr>
        <td>${fp(p.periodo)}</td>
        <td>${e.entidad}</td>
        <td>${formatPesos(e.monto)}</td>
        <td>${e.situacion} — ${SITUACIONES[e.situacion]?.label || "—"}</td>
      </tr>`).join("")
    ).join("")}
  </table>` : ""}

  <h2>7. Cheques rechazados</h2>
  ${totalCheques === 0
    ? '<div class="ok">✓ Sin cheques rechazados registrados</div>'
    : causales.map(c => `
      <div class="mal">⚠ ${c.causal}</div>
      <table>
        <tr><th>Entidad</th><th>Monto</th><th>Fecha</th><th>N° cheque</th></tr>
        ${(c.detalle || []).map(d => `<tr>
          <td>${d.entidad}</td>
          <td>$ ${(d.monto || 0).toLocaleString("es-AR")}</td>
          <td>${d.fecha}</td>
          <td>${d.nroCheque}</td>
        </tr>`).join("")}
      </table>`).join("")
  }

  <div class="footer">
    Informe generado por SERC · Datos provistos por Central de Deudores BCRA y Padrón AFIP · Solo con fines informativos
  </div>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SERC_${cuit}_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SercApp() {
  const [cuit, setCuit] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [afip, setAfip] = useState(null);
  const [cheques, setCheques] = useState(null);
  const [error, setError] = useState(null);

  const cuitLimpio = cuit.replace(/\D/g, "");
  const cuitValido = cuitLimpio.length === 11;

  async function consultar() {
    if (!cuitValido) return;
    setLoading(true);
    setError(null);
    setResultado(null);
    setHistorial(null);
    setAfip(null);
    setCheques(null);
    try {
      const [resActual, resHist, resAfip, resCheques] = await Promise.all([
        fetch(`/api/deudor/${cuitLimpio}`),
        fetch(`/api/historial/${cuitLimpio}`),
        fetch(`/api/afip/${cuitLimpio}`),
        fetch(`/api/cheques/${cuitLimpio}`)
      ]);
      if (!resActual.ok) throw new Error("CUIT no encontrado en el BCRA");
      const dataActual = await resActual.json();
      setResultado(dataActual.results || dataActual);
      if (resHist.ok) { const d = await resHist.json(); setHistorial(d.results || d); }
      if (resAfip.ok) { const d = await resAfip.json(); setAfip(d.data || d); }
      if (resCheques.ok) { const d = await resCheques.json(); setCheques(d.results || d); }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const entidades = resultado?.periodos?.[0]?.entidades || [];
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
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1 }}>SISTEMA DE EVALUACIÓN DE RIESGO CREDITICIO</div>
          </div>
        </div>

        <label style={{ fontSize: 12, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>CUIT / CUIL del solicitante</label>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input value={cuit} onChange={e => setCuit(formatCUIT(e.target.value))} placeholder="20-12345678-9" maxLength={13}
            style={{ flex: 1, background: "#0f172a", border: `1px solid ${cuitValido ? "#3b82f6" : "#1e293b"}`, borderRadius: 8, padding: "12px 16px", color: "#e2e8f0", fontSize: 18, fontFamily: "monospace", outline: "none" }}
            onKeyDown={e => e.key === "Enter" && consultar()} />
          <button onClick={consultar} disabled={!cuitValido || loading}
            style={{ background: cuitValido ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#1e293b", color: cuitValido ? "white" : "#475569", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: cuitValido ? "pointer" : "default", minWidth: 100 }}>
            {loading ? "Consultando..." : "Consultar"}
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
                <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>DEUDA TOTAL</div><span style={{ fontWeight: 700 }}>{formatPesos(totalDeuda)}</span></div>
                <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ENTIDADES</div><span style={{ fontWeight: 700 }}>{entidades.length}</span></div>
              </div>
              <button onClick={() => generarPDF(resultado, historial, afip, cheques, cuitLimpio)}
                style={{ marginTop: 20, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                ⬇ Exportar informe completo
              </button>
            </div>
            <SeccionAFIP afip={afip} />
            <SeccionCheques cheques={cheques} />
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Situación actual</div>
            {entidades.map((e, i) => <EntidadCard key={i} e={e} />)}
            {historial && <GraficoHistorial periodos={historial.periodos} />}
          </>
        )}
        <div style={{ marginTop: 60, fontSize: 11, color: "#334155", textAlign: "center" }}>SERC · Datos provistos por Central de Deudores BCRA y Padrón AFIP</div>
      </div>
    </div>
  );
}
