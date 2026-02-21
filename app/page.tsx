export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "white",
      fontFamily: "Arial"
    }}>
      
      <h1 style={{
        fontSize: "48px",
        fontWeight: "bold",
        marginBottom: "20px"
      }}>
        WICU 🚀
      </h1>

      <p style={{
        fontSize: "20px",
        marginBottom: "30px",
        opacity: 0.8
      }}>
        Tienda inteligente del futuro
      </p>

      <button style={{
        padding: "12px 24px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#38bdf8",
        color: "#0f172a",
        fontWeight: "bold",
        cursor: "pointer"
      }}>
        Explorar Productos
      </button>

    </main>
  );
}