export default function Home() {
  return (
    <main
      style={{
        background: "#0B0F19",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1
        style={{
          fontSize: "60px",
          marginBottom: "10px",
          letterSpacing: "4px",
        }}
      >
        WICU
      </h1>

      <h2
        style={{
          fontSize: "28px",
          color: "#00F0FF",
          marginBottom: "20px",
        }}
      >
        Eleva tu nivel
      </h2>

      <p
        style={{
          maxWidth: "600px",
          color: "#9CA3AF",
          marginBottom: "30px",
        }}
      >
        Tecnología premium diseñada para potenciar tu estilo de vida
        inteligente.
      </p>

      <button
        style={{
          background: "#00F0FF",
          color: "#0B0F19",
          border: "none",
          padding: "15px 30px",
          fontSize: "16px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Explorar Gadgets
      </button>
    </main>
  );
}