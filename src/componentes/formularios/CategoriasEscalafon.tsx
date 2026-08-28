import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";

type EscalonDocente = {
  id_escalon: number;
  nombre: string;
  orden: number;
  formacion_minima: string | null;
  idioma_catalogo_id: number | null;
  nivel_mcer_minimo: string | null;
  puntaje_minimo: number | null;
  meses_minimos_escalon_anterior: number | null;
  evaluacion_minima: number | null;
  idioma?: { id_idioma_catalogo: number; nombre_idioma: string } | null;
};

type Props = {
  categoriaActual?: string;
};

const ENDPOINT = "/constantes/escalones-docente";

/**
 * Arma la lista de requisitos de un escalón a partir de sus datos reales — nada hardcodeado.
 *
 * Recibe la lista completa para poder nombrar el escalón anterior: la antigüedad ya no se cuenta
 * en la Universidad sino **en la categoría actual**, y "4 años como Auxiliar" es la diferencia
 * entre un docente que entiende por qué no asciende y uno que abre un ticket.
 */
const requisitosDe = (escalon: EscalonDocente, escalones: EscalonDocente[]): string[] => {
  const requisitos: string[] = [];

  if (escalon.formacion_minima) requisitos.push(escalon.formacion_minima);

  if (escalon.nivel_mcer_minimo) {
    const idioma = escalon.idioma?.nombre_idioma ?? "Idioma";
    requisitos.push(`${idioma} ${escalon.nivel_mcer_minimo}`);
  }

  if (escalon.evaluacion_minima !== null) {
    requisitos.push(`Evaluación docente ≥ ${escalon.evaluacion_minima}`);
  }

  if (escalon.puntaje_minimo !== null) {
    requisitos.push(`${escalon.puntaje_minimo} puntos de producción académica`);
  }

  if (escalon.meses_minimos_escalon_anterior !== null) {
    const meses = escalon.meses_minimos_escalon_anterior;
    const anios = Math.round((meses / 12) * 10) / 10;
    const anterior = escalonAnteriorA(escalon, escalones);
    requisitos.push(
      anterior
        ? `${meses} meses (${anios} años) como ${anterior.nombre}`
        : `${meses} meses (${anios} años) en el escalón anterior`
    );
  }

  return requisitos;
};

/** El escalón inmediatamente inferior por `orden`; null si este es el primero. */
const escalonAnteriorA = (
  escalon: EscalonDocente,
  escalones: EscalonDocente[]
): EscalonDocente | null =>
  escalones
    .filter((otro) => otro.orden < escalon.orden)
    .sort((a, b) => b.orden - a.orden)[0] ?? null;

const CategoriasEscalafon = ({ categoriaActual }: Props) => {
  const [escalones, setEscalones] = useState<EscalonDocente[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(ENDPOINT)
      .then((respuesta) => setEscalones(respuesta.data?.escalones_docente ?? []))
      .catch((error) => console.error("Error al obtener los escalones del escalafón:", error))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <p className="text-xs text-[#6b7a8d]">Cargando categorías...</p>;
  }

  return (
    <div className="grid gap-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {escalones.map((escalon) => {
          const esActual = categoriaActual === escalon.nombre;
          const requisitos = requisitosDe(escalon, escalones);

          return (
            <div
              key={escalon.id_escalon}
              className={`rounded-xl border p-4 flex flex-col gap-2 ${
                esActual
                  ? "border-[#c89b14] bg-[#fdf7e6]"
                  : "border-[rgba(30,58,95,0.15)] bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#1e3a5f]">{escalon.nombre}</span>
                {esActual && (
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#c89b14] text-white px-2 py-0.5">
                    Actual
                  </span>
                )}
              </div>

              {requisitos.length > 0 ? (
                <ul className="list-disc pl-4 text-xs text-[#2c3e50] space-y-0.5">
                  {requisitos.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#2c3e50]">
                  Categoría base — se asigna cuando no se cumplen los requisitos de los demás
                  escalones.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriasEscalafon;
