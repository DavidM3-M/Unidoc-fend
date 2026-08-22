import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import Cookies from "js-cookie";
import {
  EllipsisVerticalIcon,
  PlusIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import AptitudesCarga from "../../componentes/formularios/AptitudesCarga";
import { TooltipRazonPuntaje } from "../../componentes/formularios/puntaje";
import { TooltipEvaluacion } from "../../componentes/formularios/evaluacion";
import { BarraProgreso } from "../../componentes/formularios/BarraProgreso";
import CategoriasEscalafon from "../../componentes/formularios/CategoriasEscalafon";
import { RolesValidos } from "../../types/roles";
import { EvaluacionAsignada } from "../../types/evaluacionDocente";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AgregarAptitudes from "../agregar/AgregarAptitudes";
import EditarAptitud from "../editar/aptitud/pre-aptitud";
import CustomDialog from "../../componentes/CustomDialogForm";

/** Criterio del escalafon que el docente todavia no cumple, tal como lo devuelve el motor. */
type FaltanteEscalafon = {
  campo: string;
  mensaje: string;
  requerido?: string | number | null;
  actual?: string | number | null;
};

const InformacionPersonalDocente = () => {

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [openAdd, setOpenAdd] = useState(false); // modal para agregar aptitudes
  const [openEdit, setOpenEdit] = useState(false); // modal para editar aptitudes
  const [openCategorias, setOpenCategorias] = useState(false); // modal con las categorías del escalafón

  const [datos, setDatos] = useState<any>();
  const [municipio, setMunicipio] = useState<any>([]);
  const [aptitudes, setAptitudes] = useState<any[]>([]);
  const [evaluacion, setEvaluacion] = useState<EvaluacionAsignada | null>(null); // Evaluación asignada por Apoyo Profesoral
  const [puntaje, setPuntaje] = useState<string>("0.0"); // Estado para el puntaje
  const [categoria, setCategoria] = useState<string>(""); // Estado para la categoria segun el puntaje
  const [razonPuntaje, setRazonPuntaje] = useState<string>(""); // Por qué no alcanza una categoría superior
  const [faltantesPuntaje, setFaltantesPuntaje] = useState<Record<string, any[]>>({}); // Detalle por campo de lo que le falta por categoría
  const [categoriaProtegida, setCategoriaProtegida] = useState(false); // Conserva la categoría pese a que subió la evaluación mínima exigida

  /**
   * Requisitos de la siguiente categoría, tal como los devuelve el motor del escalafón.
   *
   * `faltantes_por_categoria` viene ordenado y solo trae los criterios que NO se cumplen, así
   * que la primera clave es la categoría inmediatamente superior. Si un criterio no aparece es
   * porque ya está cumplido, y entonces la barra se dibuja sin meta en vez de inventarse un
   * máximo que no corresponde a ninguna regla.
   */
  const [siguienteCategoria = "", faltantesSiguiente = []] =
    Object.entries(faltantesPuntaje)[0] ?? [];

  const metaDe = (campo: string): number | null => {
    const item = (faltantesSiguiente as FaltanteEscalafon[]).find(
      (f) => f?.campo === campo
    );
    const requerido = Number(item?.requerido);
    return Number.isFinite(requerido) ? requerido : null;
  };

  const handleApitudAgregada = () => {
    fetchAptitudes();
    setOpenAdd(false); // cierra el modal
  };
  // Obtener imagen de perfil
  const fetchProfileImage = async () => {
    try {
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      const documentos = response.data.fotoPerfil?.documentos_foto_perfil;

      if (documentos && documentos.length > 0) {
        const imageUrl = documentos[0].archivo_url;
        setProfileImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error al obtener la imagen de perfil:", error);
    }
  };

  // obtener datos del puntaje
  const fetchPuntaje = async () => {
    try {
      // 1. Verificar autenticación y rol
      const token = Cookies.get("token");
      if (!token) {
        return;
      }

      const decoded = jwtDecode<{ rol: string }>(token);
      if (decoded.rol !== "Docente") {
        // Cambia "docente" por el rol requerido
        console.log(
          `Usuario con rol ${decoded.rol} no requiere puntaje, omitiendo petición`
        );
        return;
      }

      // 3. Hacer la petición
      const response = await axiosInstance.get(
        import.meta.env.VITE_ENDPOINT_EVALUAR_PUNTAJE
      );
      // 4. Procesar respuesta
      if (response.data?.resultado) {
        setPuntaje(response.data.resultado.puntaje_total?.toFixed(1) || "0.0");
        setCategoria(response.data.resultado.categoria_lograda || "");
        setRazonPuntaje(response.data.resultado.razon || "");
        setFaltantesPuntaje(response.data.resultado.faltantes_por_categoria || {});
        setCategoriaProtegida(!!response.data.resultado.categoria_protegida);
      } else {
        setPuntaje("0.0");
        setCategoria("");
        setRazonPuntaje("");
        setFaltantesPuntaje({});
        setCategoriaProtegida(false);
      }
    } catch (error) {
      // 5. Manejo de errores específico
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          console.log("Acceso no autorizado para obtener puntaje");
        } else {
          console.error("Error al obtener el puntaje:", error.message);
          // Opcional: Mostrar feedback al usuario para errores no relacionados a permisos
          // toast.error("Error al cargar el puntaje");
        }
      } else {
        console.error("Error desconocido al obtener puntaje:", error);
      }

      // Establecer valores por defecto en caso de error
      setPuntaje("0.0");
      setCategoria("");
      setRazonPuntaje("");
      setFaltantesPuntaje({});
      setCategoriaProtegida(false);
    }
  };

  // Obtener datos del usuario
  const fetchDatos = async () => {
    try {
      const response = await axiosInstance.get(
        "/auth/obtener-usuario-autenticado"
      );

      const user = response.data.user;
      setDatos(user);

      if (user.municipio_id) {
        try {
          const responseMunicipio = await axiosInstance.get(
            `/ubicaciones/municipio/${user.municipio_id}`
          );
          setMunicipio(responseMunicipio.data);
        } catch (municipioError) {
          console.error("Error al obtener el municipio:");
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos del docente:", error);
    } finally {
    }
  };

  // Obtener aptitudes
  const fetchAptitudes = async () => {
    try {
      // 1. Cargar desde caché
      const cached = sessionStorage.getItem("aptitudes");
      if (cached) {
        setAptitudes(JSON.parse(cached));
      }

      // 2. Endpoints según rol
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      // 3. Llamada a la API
      const response = await axiosInstance.get(endpoint);

      // 4. Guardar en estado + caché si hay datos
      if (response.data?.aptitudes) {
        setAptitudes(response.data.aptitudes);
        sessionStorage.setItem(
          "aptitudes",
          JSON.stringify(response.data.aptitudes)
        );
      }
    } catch (error) {
      console.error("Error al obtener aptitudes:", error);

      // 5. Si falla la API, usar el caché (si existe)
      const cached = sessionStorage.getItem("aptitudes");
      if (cached) {
        setAptitudes(JSON.parse(cached));
      }
    }
  };

  // Obtener la evaluación asignada (solo lectura: la asigna Apoyo Profesoral)
  const fetchEvaluacion = async () => {
    try {
      // Verificar si el usuario es docente antes de hacer la petición
      const token = Cookies.get("token");
      if (!token) throw new Error("No autenticado");

      const decoded = jwtDecode<{ rol: string }>(token);
      if (decoded.rol !== "Docente") {
        return; // No hacer la petición si no es docente
      }

      const endpoint = import.meta.env.VITE_ENDPOINT_OBTENER_EVALUACIONES_DOCENTE;
      const response = await axiosInstance.get(endpoint);

      setEvaluacion(response.data.data ?? null);
    } catch (error) {
      // 404 = todavía no le han asignado evaluación; 403 = el rol no la consulta.
      // Ninguno de los dos es un fallo que valga la pena reportar.
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 404 || status === 403) {
        setEvaluacion(null);
        return;
      }

      console.error("Error al obtener la evaluación:", error);
    }
  };

  // Cargar datos al iniciar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchAptitudes(),
          fetchProfileImage(),
          fetchDatos(),
          fetchEvaluacion(),
          fetchPuntaje(),
        ]);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchData();
  }, []);


  if (!datos) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-[#1e3a5f] font-medium">
          Cargando datos personales...
        </p>
        <p className="text-[#6b7a8d] text-sm mt-2">
          Por favor espere un momento
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full rounded-md lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] m-auto relative">
        {/* ============================================================
            Split de identidad: quién eres a la izquierda, qué haces a la
            derecha. En pantallas estrechas el panel se apila encima.
            ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] bg-white rounded-xl overflow-hidden shadow-sm">

          {/* ---------------- Panel de identidad ---------------- */}
          <aside className="bg-gradient-to-b from-[#1e3a5f] to-[#152a45] p-8 flex flex-col items-start gap-1">
            <div className="size-20 rounded-full overflow-hidden border-[3px] border-[#c89b14] shadow-lg mb-4">
              <img
                className="w-full h-full object-cover"
                src={
                  profileImageUrl ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                alt="Foto de perfil"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                }}
              />
            </div>

            {/* line-clamp: los nombres completos con dos apellidos desbordaban la columna. */}
            <h3 className="text-white font-bold text-lg leading-snug break-words line-clamp-3">
              {`${datos.primer_nombre} ${datos?.segundo_nombre || ""} ${
                datos.primer_apellido
              } ${datos?.segundo_apellido || ""}`.replace(/\s+/g, " ").trim()}
            </h3>

            <p className="text-white/60 text-sm font-medium">
              {rol === "Docente" && categoria ? `Docente · ${categoria}` : rol}
            </p>

            <hr className="w-full border-white/15 my-5" />

            <div className="flex flex-col gap-4 w-full min-w-0">
              <div className="flex items-start gap-2.5 min-w-0">
                <EnvelopeIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c89b14]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Correo electrónico
                  </p>
                  <p className="text-sm text-white/90 break-all">{datos.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 min-w-0">
                <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c89b14]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Ubicación
                  </p>
                  <p className="text-sm text-white/90">
                    {[municipio.municipio_nombre, municipio.departamento_nombre]
                      .filter(Boolean)
                      .join(", ") || "Sin registrar"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ---------------- Panel accionable ---------------- */}
          <div className="p-6 sm:p-8 flex flex-col gap-8 min-w-0">

            <div className="flex items-center justify-between gap-4">
              <h2 className="font-bold text-2xl sm:text-3xl text-[#1e3a5f]">
                Hoja de vida
              </h2>

              {/* Secundario, no primario: antes competía en peso con "Agregar aptitudes". */}
              <button
                type="button"
                onClick={() => setOpenEdit(true)}
                aria-label="Editar aptitudes"
                className="flex-shrink-0 grid place-items-center size-10 rounded-lg border-2 border-[#1e3a5f]/20 text-[#1e3a5f] cursor-pointer transition-colors duration-200 hover:bg-[#f2f5f9] hover:border-[#1e3a5f]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8740e]"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>

            {/* ---- Aptitudes ---- */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7a8d]">
                  Aptitudes
                </h3>

                <button
                  type="button"
                  onClick={() => setOpenAdd(true)}
                  className="flex items-center gap-2 font-semibold text-sm bg-[#1e3a5f] border-2 border-[#1e3a5f] rounded-md px-3 py-1.5 text-white cursor-pointer transition-colors duration-200 hover:bg-[#152a45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8740e]"
                >
                  Agregar aptitudes
                  <PlusIcon className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {aptitudes.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {aptitudes.map((item, index) => (
                    <li key={index}>
                      <AptitudesCarga value={item.nombre_aptitud} />
                    </li>
                  ))}
                </ul>
              ) : (
                /* Sin esto la sección quedaba como un hueco mudo bajo su propio título. */
                <p className="rounded-lg border border-dashed border-[rgba(30,58,95,0.2)] bg-[#f7f8fa] px-4 py-3 text-sm text-[#9aa7b5]">
                  Todavía no has registrado aptitudes.
                </p>
              )}
            </section>

            {/* ---- Progreso en el escalafón ---- */}
            {rol === "Docente" && (
              <section className="flex flex-col gap-4 pt-6 border-t border-[rgba(30,58,95,0.09)]">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7a8d]">
                    Escalafón docente
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpenCategorias(true)}
                    className="text-xs font-semibold text-[#1e3a5f] underline decoration-[rgba(30,58,95,0.3)] hover:decoration-[#e8740e] cursor-pointer whitespace-nowrap"
                  >
                    Ver todas las categorías
                  </button>
                </div>

                {siguienteCategoria && (
                  <p className="-mt-1 text-sm text-[#6b7a8d]">
                    Siguiente categoría:{" "}
                    <span className="font-semibold text-[#1e3a5f]">
                      {siguienteCategoria}
                    </span>
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <BarraProgreso
                    etiqueta="Puntaje"
                    actual={Number(puntaje) || 0}
                    requerido={metaDe("puntaje")}
                    sufijo={metaDe("puntaje") === null ? "puntos" : ""}
                    detalle={
                      <TooltipRazonPuntaje
                        razon={razonPuntaje}
                        faltantes={faltantesPuntaje}
                        categoriaProtegida={categoriaProtegida}
                        onVerCategorias={() => setOpenCategorias(true)}
                      />
                    }
                  />

                  <BarraProgreso
                    etiqueta="Evaluación docente"
                    actual={
                      Number(evaluacion?.promedio_evaluacion_docente) || 0
                    }
                    requerido={metaDe("evaluacion") ?? 5}
                    detalle={<TooltipEvaluacion evaluacion={evaluacion} />}
                  />
                </div>
              </section>
            )}
          </div>
        </div>

        {/* MODAL AGREGAR */}
        <CustomDialog
          title="Agregar Aptitudes"
          open={openAdd}
          onClose={() => setOpenAdd(false)}
        >
          <AgregarAptitudes onSuccess={handleApitudAgregada} />
        </CustomDialog>

        {/* MODAL EDITAR */}
        <CustomDialog
          title="Editar Aptitudes"
          open={openEdit}
          onClose={() => setOpenEdit(false)}
        >
          <EditarAptitud onSuccess={fetchAptitudes} />
        </CustomDialog>

        {/* MODAL CATEGORÍAS DEL ESCALAFÓN */}
        <CustomDialog
          title="Categorías del escalafón docente"
          open={openCategorias}
          onClose={() => setOpenCategorias(false)}
          width="700px"
        >
          <CategoriasEscalafon categoriaActual={categoria} />
        </CustomDialog>
      </div>
    </>
  );
};

export default InformacionPersonalDocente;