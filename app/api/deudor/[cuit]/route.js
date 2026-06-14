export async function GET(request, { params }) {
  const { cuit } = params;

  try {
    const res = await fetch(
      `https://api.bcra.gob.ar/CentralDeDeudores/v1.0/Deudas/${cuit}`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0"
        },
        cache: "no-store"
      }
    );

    const text = await res.text();

    if (!res.ok) {
      return Response.json(
        { error: `BCRA respondió ${res.status}: ${text}` },
        { status: 200 }
      );
    }

    const data = JSON.parse(text);
    return Response.json(data.results || data);

  } catch (e) {
    return Response.json(
      { error: `Excepción: ${e.message}` },
      { status: 200 }
    );
  }
}
