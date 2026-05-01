import "./globals.css";

export const metadata = {
  title: "WICU",
  description: "Tienda inteligente 24/7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}