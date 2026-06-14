export async function GET(request, { params }) {
  const { cuit } = params;

  try {
    const res = await fetch(
      `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cuit}`,
      { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
      return Response.json(
        { error: "CUIT no encontrado en el BCRA" },
        { status: 404 }
      );
    }

    const data = await res.json();
    return Response.json(data);

  } catch (e) {
    return Response.json(
      { error: "Error al conectar con el BCRA" },
      { status: 500 }
    );
  }
}
