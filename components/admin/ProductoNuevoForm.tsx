"use client";

import { useEffect, useState } from "react";

type ProductoCreado = {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  activo: boolean;
  destacado: boolean;
  stock: number | null;
  descripcion: string | null;
  imagen: string | null;
  origen: string;
  proveedor: string | null;
};

type Props = {
  onClose: () => void;
  onSaved: (producto: ProductoCreado) => void;
};

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAXIMO_IMAGEN = 5 * 1024 * 1024;

export default function ProductoNuevoForm({ onClose, onSaved }: Props) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Tecnología");
  const [descripcion, setDescripcion] = useState("");
  const [stock, setStock] = useState("");
  const [origen, setOrigen] = useState("propio");
  const [proveedor, setProveedor] = useState("");
  const [imagen, setImagen] = useState("");
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [activo, setActivo] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (vistaPrevia?.startsWith("blob:")) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  function seleccionarImagen(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      setError("Formato no permitido. Selecciona una imagen JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (archivo.size === 0 || archivo.size > MAXIMO_IMAGEN) {
      setError("La fotografía debe pesar más de 0 y máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImagen("");
    setArchivoImagen(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  }

  function quitarImagen() {
    setArchivoImagen(null);
    setVistaPrevia(null);
    setImagen("");
    setError("");
  }

  async function crearProducto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!nombre.trim() || !precio || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
      setError("Completa el nombre y un precio válido.");
      return;
    }

    if (
      stock.trim() !== "" &&
      (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    ) {
      setError("Las existencias deben ser un número entero igual o mayor que cero.");
      return;
    }

    setGuardando(true);

    try {
      let imagenFinal = imagen.trim();

      if (archivoImagen) {
        setSubiendoImagen(true);

        const datosImagen = new FormData();
        datosImagen.append("imagen", archivoImagen);

        const respuestaImagen = await fetch("/api/admin/productos/imagen", {
          method: "POST",
          body: datosImagen,
        });

        const resultadoImagen = await respuestaImagen.json();

        if (!respuestaImagen.ok || !resultadoImagen.imagen) {
          throw new Error(
            resultadoImagen.error || "No fue posible subir la fotografía."
          );
        }

        imagenFinal = resultadoImagen.imagen;
        setSubiendoImagen(false);
      }

      const respuesta = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          precio: Number(precio),
          categoria,
          descripcion,
          ...(stock.trim() !== "" ? { stock: Number(stock) } : {}),
          origen,
          proveedor,
          imagen: imagenFinal,
          activo,
          destacado,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.producto) {
        throw new Error(resultado.error || "No fue posible crear el producto.");
      }

      onSaved(resultado.producto);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
      setSubiendoImagen(false);
    }
  }

  const campo =
    "w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400";
  const etiqueta = "mb-1.5 block text-sm font-medium text-slate-300";
  const imagenVisible = vistaPrevia || imagen.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <form
        onSubmit={crearProducto}
        className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-5 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Crear producto</h2>
            <p className="mt-1 text-xs text-slate-400">
              Nuevo producto para el catálogo WICU
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>

        <div>
          <label className={etiqueta}>Nombre del producto</label>
          <input
            className={campo}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={180}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={etiqueta}>Precio en pesos colombianos</label>
            <input
              className={campo}
              type="number"
              min="0"
              step="1"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={etiqueta}>Categoría</label>
            <select
              className={campo}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {[
                "Tecnología",
                "Hogar",
                "Fitness",
                "Mascotas",
                "Moda",
                "Ferretería",
                "Lencería",
                "Adultos",
                "Otros",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={etiqueta}>Origen del producto</label>
          <select
            className={campo}
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
          >
            <option value="propio">Inventario propio</option>
            <option value="dropshipping">Dropshipping</option>
            <option value="tercero">Vendedor tercero</option>
          </select>
        </div>

        <div>
          <label className={etiqueta}>Proveedor (opcional)</label>
          <input
            className={campo}
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            maxLength={180}
            placeholder="Nombre del proveedor"
          />
        </div>

        <div>
          <label className={etiqueta}>Fotografía del producto</label>
          <div className="rounded-xl border border-dashed border-cyan-400/30 bg-slate-900/70 p-4">
            <input
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-400"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={seleccionarImagen}
              disabled={guardando}
            />
            <p className="mt-2 text-xs text-slate-400">
              Selecciona una foto desde tu celular o computador. Formatos JPG,
              PNG o WebP. Máximo 5 MB.
            </p>

            {imagenVisible && (
              <div className="mt-4 flex flex-wrap items-start gap-4">
                <img
                  src={imagenVisible}
                  alt="Vista previa del producto"
                  className="h-36 w-36 rounded-xl border border-white/10 bg-slate-950 object-contain p-2"
                />
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-emerald-300">
                    Vista previa de la fotografía
                  </span>
                  <button
                    type="button"
                    onClick={quitarImagen}
                    disabled={guardando}
                    className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Quitar fotografía
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={etiqueta}>O utiliza una imagen por URL (opcional)</label>
          <input
            className={campo}
            type="url"
            value={imagen}
            onChange={(e) => {
              setImagen(e.target.value);
              setArchivoImagen(null);
              setVistaPrevia(null);
              setError("");
            }}
            placeholder="https://..."
            disabled={guardando}
          />
        </div>

        <div>
          <label className={etiqueta}>Existencias (opcional)</label>
          <input
            className={campo}
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Sin definir"
          />
        </div>

        <div>
          <label className={etiqueta}>Descripción</label>
          <textarea
            className={campo}
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={5000}
          />
        </div>

        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
            />
            Producto activo
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
            />
            Producto destacado
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
          >
            {subiendoImagen
              ? "Subiendo fotografía..."
              : guardando
                ? "Registrando producto..."
                : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
