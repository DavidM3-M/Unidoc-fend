/**
 * Componente para mostrar normativas y documentos asociados
 * Maneja estados de carga, error y muestra la lista de normativas
 * Permite visualizar documentos asociados a cada normativa
 */
import { DocumentTextIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

/* Interfaces */
interface Documento {
  id_documento: number;
  documentable_id: number;
  archivo: string;
  estado: string;
  archivo_url: string; // URL completa generada por el backend
}

interface Normativa {
  id_normativa: number;
  nombre: string;
  descripcion?: string; // Hacer opcional para manejar normativas sin descripción
  documentos_normativa?: Documento[]; // Ajuste para reflejar el nombre correcto del campo
}

const ManualUsuario = () => {
  const [normativas, setNormativas] = useState<Normativa[]>([]); // Inicializa como arreglo vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNormativas = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get('token');
      let rol: string | undefined;
      if (token) {
        try {
          rol = jwtDecode<{ rol: string }>(token).rol;
        } catch (err) {
          console.error('Error al decodificar el token:', err);
        }
      }

      const endpoint = rol === 'Docente' ? 'docente/obtener-normativas' : 'aspirante/obtener-normativas';

      const response = await axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.normativas) {
        throw new Error('La respuesta no contiene el campo "normativas"');
      }

      if (response.data.normativas.length === 0) {
        toast.info('No hay normativas registradas en la base de datos');
      }

      setNormativas(response.data.normativas);
    } catch (err) {
      console.error('Error al obtener normativas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNormativas();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-[#1e3a5f] font-medium">Cargando normativas...</p>
        <p className="text-gray-500 text-sm mt-2">Por favor espere un momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 w-full">
        <DocumentTextIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={fetchNormativas}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {normativas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="bg-[#1e3a5f]/10 p-4 rounded-full mb-4">
            <DocumentTextIcon className="h-10 w-10 text-[#1e3a5f]" />
          </div>
          <p className="text-[#1e3a5f] font-bold text-lg">
            No hay normativas subidas actualmente.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Por favor, intente más tarde.
          </p>
        </div>
      ) : (
        normativas.map((normativa) => (
          <div key={normativa.id_normativa} className="w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="p-6 flex flex-col items-center text-center">
                
                {/* Icono corporativo */}
                <div className="bg-[#1e3a5f]/10 p-3 rounded-xl mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-[#1e3a5f]" />
                </div>
                
                {/* Título y Descripción */}
                <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">
                  {normativa.nombre}
                </h2>
                <p className="text-sm text-gray-500 mb-6 max-w-lg">
                  {normativa.descripcion || 'Descripción no disponible'}
                </p>

                {/* Documentos asociados */}
                <div className="w-full max-w-md">
                  {normativa.documentos_normativa && normativa.documentos_normativa.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {normativa.documentos_normativa.map((documento) => (
                        <a
                          key={documento.id_documento}
                          href={documento.archivo_url}
                          download={documento.archivo.split('/').pop()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-center gap-2 border border-gray-200 rounded-xl p-3 hover:bg-[#1e3a5f]/5 hover:border-[#1e3a5f]/30 transition-all w-full"
                        >
                          <EyeIcon className="h-5 w-5 text-[#1e3a5f] group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-[#1e3a5f]">Visualizar normativa</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                      No hay documentos asociados a esta normativa.
                    </p>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManualUsuario;