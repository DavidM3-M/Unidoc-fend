import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CalendarIcon, BriefcaseIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";


interface Convocatoria {
  id_convocatoria: number;
  numero_convocatoria: string;
  nombre_convocatoria: string;
  tipo: string;
  periodo_academico: string;
  cargo_solicitado?: string;
  facultad: string;
  cursos: string;
  tipo_vinculacion: string;
  personas_requeridas: number;
  fecha_publicacion: string;
  fecha_cierre: string;
  fecha_inicio_contrato: string;
  perfil_profesional: string;
  experiencia_requerida: string;
  solicitante: string;
  aprobaciones: string;
  descripcion: string;
  estado_convocatoria: string;
}

interface Props {
  idConvocatoria: number;
  isOpen: boolean;
  onClose: () => void;
}

const DetalleConvocatoriaPublica = ({ idConvocatoria, isOpen, onClose }: Props) => {
  const [convocatoria, setConvocatoria] = useState<Convocatoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && idConvocatoria) {
      fetchConvocatoria();
    }
  }, [isOpen, idConvocatoria]);

  const fetchConvocatoria = async () => {
    try {
      setLoading(true);
      const endpoint = `${import.meta.env.VITE_API_URL}/publico/convocatorias/${idConvocatoria}`;
      const response = await axios.get(endpoint);

      const raw = response.data?.convocatoria ?? response.data;
      if (raw) {
        // Normalizar nombres de campo posibles para 'cargo'
        const cargo = raw.cargo_solicitado ?? raw.cargo ?? raw.puesto ?? raw.nombre_cargo ?? raw.nombre_puesto ?? null;

        const normalized: Convocatoria = {
          id_convocatoria: raw.id_convocatoria ?? raw.id ?? 0,
          numero_convocatoria: raw.numero_convocatoria ?? raw.numero ?? "",
          nombre_convocatoria: raw.nombre_convocatoria ?? raw.nombre ?? "",
          tipo: raw.tipo ?? raw.tipo_convocatoria ?? "",
          periodo_academico: raw.periodo_academico ?? raw.periodo ?? "",
          cargo_solicitado: cargo ?? undefined,
          facultad: raw.facultad ?? raw.departamento ?? "",
          cursos: raw.cursos ?? "",
          tipo_vinculacion: raw.tipo_vinculacion ?? raw.vinculacion ?? "",
          personas_requeridas: raw.personas_requeridas ?? raw.cupos ?? 0,
          fecha_publicacion: raw.fecha_publicacion ?? raw.created_at ?? "",
          fecha_cierre: raw.fecha_cierre ?? raw.fecha_fin ?? "",
          fecha_inicio_contrato: raw.fecha_inicio_contrato ?? raw.fecha_inicio ?? "",
          perfil_profesional: raw.perfil_profesional ?? raw.perfil ?? "",
          experiencia_requerida: raw.experiencia_requerida ?? raw.experiencia ?? "",
          solicitante: raw.solicitante ?? raw.solicitado_por ?? "",
          aprobaciones: raw.aprobaciones ?? raw.aprobacion ?? "",
          descripcion: raw.descripcion ?? raw.detalle ?? "",
          estado_convocatoria: raw.estado_convocatoria ?? raw.estado ?? "",
        };

        setConvocatoria(normalized);
      }
    } catch (error) {
      console.error("Error al obtener convocatoria:", error);
      toast.error("Error al cargar los detalles de la convocatoria");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header del modal */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center">
                  <Dialog.Title className="text-xl font-bold text-white">
                    Detalles de la Convocatoria
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="px-6 py-6">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : convocatoria ? (
                    <div className="space-y-6">
                      {/* Información principal */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {convocatoria.nombre_convocatoria}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {convocatoria.tipo}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {convocatoria.estado_convocatoria}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {convocatoria.numero_convocatoria}
                          </span>
                        </div>
                      </div>

                      {/* Fechas importantes */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <CalendarIcon className="h-5 w-5" />
                            <span className="font-semibold text-sm">Publicación</span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {formatearFecha(convocatoria.fecha_publicacion)}
                          </p>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red-700 mb-2">
                            <CalendarIcon className="h-5 w-5" />
                            <span className="font-semibold text-sm">Cierre</span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {formatearFecha(convocatoria.fecha_cierre)}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-700 mb-2">
                            <CalendarIcon className="h-5 w-5" />
                            <span className="font-semibold text-sm">Inicio Contrato</span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {formatearFecha(convocatoria.fecha_inicio_contrato)}
                          </p>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                          Descripción
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {convocatoria.descripcion || "No hay descripción disponible"}
                        </p>
                      </div>

                      {/* Información del cargo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BriefcaseIcon className="h-5 w-5 text-blue-500" />
                            Información del Cargo
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Cargo:</span>
                              <p className="text-gray-900">{convocatoria.cargo_solicitado}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Facultad:</span>
                              <p className="text-gray-900">{convocatoria.facultad}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Tipo de vinculación:</span>
                              <p className="text-gray-900">{convocatoria.tipo_vinculacion}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Personas requeridas:</span>
                              <p className="text-gray-900">{convocatoria.personas_requeridas}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Detalles Académicos</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Periodo académico:</span>
                              <p className="text-gray-900">{convocatoria.periodo_academico}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Cursos:</span>
                              <p className="text-gray-900">{convocatoria.cursos}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Solicitante:</span>
                              <p className="text-gray-900">{convocatoria.solicitante}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Perfil profesional */}
                      {convocatoria.perfil_profesional && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Perfil Profesional Requerido
                          </h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {convocatoria.perfil_profesional}
                          </p>
                        </div>
                      )}

                      {/* Experiencia requerida */}
                      {convocatoria.experiencia_requerida && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Experiencia Requerida
                          </h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {convocatoria.experiencia_requerida}
                          </p>
                        </div>
                      )}

                      {/* Aprobaciones */}
                      {convocatoria.aprobaciones && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Aprobaciones
                          </h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {convocatoria.aprobaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No se pudo cargar la información</p>
                    </div>
                  )}
                </div>

                {/* Footer del modal */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DetalleConvocatoriaPublica;