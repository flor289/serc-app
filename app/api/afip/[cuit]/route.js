export const runtime = "edge";

export async function GET(request, { params }) {
  const { cuit } = params;
  try {
    const res = await fetch(
      `https://soa.afip.gob.ar/sr-padron/v2/persona/${cuit}`,
      { headers: { "Accept": "application/json" } }
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
