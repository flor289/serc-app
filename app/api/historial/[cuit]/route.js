export const runtime = "edge";

export async function GET(request, { params }) {
  const { cuit } = params;
  try {
    const res = await fetch(
      `https://api.bcra.gob.ar/CentralDeDeudores/v1.0/Deudas/Historicas/${cuit}`,
      { headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" } }
    );
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
