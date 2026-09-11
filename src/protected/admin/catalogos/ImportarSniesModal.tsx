import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UploadCloud, X } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import type { SniesImportacion } from "../../../types/catalogos";

type Props = {
  onFinalizado: () => void;
  onCerrar: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_SNIES_IMPORTACIONES;
const INTERVALO_POLLING_MS = 2000;

/**
 * Sube el Excel del SNIES y hace polling del progreso mientras `ImportarSniesJob` lo procesa en
 * segundo plano (requiere el servicio `queue-worker` de docker-compose.yml corriendo).
 */
const ImportarSniesModal = ({ onFinalizado, onCerrar }: Props) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [importacion, setImportacion] = useState<SniesImportacion | null>(null);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  const consultarEstado = (id: number) => {
    intervaloRef.current = setInterval(async () => {
      try {
        const respuesta = await axiosInstance.get(`${ENDPOINT}/${id}`);
        const datos: SniesImportacion = respuesta.data?.data;
        setImportacion(datos);

        if (datos.estado === "completado" || datos.estado === "fallido") {
          if (intervaloRef.current) clearInterval(intervaloRef.current);
          if (datos.estado === "completado") {
            toast.success("Importación completada.");
            onFinalizado();
          } else {
            toast.error(datos.mensaje_error || "La importación falló.");
          }
        }
      } catch (error) {
        console.error("Error al consultar el estado de la importación:", error);
      }
    }, INTERVALO_POLLING_MS);
  };

  const handleSubir = async () => {
    if (!archivo) return;

    try {
      setSubiendo(true);
      const formData = new FormData();
      formData.append("archivo", archivo);

      const respuesta = await axiosInstance.post(ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const datos: SniesImportacion = respuesta.data?.data;
      setImportacion(datos);
      consultarEstado(datos.id_importacion);
    } catch (error) {
      console.error("Error al subir el archivo SNIES:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo subir el archivo."));
      setSubiendo(false);
    }
  };

  const porcentaje =
    importacion && importacion.total_filas
      ? Math.min(100, Math.round((importacion.filas_procesadas / importacion.total_filas) * 100))
      : 0;

  const enProceso = importacion && (importacion.estado === "pendiente" || importacion.estado === "procesando");
  const terminado = importacion && (importacion.estado === "completado" || importacion.estado === "fallido");

  // El import lee y valida el Excel completo antes de guardar el primer lote, así que
  // `filas_procesadas` se queda en 0 durante ese tramo — no es que esté "trabado" en 0%.
  // Mientras dure, mostramos un estado indeterminado en vez de un "0%" engañoso.
  const leyendoArchivo = Boolean(enProceso) && importacion?.filas_procesadas === 0;

  return (
    <div className="flex flex-col gap-5 p-1">
      {!importacion && (
        <>
          <label
            htmlFor="archivo_snies"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[rgba(30,58,95,0.3)] bg-[rgba(30,58,95,0.03)] p-8 text-center"
          >
            <UploadCloud className="h-7 w-7 text-[#1e3a5f]" />
            <span className="text-sm font-bold text-[#1e3a5f]">
              {archivo ? archivo.name : "Selecciona el archivo .xlsx"}
            </span>
            <span className="text-xs text-[#6b7a8d]">Oferta y Programas del SNIES — se procesa en segundo plano</span>
            <input
              id="archivo_snies"
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
          </label>

          <form
            className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubir();
            }}
          >
            <button type="button" onClick={onCerrar} disabled={subiendo}>
              <ButtonSecondary value="Cancelar" className="px-8 py-3" />
            </button>
            <ButtonPrimary
              value="Subir y procesar"
              className="px-8"
              disabled={!archivo || subiendo}
              loading={subiendo}
            />
          </form>
        </>
      )}

      {importacion && (
        <>
          <div>
            <p className="text-sm font-bold text-[#1e3a5f]">Procesando {importacion.nombre_archivo}</p>
            <p className="text-xs text-[#6b7a8d]">
              {leyendoArchivo && "Leyendo archivo… esto puede tardar unos minutos con archivos grandes."}
              {enProceso && !leyendoArchivo && "Guardando filas por lotes…"}
              {importacion.estado === "completado" && "Importación completada."}
              {importacion.estado === "fallido" && (importacion.mensaje_error || "La importación falló.")}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#6b7a8d]">
              <span>{leyendoArchivo ? "Leyendo…" : `${porcentaje}%`}</span>
              <span>
                {importacion.filas_procesadas.toLocaleString("es-CO")} /{" "}
                {(importacion.total_filas ?? 0).toLocaleString("es-CO")} filas
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#f3ede1]">
              {leyendoArchivo ? (
                <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-[#e8740e]/40 to-[#c89b14]/40" />
              ) : (
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e8740e] to-[#c89b14] transition-all duration-300"
                  style={{ width: `${porcentaje}%` }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Creados", valor: importacion.programas_creados },
              { label: "Actualizados", valor: importacion.programas_actualizados },
              { label: "Niveles nuevos", valor: importacion.niveles_creados },
            ].map(({ label, valor }) => (
              <div key={label} className="rounded-lg bg-[rgba(30,58,95,0.04)] p-3">
                <div className="text-xl font-extrabold text-[#1e3a5f]">{valor.toLocaleString("es-CO")}</div>
                <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[#9aa7b5]">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(30,58,95,0.09)]">
            {terminado ? (
              <button type="button" onClick={onCerrar}>
                <ButtonSecondary value="Cerrar" className="px-8 py-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onCerrar}
                className="inline-flex items-center gap-1 text-xs text-[#6b7a8d] hover:text-[#2c3e50]"
              >
                <X className="h-3.5 w-3.5" />
                Cerrar (sigue en segundo plano)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ImportarSniesModal;
