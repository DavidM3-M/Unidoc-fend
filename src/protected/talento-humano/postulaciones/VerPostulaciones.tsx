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
import { User, FileText, CheckCircle, XCircle, Mail, Phone, Briefcase, GraduationCap, Award, FileDown, X, Loader2 } from "lucide-react";

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

// Tipado para perfil detallado (similar a rectoría)
interface AspiranteDetallado {
  id: number;
  datos_personales: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    tipo_identificacion?: string;
    numero_identificacion: string;
    genero?: string;
    fecha_nacimiento?: string;
    estado_civil?: string;
    email?: string;
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
  };
  eps?: { nombre_eps?: string };
  rut?: { numero_rut?: string };
  idiomas?: Array<{ idioma: string; nivel: string }>;
  experiencias?: Array<{ cargo: string; empresa: string; fecha_inicio: string; fecha_fin?: string; descripcion?: string }>;
  estudios?: Array<{ titulo: string; institucion: string; fecha_inicio: string; fecha_fin?: string; nivel_educativo: string }>;
  produccion_academica?: Array<{ titulo: string; tipo: string; fecha: string }>;
  aptitudes?: Array<{ nombre: string }>;
  postulaciones?: Array<{ convocatoriaPostulacion?: { titulo: string } }>;
  documentos?: Array<{ id: number; nombre: string; url: string; tipo: string }>;
  avales?: {
    rectoria: { estado?: string };
    vicerrectoria: { estado?: string };
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
  // Filtro por convocatoria (id)
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  // (convocatoriaSearch removed — not used)
  // Búsqueda por nombre de postulante
  const [nameFilter, setNameFilter] = useState("");
  // Filtro por rango de fecha (fecha_postulacion)
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  // Ordenamiento por fecha: 'asc' | 'desc' | null
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  // Estado para manejar el indicador de carga
  const [loading, setLoading] = useState(true);
  // Estados para mostrar perfil completo
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
        (c: Contratacion) => c.user_id
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

  // Función para obtener y mostrar el perfil completo del usuario
  const verPerfilCompleto = async (userId: number) => {
    setLoadingPerfil(true);
    try {
      // Intento principal: endpoint admin (puede devolver 403 si el rol no tiene permiso)
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}`);
      const aspirante = response.data.aspirante ?? response.data?.data ?? response.data;
      // Si la respuesta parece vacía o con error de permisos, intentamos endpoints alternos
      if (!aspirante) {
        throw { response: { status: 404 } };
      }
      setPerfilCompleto(aspirante);
      setMostrarPerfilCompleto(true);
      setLoadingPerfil(false);
      return;
    } catch (err: unknown) {
      // Si fue un 403, intentar endpoint de talento humano alternativo
      let status: number | undefined;
      if (axios.isAxiosError(err) && err.response) {
        status = err.response.status;
      }

      if (status === 403) {
        try {
          const altResp = await axiosInstance.get(`/talentoHumano/obtener-aspirante/${userId}`);
          const aspiranteAlt = altResp.data.aspirante ?? altResp.data?.data ?? altResp.data;
          if (aspiranteAlt) {
            setPerfilCompleto(aspiranteAlt);
            setMostrarPerfilCompleto(true);
            setLoadingPerfil(false);
            return;
          }
        } catch (err2: unknown) {
          console.warn('Intento alternativo talentoHumano falló', err2);
        }
      }

      // Último intento genérico: ruta /talentoHumano/aspirantes/:id
      try {
        const alt2 = await axiosInstance.get(`/talentoHumano/aspirantes/${userId}`);
        const aspirante2 = alt2.data.aspirante ?? alt2.data?.data ?? alt2.data;
        if (aspirante2) {
          setPerfilCompleto(aspirante2);
          setMostrarPerfilCompleto(true);
          setLoadingPerfil(false);
          return;
        }
      } catch (err3: unknown) {
        console.warn('Intento alternativo 2 falló', err3);
      }

      console.error('Error al obtener perfil completo:', err);
      if (status === 403) {
        toast.error('No tiene permisos para ver este perfil (403)');
      } else {
        toast.error('Error al cargar el perfil del aspirante');
      }
    } finally {
      setLoadingPerfil(false);
    }
  };

  const cerrarPerfilCompleto = () => {
    setMostrarPerfilCompleto(false);
    setPerfilCompleto(null);
  };

  // Descargar hoja de vida desde endpoint de aspirante (usado en modal)
  const handleDescargarHojaAspirante = async (userId: number) => {
    try {
      setLoadingPerfil(true);
      // ruta que usa admin/aspirantes para perfiles completos
      const response = await axiosInstance.get(`/admin/aspirantes/${userId}/hoja-vida-pdf`, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, '_blank');
      toast.success('Hoja de vida abierta correctamente');
    } catch (error) {
      console.error('Error al descargar hoja de vida:', error);
      toast.error('Error al cargar la hoja de vida');
    } finally {
      setLoadingPerfil(false);
    }
  };

  // Exportar datos (filtrados) a CSV
  const exportToCSV = (rows: Postulaciones[]) => {
    if (!rows || rows.length === 0) {
      toast.info('No hay datos para exportar');
      return;
    }

    const header = ['Convocatoria','Estado','Identificación','Postulante','Fecha Postulación','User ID','Convocatoria ID'];
    const csvRows = [header.join(',')];

    rows.forEach(r => {
      const nombre = `${r.usuario_postulacion.primer_nombre} ${r.usuario_postulacion.primer_apellido}`.replace(/,/g,'');
      const conv = (r.convocatoria_postulacion && r.convocatoria_postulacion.nombre_convocatoria) ? r.convocatoria_postulacion.nombre_convocatoria.replace(/,/g,'') : '';
      const line = [conv, r.estado_postulacion, r.usuario_postulacion.numero_identificacion, nombre, r.fecha_postulacion, r.user_id, r.convocatoria_id];
      csvRows.push(line.map(v => `"${v}"`).join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `postulaciones_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
                className="border border-gray-300 bg-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              {/* Botón para visualizar la hoja de vida */}
              <button
                className="inline-flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-1 rounded-md shadow-sm text-sm"
                onClick={() =>
                  handleVerHojaVida(
                    row.original.convocatoria_id,
                    row.original.user_id
                  )
                }
                aria-label="Ver hoja de vida"
              >
                <FileText size={14} />
                <span>Hoja de Vida</span>
              </button>

              {/* Botón para ver perfil completo (similar a Rectoría/Vicerrectoría) */}
              <div className="ml-1">
                <button
                  onClick={() => verPerfilCompleto(row.original.user_id)}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 shadow text-sm"
                  aria-label="Ver perfil"
                >
                  <User size={14} />
                  <span>Ver perfil</span>
                </button>
              </div>

              {/* Botón para contratar o ver contrato */}
              {row.original.estado_postulacion === "Aceptada" &&
                (yaContratado ? (
                  <Link
                    to={`/talento-humano/contrataciones/usuario/${row.original.user_id}`}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 shadow text-sm"
                  >
                    Ver Contrato
                  </Link>
                ) : (
                  <Link
                    to={`/talento-humano/contrataciones/contratacion/${row.original.user_id}`}
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 shadow text-sm"
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

  // Lista única de convocatorias extraídas de las postulaciones (id, nombre, count)
  const convocatorias = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; count: number }>();
    postulaciones.forEach((p) => {
      const id = p.convocatoria_id;
      const nombre = p.convocatoria_postulacion?.nombre_convocatoria || `Convocatoria ${id}`;
      if (map.has(id)) {
        map.get(id)!.count += 1;
      } else {
        map.set(id, { id, nombre, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [postulaciones]);

  // convocatoriasFiltradas not needed — use `convocatorias` directly

  // Datos filtrados por convocatoria seleccionada
  const datosFiltrados = useMemo(() => {
    let data = postulaciones;
    if (selectedConvocatoriaId) {
      data = data.filter((p) => p.convocatoria_id === selectedConvocatoriaId);
    }
    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      data = data.filter((p) => {
        const nombre = `${p.usuario_postulacion.primer_nombre} ${p.usuario_postulacion.primer_apellido}`.toLowerCase();
        return nombre.includes(q);
      });
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      data = data.filter((p) => new Date(p.fecha_postulacion) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      data = data.filter((p) => new Date(p.fecha_postulacion) <= to);
    }
    // Ordenar por fecha si se especificó
    if (sortOrder) {
      data = data.slice().sort((a, b) => {
        const da = new Date(a.fecha_postulacion).getTime();
        const db = new Date(b.fecha_postulacion).getTime();
        return sortOrder === 'asc' ? da - db : db - da;
      });
    }

    return data;
  }, [postulaciones, selectedConvocatoriaId]);

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
      {/* Controles: desplegable de convocatorias + búsqueda por nombre + filtro por fechas */}
      <div className="w-full mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-sm font-semibold text-gray-700">Convocatoria</label>
          <select
            value={selectedConvocatoriaId ?? ""}
            onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
            className="w-full mt-1 p-2 border rounded-lg bg-white"
          >
            <option value="">Todas</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} ({c.count})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Buscar por nombre</label>
          <InputSearch
            type="text"
            placeholder="Nombre del postulante..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full mt-1"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="text-sm font-semibold text-gray-700">Desde</label>
            <input type="date" className="w-full mt-1 p-2 border rounded-lg" value={dateFrom ?? ""} onChange={(e) => setDateFrom(e.target.value || null)} />
          </div>
          <div className="w-1/2">
            <label className="text-sm font-semibold text-gray-700">Hasta</label>
            <input type="date" className="w-full mt-1 p-2 border rounded-lg" value={dateTo ?? ""} onChange={(e) => setDateTo(e.target.value || null)} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3 w-full">
          <InputSearch
            type="text"
            placeholder="Buscar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
              className="px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-800"
              title="Ordenar por fecha (clic alterna asc/desc/ninguno)"
            >
              {sortOrder === 'asc' ? 'Fecha ↑' : sortOrder === 'desc' ? 'Fecha ↓' : 'Ordenar Fecha'}
            </button>
            <button
              onClick={() => exportToCSV(datosFiltrados)}
              className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
              title="Exportar resultados filtrados"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={datosFiltrados} // Datos de la tabla (filtrados por convocatoria)
        columns={columns} // Columnas de la tabla
        globalFilter={globalFilter} // Filtro global
        loading={loading} // Estado de carga
      />

      {/* Modal de Perfil Completo */}
      {mostrarPerfilCompleto && perfilCompleto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
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
                      {perfilCompleto.datos_personales.primer_nombre} {perfilCompleto.datos_personales.segundo_nombre || ''} {perfilCompleto.datos_personales.primer_apellido} {perfilCompleto.datos_personales.segundo_apellido || ''}
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

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDescargarHojaAspirante(perfilCompleto.id)}
                  disabled={loadingPerfil}
                  className={`bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${loadingPerfil ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-50'}`}
                >
                  {loadingPerfil ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Descargar Hoja de Vida
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Info Adicional</h3>
                  <div className="space-y-2 text-sm">
                    {perfilCompleto.eps?.nombre_eps && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-gray-600">EPS:</span>
                        <span>{perfilCompleto.eps.nombre_eps}</span>
                      </div>
                    )}
                    {perfilCompleto.rut?.numero_rut && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-semibold text-gray-600">RUT:</span>
                        <span>{perfilCompleto.rut.numero_rut}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Award size={20} className="text-indigo-600" />
                    Avales
                  </h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded ${perfilCompleto.avales?.rectoria?.estado ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <span className="font-semibold text-sm">Rectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${perfilCompleto.avales?.rectoria?.estado ? 'text-green-700' : 'text-orange-700'}`}>
                        {perfilCompleto.avales?.rectoria?.estado ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${perfilCompleto.avales?.vicerrectoria?.estado ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="font-semibold text-sm">Vicerrectoría</span>
                      <span className={`text-sm flex items-center gap-1 ${perfilCompleto.avales?.vicerrectoria?.estado ? 'text-green-700' : 'text-gray-600'}`}>
                        {perfilCompleto.avales?.vicerrectoria?.estado ? (<><CheckCircle size={16} /> Aprobado</>) : (<><XCircle size={16} /> Pendiente</>) }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                        <p className="text-xs text-gray-500 mt-1">{est.fecha_inicio} - {est.fecha_fin || 'En curso'}</p>
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
                      <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded border hover:bg-gray-50 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" />
                        <span className="text-sm truncate">{doc.nombre}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4 bg-gray-50 flex justify-end">
              <button onClick={cerrarPerfilCompleto} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerPostulaciones;
