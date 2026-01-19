import InputSearch from "../../../componentes/formularios/InputSearch";
import { DataTable } from "../../../componentes/tablas/DataTable";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import axios from "axios";
import Cookie from "js-cookie";

import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  User, 
  X, 
  Phone, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages, 
  FileDown 
} from "lucide-react";


// Interfaz para definir la estructura de los datos de las postulaciones
interface Postulaciones {
  id_postulacion: number;
  convocatoria_id: number;
  user_id: number;
  nombre_postulante: string;
  estado_postulacion: string;
  fecha_postulacion: string;
  usuario_postulacion: {
    primer_nombre: string;
    primer_apellido: string;
    numero_identificacion: string;
  };
  convocatoria_postulacion: {
    nombre_convocatoria: string;
    estado_convocatoria: string;
  };
}

// Interfaz para definir la estructura de los datos de contrataciones
interface Contratacion {
  id_contratacion: number;
  user_id: number;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
}
// Nueva interfaz para perfil completo
interface AspiranteDetallado {
  id: number;
  datos_personales: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    tipo_identificacion: string;
    numero_identificacion: string;
    genero: string;
    fecha_nacimiento: string;
    estado_civil: string;
    email: string;
    municipio?: string;
    departamento?: string;
    foto_perfil_url?: string;
  };
  informacion_contacto?: {
    telefono?: string;
    celular?: string;
    direccion?: string;
    barrio?: string;
    correo_alterno?: string;
    categoria_libreta_militar?: string;
    numero_libreta_militar?: string;
    numero_distrito_militar?: string;
    documentos_libreta_militar?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  };
  eps?: {
    nombre_eps?: string;
    tipo_afiliacion?: string;
    estado_afiliacion?: string;
    fecha_afiliacion_efectiva?: string;
    fecha_finalizacion_afiliacion?: string;
    tipo_afiliado?: string;
    numero_afiliado?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  };
  rut?: {
    numero_rut?: string;
    razon_social?: string;
    tipo_persona?: string;
    codigo_ciiu?: string;
    responsabilidades_tributarias?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  };
  idiomas?: Array<{ 
    idioma: string; 
    nivel: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  }>;
  experiencias?: Array<{
    cargo: string;
    empresa: string;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  }>;
  estudios?: Array<{
    titulo: string;
    institucion: string;
    fecha_inicio: string;
    fecha_fin?: string;
    nivel_educativo: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  }>;
  produccion_academica?: Array<{
    titulo: string;
    numero_autores?: number;
    medio_divulgacion?: string;
    fecha_divulgacion?: string;
    documentos?: Array<{
      id: number;
      nombre: string;
      url: string;
      tipo: string;
      estado: string;
    }>;
  }>;
  aptitudes?: Array<{
    nombre: string;
    descripcion?: string;
  }>;
  postulaciones?: Array<{
    convocatoriaPostulacion?: { titulo: string; };
  }>;
  documentos?: Array<{
    id: number;
    nombre: string;
    url: string;
    tipo: string;
    categoria: string;
    estado: string;
  }>;
  avales: {
    rectoria: { estado?: string; aprobado_por?: number; fecha?: string; };
    vicerrectoria: { estado?: string; aprobado_por?: number; fecha?: string; };
  };
}
const VerPostulaciones = () => {
  // Estado para almacenar las postulaciones
  const [postulaciones, setPostulaciones] = useState<Postulaciones[]>([]);
  // Estado para almacenar los IDs de los usuarios ya contratados
  const [usuariosContratados, setUsuariosContratados] = useState<number[]>([]);
  // Estado para almacenar las contrataciones
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  // Estado para manejar el filtro global de búsqueda
  const [globalFilter, setGlobalFilter] = useState("");
  // Estado para manejar el indicador de carga
  const [loading, setLoading] = useState(true);

  // Nuevos estados para el perfil completo
  const [perfilCompleto, setPerfilCompleto] = useState<AspiranteDetallado | null>(null);
  const [mostrarPerfilCompleto, setMostrarPerfilCompleto] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);


  // Función para obtener datos de postulaciones y contrataciones
  const fetchDatos = async () => {
    try {
      setLoading(true); // Indica que los datos están en proceso de carga
      const [postulacionesRes, contratacionesRes] = await Promise.all([
        axiosInstance.get("/talentoHumano/obtener-postulaciones"),
        axiosInstance.get("/talentoHumano/obtener-contrataciones"),
      ]);

      // Actualiza el estado con los datos obtenidos
      setPostulaciones(postulacionesRes.data.postulaciones);
      setContrataciones(contratacionesRes.data.contrataciones);

      // Extrae los IDs de los usuarios ya contratados
      const idsContratados = contratacionesRes.data.contrataciones.map(
        (c: any) => c.user_id
      );
      setUsuariosContratados(idsContratados);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos"); // Muestra un mensaje de error
    } finally {
      setLoading(false); // Indica que la carga ha finalizado
    }
  };

  // Llama a la función fetchDatos al montar el componente
  useEffect(() => {
    fetchDatos();
  }, []);

  // const handleEliminar = async (id: number) => {
  //   try {
  //     await axiosInstance.delete(`/talentoHumano/eliminar-postulacion/${id}`);

  //     // Actualizar estado de manera óptima
  //     setPostulaciones((prev) =>
  //       prev.filter((item) => item.id_postulacion !== id)
  //     );
  //     toast.success("Convocatoria eliminada correctamente");
  //   } catch (error) {
  //     console.error("Error al eliminar:", error);

  //     if (axios.isAxiosError(error)) {
  //       toast.error("Error al eliminar la convocatoria");
  //     }
  //   }
  // };

  // Actualizar el estado de la postulación

  const handleActualizar = async (
    id: number,
    nuevoEstado: "Aceptada" | "Rechazada"
  ) => {
    try {
      await axiosInstance.put(`/talentoHumano/actualizar-postulacion/${id}`, {
        estado_postulacion: nuevoEstado,
      });

      // Actualiza el estado de la postulación en el frontend
      setPostulaciones((prev) =>
        prev.map((item) =>
          item.id_postulacion === id
            ? { ...item, estado_postulacion: nuevoEstado }
            : item
        )
      );
      toast.success(`Postulación ${nuevoEstado.toLowerCase()} correctamente`); // Muestra un mensaje de éxito
    } catch (error) {
      console.error("Error al actualizar:", error);
      if (axios.isAxiosError(error)) {
        toast.error(`Error al ${nuevoEstado.toLowerCase()} la postulación`); // Muestra un mensaje de error
      }
    }
  };

  // Función para ver la hoja de vida de un postulante en formato PDF
  const handleVerHojaVida = async (convocatoriaId: number, userId: number) => {
    const url = `${
      import.meta.env.VITE_API_URL
    }/talentoHumano/hoja-de-vida-pdf/${convocatoriaId}/${userId}`;
    console.log("URL de la hoja de vida:", url);
    try {
      const response = await axios.get(url, {
        responseType: "blob", // Indica que la respuesta es un archivo binario
        headers: {
          Authorization: `Bearer ${Cookie.get("token")}`, // Incluye el token de autorización
        },
        withCredentials: true,
      });

      // Crear un blob a partir de la respuesta
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });

      // Crear una URL para el blob
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Abrir el PDF en una nueva pestaña
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Error al ver la hoja de vida:", error);
    }
  };
