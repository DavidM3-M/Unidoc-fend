import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  PlusCircle,
  UploadCloud,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EliminarBoton from "../../../componentes/EliminarBoton";
import InputSearch from "../../../componentes/formularios/InputSearch";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { BotonEditar, EstadoBadge } from "./ControlesCatalogo";
import ProgramaFormacionEducativaModal from "./ProgramaFormacionEducativaModal";
import ImportarSniesModal from "./ImportarSniesModal";
import type { PaginacionMeta, ProgramaFormacionEducativa } from "../../../types/catalogos";

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_FORMACION_EDUCATIVA;
const POR_PAGINA = 20;

/**
 * "Formación educativa" (Fase 2 del catálogo de Formación académica): programas académicos con
 * nombre propio, enlazados a un nivel de formación y a una institución.
 *
 * Se alimenta de dos vías: importación masiva del Excel del SNIES, o alta manual (para programas
 * que todavía no aparecen en el archivo oficial).
 *
 * A diferencia de los demás catálogos de este admin, esta tabla pagina en el servidor: con la
 * importación masiva llega fácilmente a decenas de miles de filas, y traerlas todas de una vez
 * (como hacen Niveles/Tipos de experiencia/Producción académica, que sí caben en memoria) tardaba
 * ~22s en generar un JSON de ~29MB y el navegador hacía timeout.
 */
