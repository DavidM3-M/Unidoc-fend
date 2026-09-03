import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ArrowRight, FilePlus2, Pencil } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../utils/erroresApi";
import { fechaLarga } from "../../utils/fechas";
import type { BitacoraEscalafon, RetratoTramo } from "../../types/escalafon";
import type { AreaEscalafon } from "./area";

type Props = {
  area: AreaEscalafon;
  userId: number;
};

/** Los campos del retrato que se le enseñan a una persona, en el orden en que se leen. */
const CAMPOS: { clave: keyof RetratoTramo; etiqueta: string }[] = [
  { clave: "escalon", etiqueta: "Escalón" },
  { clave: "desde", etiqueta: "Desde" },
  { clave: "hasta", etiqueta: "Hasta" },
];

const valor = (retrato: RetratoTramo | null, clave: keyof RetratoTramo): string => {
  const dato = retrato?.[clave];
  if (dato === null || dato === undefined || dato === "") {
    return clave === "hasta" ? "vigente" : "—";
  }
  return String(dato);
};

/**
 * Qué se ha tocado a mano en el historial de un docente.
 *
 * Solo salen aquí las dos intervenciones del Administrador: el ingreso manual y la corrección de
 * un tramo. Los ascensos y las reversiones **no** se duplican —van firmados en el propio tramo y
 * el historial de arriba ya los muestra—; esta lista cubre justo lo que antes no dejaba rastro en
 * ninguna parte.
 *
 * Se enseña el antes y el después de cada campo que cambió, no un volcado del JSON: quien audita
 * un expediente necesita ver el movimiento, no el registro.
 */
const BitacoraEscalafonPanel = ({ area, userId }: Props) => {
  const [filas, setFilas] = useState<BitacoraEscalafon[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    axiosInstance
      .get(`${area.endpointDocentes}/${userId}/bitacora`)
      .then((respuesta) => {
        if (vigente) setFilas(respuesta.data?.data ?? []);
      })
      .catch((error) => {
        console.error("Error al obtener la bitácora del escalafón:", error);
        if (vigente) toast.error(mensajeDeErrorApi(error, "No se pudo cargar la bitácora"));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [area.endpointDocentes, userId]);

  if (cargando) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] p-6 text-center text-sm text-[#6b7a8d]">
        Nadie ha tocado este historial a mano. Todo lo que hay en el expediente salió de los actos
        ordinarios: el ingreso automático al registrarse la contratación de planta, los ascensos y
        las reversiones.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3 p-1">
      {filas.map((fila) => {
        const esCreacion = fila.tipo_modificacion === "creacion";
        const Icono = esCreacion ? FilePlus2 : Pencil;

        const cambios = esCreacion
          ? []
          : CAMPOS.filter(
              ({ clave }) => valor(fila.datos_anteriores, clave) !== valor(fila.datos_nuevos, clave)
            );

        return (
          <li
            key={fila.id_bitacora}
            className="flex flex-col gap-2 rounded-xl border border-[rgba(30,58,95,0.09)] bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
                <Icono className="h-4 w-4 text-[#e8740e]" />
                {esCreacion ? "Ingreso manual" : "Corrección del tramo"}
                {fila.historial_escalon_id && (
                  <span className="text-xs font-normal text-[#9aa7b5]">
                    #{fila.historial_escalon_id}
                  </span>
                )}
              </span>
              <span className="text-xs text-[#6b7a8d]">
                {fila.fecha ? fechaLarga(fila.fecha.slice(0, 10)) : "—"}
                {fila.modificado_por && ` · ${fila.modificado_por}`}
              </span>
            </div>

            {esCreacion ? (
              <p className="text-sm text-[#2c3e50]">
                Entró como <b>{valor(fila.datos_nuevos, "escalon")}</b> desde el{" "}
                {valor(fila.datos_nuevos, "desde")}.
              </p>
            ) : cambios.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {cambios.map(({ clave, etiqueta }) => (
                  <li key={clave} className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="w-16 shrink-0 text-xs uppercase tracking-wide text-[#6b7a8d]">
                      {etiqueta}
                    </span>
                    <span className="text-[#9aa7b5] line-through">
                      {valor(fila.datos_anteriores, clave)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 self-center text-[#e8740e]" />
                    <span className="font-semibold text-[#1e3a5f]">
                      {valor(fila.datos_nuevos, clave)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#9aa7b5]">Sin cambios en escalón ni fechas.</p>
            )}

            <p className="rounded-lg bg-[rgba(30,58,95,0.04)] px-3 py-2 text-xs italic text-[#2c3e50]">
              «{fila.motivo}»
            </p>
          </li>
        );
      })}
    </ol>
  );
};

export default BitacoraEscalafonPanel;