//función para ver perfil completo
  const verPerfilCompleto = async (userId: number) => {
    try {
      setLoadingPerfil(true);
      const response = await axiosInstance.get(`/talentoHumano/aspirantes/${userId}`);
      setPerfilCompleto(response.data.aspirante);
      setMostrarPerfilCompleto(true);
    } catch (error) {
      console.error("Error al obtener perfil completo:", error);
      toast.error("Error al cargar el perfil del aspirante");
    } finally {
      setLoadingPerfil(false);
    }
  };
  const cerrarPerfilCompleto = () => {
    setMostrarPerfilCompleto(false);
    setPerfilCompleto(null);
  };
  // Define las columnas de la tabla
  const columns = useMemo<ColumnDef<Postulaciones>[]>(
    () => [
      {
        accessorKey: "convocatoria_postulacion.nombre_convocatoria",
        header: "Convocatoria",
        size: 100,
      },
      {
        accessorKey: "estado_postulacion",
        header: "Estado",
        size: 50,
      },
      {
        accessorKey: "usuario_postulacion.numero_identificacion",
        header: "Identificación",
        size: 100,
      },
      {
        id: "nombrePostulante",
        header: "Postulante",
        accessorFn: (row) =>
          `${row.usuario_postulacion.primer_nombre} ${row.usuario_postulacion.primer_apellido}`,
        size: 200,
      },
      {
        accessorKey: "convocatoria_postulacion.estado_convocatoria",
        header: "Estado Conv.",
        size: 50,
      },
      {
        header: "Acciones",
        
        cell: ({ row }) => {
          
          const yaContratado = usuariosContratados.includes(
            row.original.user_id
          );
          const estadoActual = row.original.estado_postulacion;

          // Determina si mostrar "Seleccionar" como opción seleccionada
          const mostrarSeleccionar =
            !estadoActual || estadoActual === "Enviada";

          return (
            <div className="flex space-x-2">
              {/* Selector para aceptar o rechazar postulaciones */}
              <select
                className="border rounded px-2 py-1"
                onChange={(e) => {
                  const nuevoEstado = e.target.value as
                    | "Aceptada"
                    | "Rechazada";
                  if (nuevoEstado) {
                    handleActualizar(row.original.id_postulacion, nuevoEstado);
                  }
                }}
                value={mostrarSeleccionar ? "" : estadoActual}
              >
                <option value="" disabled>
                  Seleccionar
                </option>
                <option value="Aceptada">Aceptar</option>
                <option value="Rechazada">Rechazar</option>
              </select>
              {/* NUEVO BOTÓN - Ver Perfil Completo */}
              <button
                className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                onClick={() => verPerfilCompleto(row.original.user_id)}
              >
                <User size={16} />
              </button>

              {/* Botón para visualizar la hoja de vida */}
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() =>
                  handleVerHojaVida(
                    row.original.convocatoria_id,
                    row.original.user_id
                  )
                }
              >
                Hoja de Vida
              </button>

              {/* Botón para contratar o ver contrato */}
              {row.original.estado_postulacion === "Aceptada" &&
                (yaContratado ? (
                  <Link
                    to={`/talento-humano/contrataciones/usuario/${row.original.user_id}`}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Ver Contrato
                  </Link>
                ) : (
                  <Link
                    to={`/talento-humano/contrataciones/contratacion/${row.original.user_id}`}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Contratar
                  </Link>
                ))}
            </div>
          );
        },
      },
    ],
    [usuariosContratados, contrataciones]
  );

  // Renderiza el contenido del componente
  return (
    <div className="flex flex-col gap-4 h-full min-w-5xl max-w-6xl bg-white rounded-3xl p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Link to={"/talento-humano"}>
              <ButtonRegresar />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Postulaciones
          </h1>
        </div>
      </div>

      {/* Campo de búsqueda */}
      <div className="flex justify-between items-center w-full">
        <InputSearch
          type="text"
          placeholder="Buscar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={postulaciones} // Datos de la tabla
        columns={columns} // Columnas de la tabla
        globalFilter={globalFilter} // Filtro global
        loading={loading} // Estado de carga
      />
      {/* modal perfil completo*/}
      {mostrarPerfilCompleto && perfilCompleto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-t-xl">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            {perfilCompleto.datos_personales.foto_perfil_url ? (
                              <img
                                src={perfilCompleto.datos_personales.foto_perfil_url}
                                alt="Foto"
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center border-4 border-white shadow-lg">
                                <User size={40} />
                              </div>
                            )}
                            <div>
                              <h2 className="text-2xl font-bold">
                                {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido}
                              </h2>
                              <p className="text-indigo-100 mt-1">
                                {perfilCompleto.datos_personales.tipo_identificacion}: {perfilCompleto.datos_personales.numero_identificacion}
                              </p>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <Mail size={14} />
                                  {perfilCompleto.datos_personales.email}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button onClick={cerrarPerfilCompleto} className="text-white hover:bg-indigo-800 p-2 rounded-lg">
                            <X size={24} />
                          </button>
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex gap-2 mt-4">
                          <button
                        onClick={() => {
                            const postulacionUsuario = postulaciones.find(p => p.user_id === perfilCompleto.id);
                            if (postulacionUsuario) {
                              handleVerHojaVida(postulacionUsuario.convocatoria_id, perfilCompleto.id);
                            } else {
                              toast.error("No se encontró convocatoria asociada");
                            }
                          }}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 text-sm font-semibold flex items-center gap-2"
                      >
                        <FileText size={16} />
                        Descargar Hoja de Vida
                      </button>
                        </div>
                      </div>
                
                      {/* Contenido */}
                      <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Datos Personales */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <User size={20} className="text-indigo-600" />
                              Datos Personales
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <span className="font-semibold text-gray-600">Género:</span>
                                <span>{perfilCompleto.datos_personales.genero}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="font-semibold text-gray-600">Fecha Nacimiento:</span>
                                <span>{perfilCompleto.datos_personales.fecha_nacimiento}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="font-semibold text-gray-600">Estado Civil:</span>
                                <span>{perfilCompleto.datos_personales.estado_civil}</span>
                              </div>
                              {perfilCompleto.datos_personales.municipio && (
                                <div className="grid grid-cols-2 gap-2">
                                  <span className="font-semibold text-gray-600">Ubicación:</span>
                                  <span>{perfilCompleto.datos_personales.municipio}, {perfilCompleto.datos_personales.departamento}</span>
                                </div>
                              )}
                            </div>
                          </div>
                           {/* Avales */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <Award size={20} className="text-indigo-600" />
                              Avales
                            </h3>
                            <div className="space-y-3">
                              <div className={`flex items-center justify-between p-2 rounded ${
                                perfilCompleto.avales.rectoria.estado === 'Aprobado' ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                <span className="font-semibold text-sm">Rectoría</span>
                                <span className={`text-sm flex items-center gap-1 ${
                                  perfilCompleto.avales.rectoria.estado === 'Aprobado' ? 'text-green-700' : 'text-orange-700'
                                }`}>
                                  {perfilCompleto.avales.rectoria.estado === 'Aprobado' ? (
                                    <><CheckCircle size={16} /> Aprobado</>
                                  ) : (
                                    <><XCircle size={16} /> Pendiente</>
                                  )}
                                </span>
                              </div>
                              <div className={`flex items-center justify-between p-2 rounded ${
                                perfilCompleto.avales.vicerrectoria.estado === 'Aprobado' ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <span className="font-semibold text-sm">Vicerrectoría</span>
                                <span className={`text-sm flex items-center gap-1 ${
                                  perfilCompleto.avales.vicerrectoria.estado === 'Aprobado' ? 'text-green-700' : 'text-gray-600'
                                }`}>
                                  {perfilCompleto.avales.vicerrectoria.estado === 'Aprobado' ? (
                                    <><CheckCircle size={16} /> Aprobado</>
                                  ) : (
                                    <><XCircle size={16} /> Pendiente</>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                
                {/* Contacto */}
                {perfilCompleto.informacion_contacto && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Phone size={20} className="text-indigo-600" />
                      Contacto
                    </h3>
                    <div className="space-y-2 text-sm">
                      {perfilCompleto.informacion_contacto.telefono && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Teléfono:</span>
                          <span>{perfilCompleto.informacion_contacto.telefono}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.celular && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Celular:</span>
                          <span>{perfilCompleto.informacion_contacto.celular}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.direccion && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Dirección:</span>
                          <span>{perfilCompleto.informacion_contacto.direccion}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.barrio && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Barrio:</span>
                          <span>{perfilCompleto.informacion_contacto.barrio}</span>
                        </div>
                      )}
                      {perfilCompleto.informacion_contacto.correo_alterno && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Correo Alterno:</span>
                          <span>{perfilCompleto.informacion_contacto.correo_alterno}</span>
                        </div>
                      )}
                      
                      
                    </div>
                  </div>
                )}{/* Información Militar */}
                {perfilCompleto.informacion_contacto?.categoria_libreta_militar && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Award size={20} className="text-indigo-600" />
                      Información Militar
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-gray-600">Categoría:</span>
                        <span>{perfilCompleto.informacion_contacto.categoria_libreta_militar}</span>
                      </div>
                      
                      {perfilCompleto.informacion_contacto.numero_libreta_militar && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Número:</span>
                          <span>{perfilCompleto.informacion_contacto.numero_libreta_militar}</span>
                        </div>
                      )}
                      
                      {perfilCompleto.informacion_contacto.numero_distrito_militar && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-semibold text-gray-600">Distrito:</span>
                          <span>{perfilCompleto.informacion_contacto.numero_distrito_militar}</span>
                        </div>
                      )}
                      
                      {/* Documentos Libreta Militar */}
                      {perfilCompleto.informacion_contacto.documentos_libreta_militar && 
                      perfilCompleto.informacion_contacto.documentos_libreta_militar.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="font-semibold text-gray-600 text-sm mb-2">Documentos:</p>
                          <div className="space-y-1">
                            {perfilCompleto.informacion_contacto.documentos_libreta_militar.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                              >
                                <FileDown size={12} />
                                {doc.nombre}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                           
                          {/* EPS y RUT */}
                <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Info Adicional</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* EPS */}
                    {perfilCompleto.eps && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-semibold text-sm text-indigo-600 mb-2 flex items-center gap-2">
                          <FileText size={16} />
                          EPS
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-semibold text-gray-600">Nombre:</span>
                            <span>{perfilCompleto.eps.nombre_eps}</span>
                          </div>
                          {perfilCompleto.eps.tipo_afiliacion && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-gray-600">Tipo:</span>
                              <span>{perfilCompleto.eps.tipo_afiliacion}</span>
                            </div>
                          )}
                          {perfilCompleto.eps.estado_afiliacion && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-gray-600">Estado:</span>
                              <span className={perfilCompleto.eps.estado_afiliacion === 'Activo' ? 'text-green-600 font-semibold' : ''}>
                                {perfilCompleto.eps.estado_afiliacion}
                              </span>
                            </div>
                          )}
                          {perfilCompleto.eps.fecha_afiliacion_efectiva && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-gray-600">Fecha:</span>
                              <span>{perfilCompleto.eps.fecha_afiliacion_efectiva}</span>
                            </div>
                          )}
                          
                          {/* Documentos EPS */}
                          {perfilCompleto.eps.documentos && perfilCompleto.eps.documentos.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="font-semibold text-gray-600 text-xs mb-1">Documentos:</p>
                              {perfilCompleto.eps.documentos.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  <FileDown size={12} />
                                  {doc.nombre}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                
                           {/* RUT */}
                    {perfilCompleto.rut && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-semibold text-sm text-indigo-600 mb-2 flex items-center gap-2">
                          <FileText size={16} />
                          RUT
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-semibold text-gray-600">Número:</span>
                            <span>{perfilCompleto.rut.numero_rut}</span>
                          </div>
                          {perfilCompleto.rut.razon_social && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-gray-600">Razón Social:</span>
                              <span>{perfilCompleto.rut.razon_social}</span>
                            </div>
                          )}
                          {perfilCompleto.rut.tipo_persona && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-gray-600">Tipo:</span>
                              <span>{perfilCompleto.rut.tipo_persona}</span>
                            </div>
                          )}
                          {perfilCompleto.rut.codigo_ciiu && (
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-semibold text-gray-600">CIIU:</span>
                              <span className="text-xs">{perfilCompleto.rut.codigo_ciiu}</span>
                            </div>
                          )}
                          
                          {/* Documentos RUT */}
                          {perfilCompleto.rut.documentos && perfilCompleto.rut.documentos.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="font-semibold text-gray-600 text-xs mb-1">Documentos:</p>
                              {perfilCompleto.rut.documentos.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  <FileDown size={12} />
                                  {doc.nombre}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                         
                        </div>
                 {/* Aptitudes */}
                            {perfilCompleto.aptitudes && perfilCompleto.aptitudes.length > 0 && (
                              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <Award size={20} className="text-indigo-600" />
                                  Aptitudes y Habilidades
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {perfilCompleto.aptitudes.map((aptitud, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded border border-indigo-200">
                                      <p className="font-semibold text-indigo-700">{aptitud.nombre}</p>
                                      {aptitud.descripcion && (
                                        <p className="text-sm text-gray-600 mt-1">{aptitud.descripcion}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                           {/* Producción Académica */}
                {perfilCompleto.produccion_academica && perfilCompleto.produccion_academica.length > 0 && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <GraduationCap size={20} className="text-indigo-600" />
                      Producción Académica
                    </h3>
                    <div className="space-y-3">
                      {perfilCompleto.produccion_academica.map((prod, idx) => (
                        <div key={idx} className="bg-white p-4 rounded border">
                          <h4 className="font-bold text-gray-800">{prod.titulo}</h4>
                          <div className="space-y-1 mt-2 text-sm">
                            {prod.numero_autores && (
                              <div className="flex gap-2">
                                <span className="text-gray-600 font-semibold">Autores:</span>
                                <span>{prod.numero_autores}</span>
                              </div>
                            )}
                            {prod.medio_divulgacion && (
                              <div className="flex gap-2">
                                <span className="text-gray-600 font-semibold">Medio:</span>
                                <span>{prod.medio_divulgacion}</span>
                              </div>
                            )}
                            {prod.fecha_divulgacion && (
                              <div className="flex gap-2">
                                <span className="text-gray-600 font-semibold">Fecha:</span>
                                <span>{prod.fecha_divulgacion}</span>
                              </div>
                            )}
                          </div>
                          
                          {prod.documentos && prod.documentos.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Documentos de soporte:</p>
                              <div className="flex flex-wrap gap-2">
                                {prod.documentos.map((doc) => (
                                  <a
                                    key={doc.id}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1 rounded"
                                  >
                                    <FileDown size={12} />
                                    {doc.nombre}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                        {/* Experiencias */}
                        {perfilCompleto.experiencias && perfilCompleto.experiencias.length > 0 && (
                          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <Briefcase size={20} className="text-indigo-600" />
                              Experiencia Laboral
                            </h3>
                            <div className="space-y-3">
                              {perfilCompleto.experiencias.map((exp, idx) => (
                                <div key={idx} className="bg-white p-4 rounded border">
                                  <h4 className="font-bold">{exp.cargo}</h4>
                                  <p className="text-sm text-gray-600">{exp.empresa}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {exp.fecha_inicio} - {exp.fecha_fin || 'Actualidad'}
                                  </p>
                                  {exp.descripcion && <p className="text-sm mt-2">{exp.descripcion}</p>}
                                {/* Documentos */}
                          {exp.documentos && exp.documentos.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Documentos de soporte:</p>
                              <div className="flex flex-wrap gap-2">
                                {exp.documentos.map((doc) => (
                                  <a
                                    key={doc.id}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1 rounded"
                                  >
                                    <FileDown size={12} />
                                    {doc.nombre}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}   
                               
                        {/* Estudios */}
                        {perfilCompleto.estudios && perfilCompleto.estudios.length > 0 && (
                          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <GraduationCap size={20} className="text-indigo-600" />
                              Formación Académica
                            </h3>
                            <div className="space-y-3">
                              {perfilCompleto.estudios.map((est, idx) => (
                                <div key={idx} className="bg-white p-4 rounded border">
                                  <h4 className="font-bold">{est.titulo}</h4>
                                  <p className="text-sm text-gray-600">{est.institucion}</p>
                                  <p className="text-xs text-gray-500">{est.nivel_educativo}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {est.fecha_inicio} - {est.fecha_fin || 'En curso'}
                                  </p>
                                {/* Documentos */}
                          {est.documentos && est.documentos.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Documentos de soporte:</p>
                              <div className="flex flex-wrap gap-2">
                                {est.documentos.map((doc) => (
                                  <a
                                    key={doc.id}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-1 rounded"
                                  >
                                    <FileDown size={12} />
                                    {doc.nombre}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                        {/* Idiomas */}
                        {perfilCompleto.idiomas && perfilCompleto.idiomas.length > 0 && (
                          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <Languages size={20} className="text-indigo-600" />
                              Idiomas
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {perfilCompleto.idiomas.map((idioma, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border">
                                  <p className="font-semibold">{idioma.idioma}</p>
                                  <p className="text-sm text-gray-600">Nivel: {idioma.nivel}</p>
                               {/* Documentos */}
                          {idioma.documentos && idioma.documentos.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Certificados:</p>
                              {idioma.documentos.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline mt-1"
                                >
                                  <FileDown size={12} />
                                  {doc.nombre}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                        {/* Documentos */}
                        {perfilCompleto.documentos && perfilCompleto.documentos.length > 0 && (
                          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <FileDown size={20} className="text-indigo-600" />
                              Documentos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {perfilCompleto.documentos.map((doc) => (
                                <a  
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-white p-3 rounded border hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <FileText size={18} className="text-indigo-600" />
                                  <span className="text-sm truncate">{doc.nombre}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                
                      {/* Footer */}
                      <div className="border-t p-4 bg-gray-50 flex justify-end">
                        <button
                          onClick={cerrarPerfilCompleto }
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
    </div>
  );
};

export default VerPostulaciones;