const FormacionEducativa = () => {
  const [programas, setProgramas] = useState<ProgramaFormacionEducativa[]>([]);
  const [meta, setMeta] = useState<PaginacionMeta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [modalPrograma, setModalPrograma] = useState<{ abierto: boolean; programa: ProgramaFormacionEducativa | null }>({
    abierto: false,
    programa: null,
  });
  const [modalImportar, setModalImportar] = useState(false);

  // Busca automáticamente 400ms después de que el usuario deja de escribir, y vuelve a la
  // página 1 (una búsqueda nueva invalida la página en la que estabas).
  useEffect(() => {
    const t = setTimeout(() => {
      setBusquedaAplicada(busqueda);
      setPagina(1);
    }, 400);
    return () => clearTimeout(t);
  }, [busqueda]);

  const fetchProgramas = async (paginaAConsultar: number, busquedaAConsultar: string) => {
    try {
      setCargando(true);
      const respuesta = await axiosInstance.get(ENDPOINT, {
        params: { pagina: paginaAConsultar, por_pagina: POR_PAGINA, buscar: busquedaAConsultar || undefined },
      });
      setProgramas(respuesta.data?.data ?? []);
      setMeta(respuesta.data?.meta ?? null);
    } catch (error) {
      console.error("Error al obtener los programas de formación educativa:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los programas"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchProgramas(pagina, busquedaAplicada);
  }, [pagina, busquedaAplicada]);

  const eliminarPrograma = async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT}/${id}`);
      toast.success("Programa eliminado.");
      fetchProgramas(pagina, busquedaAplicada);
    } catch (error) {
      console.error("Error al eliminar el programa:", error);
      toast.error(mensajeDeErrorApi(error, "No se pudo eliminar el programa."));
    }
  };

  const handleGuardado = () => {
    setModalPrograma({ abierto: false, programa: null });
    fetchProgramas(pagina, busquedaAplicada);
  };

  const totalPaginas = meta?.ultima_pagina ?? 1;
  const total = meta?.total ?? 0;
  const inicioRango = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const finRango = Math.min(pagina * POR_PAGINA, total);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#e8740e]" />
            Formación educativa
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            Programas del SNIES — se cargan por importación masiva o se agregan uno por uno
          </p>
        </div>
      </div>

      <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1e3a5f]">Catálogo</h2>
            <p className="text-sm text-[#6b7a8d]">
              Reimportar el mismo archivo actualiza los programas existentes en vez de duplicarlos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setModalImportar(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors"
            >
              <UploadCloud className="h-5 w-5" />
              Importar desde SNIES
            </button>
            <button
              onClick={() => setModalPrograma({ abierto: true, programa: null })}
              className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Nuevo programa
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-lg bg-[rgba(30,58,95,0.04)] p-3 text-xs text-[#2c3e50]">
          <Info className="h-4 w-4 flex-shrink-0 text-[#1e3a5f]" />
          <p>
            Si el nivel de formación de un programa no existe todavía, la importación lo crea sola
            en el catálogo de <span className="font-semibold">Niveles de formación</span>.
          </p>
        </div>

        <InputSearch
          className="w-full"
          containerClass="mb-4"
          placeholder="Buscar por programa o institución..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="overflow-hidden rounded-2xl border border-[rgba(30,58,95,0.09)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#f3ede1] to-[#f3ede1]/50 border-b border-[rgba(30,58,95,0.12)]">
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Programa</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Institución</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Nivel de formación</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(30,58,95,0.06)] bg-white">
                {cargando ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-[#6b7a8d]">
                      Cargando programas...
                    </td>
                  </tr>
                ) : programas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-[#6b7a8d]">
                      {busquedaAplicada ? "No se encontraron resultados." : "No hay programas todavía."}
                    </td>
                  </tr>
                ) : (
                  programas.map((programa) => (
                    <tr key={programa.id_programa} className="hover:bg-[#f3ede1]/30 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{programa.nombre_programa}</td>
                      <td className="px-6 py-3 text-sm text-[#2c3e50]">{programa.institucion?.nombre_institucion ?? ""}</td>
                      <td className="px-6 py-3 text-sm text-[#2c3e50]">
                        {programa.nivel_formacion_academica?.nivel_academico} ·{" "}
                        {programa.nivel_formacion_academica?.nivel_formacion}
                      </td>
                      <td className="px-6 py-3">
                        <EstadoBadge activo={programa.estado_programa === "Activo"} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <BotonEditar onClick={() => setModalPrograma({ abierto: true, programa })} />
                          <EliminarBoton id={programa.id_programa} onConfirmDelete={eliminarPrograma} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-white to-[#f3ede1]/30 border-t border-[rgba(30,58,95,0.09)] px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-[#2c3e50]">
              {total === 0 ? (
                "Sin registros"
              ) : (
                <>
                  Mostrando <span className="font-bold text-[#e8740e]">{inicioRango}-{finRango}</span> de{" "}
                  <span className="font-bold text-[#1e3a5f]">{total.toLocaleString("es-CO")}</span> programas
                </>
              )}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(1)}
                disabled={pagina <= 1}
                className="p-2 rounded-lg text-[#1e3a5f] hover:bg-[#f3ede1] disabled:text-[#6b7a8d]/30 disabled:cursor-not-allowed"
                title="Primera página"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1}
                className="p-2 rounded-lg text-[#1e3a5f] hover:bg-[#f3ede1] disabled:text-[#6b7a8d]/30 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-[#6b7a8d] mx-2">
                Página <span className="font-bold text-[#e8740e]">{pagina}</span> de{" "}
                <span className="font-bold text-[#1e3a5f]">{totalPaginas}</span>
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina >= totalPaginas}
                className="p-2 rounded-lg text-[#1e3a5f] hover:bg-[#f3ede1] disabled:text-[#6b7a8d]/30 disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPagina(totalPaginas)}
                disabled={pagina >= totalPaginas}
                className="p-2 rounded-lg text-[#1e3a5f] hover:bg-[#f3ede1] disabled:text-[#6b7a8d]/30 disabled:cursor-not-allowed"
                title="Última página"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalPrograma.abierto && (
        <CustomDialog
          title={modalPrograma.programa ? "Editar programa" : "Nuevo programa"}
          open={modalPrograma.abierto}
          onClose={() => setModalPrograma({ abierto: false, programa: null })}
          width="600px"
        >
          <ProgramaFormacionEducativaModal
            programa={modalPrograma.programa}
            onSuccess={handleGuardado}
            onCancel={() => setModalPrograma({ abierto: false, programa: null })}
          />
        </CustomDialog>
      )}

      {modalImportar && (
        <CustomDialog
          title="Importar desde SNIES"
          open={modalImportar}
          onClose={() => setModalImportar(false)}
          width="560px"
        >
          <ImportarSniesModal
            onFinalizado={() => {
              fetchProgramas(pagina, busquedaAplicada);
            }}
            onCerrar={() => setModalImportar(false)}
          />
        </CustomDialog>
      )}
    </div>
  );
};

export default FormacionEducativa;
