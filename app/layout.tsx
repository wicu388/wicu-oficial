export const metadata = {
  title: "WICU - Tienda Inteligente",
  description: "Marketplace inteligente del futuro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        
        {/* HEADER */}
        <header
          style={{
            background: "#0f172a",
            color: "white",
            padding: "15px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>WICU</h2>

          <input
            type="text"
            placeholder="Buscar productos..."
            style={{
              padding: "8px",
              width: "40%",
              borderRadius: "6px",
              border: "none",
            }}
          />

          <div style={{ fontSize: "20px" }}>🛒</div>
        </header>

        {/* CONTENIDO */}
        <main>{children}</main>

        {/* FOOTER */}
        <footer
          style={{
            background: "#0f172a",
            color: "white",
            padding: "20px",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          © 2026 WICU - Comercio Inteligente
        </footer>

      </body>
    </html>
  );
}