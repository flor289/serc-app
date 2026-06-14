export const metadata = {
  title: "SERC - Sistema de Evaluación de Riesgo Crediticio",
  description: "Consulta de riesgo crediticio vía Central de Deudores BCRA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
