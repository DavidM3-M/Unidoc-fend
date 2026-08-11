import { useEffect, useState } from "react";
import { LabelText } from "../../componentes/formularios/LabelText";
import { Texto } from "../../componentes/formularios/Texto";
import axiosInstance from "../../utils/axiosConfig";
import Cookies from "js-cookie";
import {
  EllipsisVerticalIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AptitudesCarga from "../../componentes/formularios/AptitudesCarga";
import { Puntaje } from "../../componentes/formularios/puntaje";
import { Evaluacion } from "../../componentes/formularios/evaluacion";
import CategoriasEscalafon from "../../componentes/formularios/CategoriasEscalafon";
import { RolesValidos } from "../../types/roles";
import { EvaluacionAsignada } from "../../types/evaluacionDocente";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AgregarAptitudes from "../agregar/AgregarAptitudes";
import EditarAptitud from "../editar/aptitud/pre-aptitud";
import CustomDialog from "../../componentes/CustomDialogForm";

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
  const [umbralEvaluacion, setUmbralEvaluacion] = useState<number | null>(null); // Umbral vigente que configuró el Administrador
  const [categoriaProtegida, setCategoriaProtegida] = useState(false); // Conserva la categoría pese a que el umbral subió

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
        setUmbralEvaluacion(response.data.resultado.umbral_evaluacion ?? null);
        setCategoriaProtegida(!!response.data.resultado.categoria_protegida);
      } else {
        setPuntaje("0.0");
        setCategoria("");
        setRazonPuntaje("");
        setFaltantesPuntaje({});
        setUmbralEvaluacion(null);
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
      setUmbralEvaluacion(null);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 bg-white py-8 px-4 sm:py-12 sm:px-8 rounded-xl gap-7">
          <div className="flex flex-col col-span-full md:flex-row gap-y-2 justify-between">
            <h2 className="font-bold text-3xl text-[#1e3a5f]">Hoja de vida</h2>
          </div>

          <div className="grid items-center grid-cols-1 col-span-full gap-y-4">
            <h3 className="col-span-full font-semibold text-lg text-[#1e3a5f]">
              Datos personales
            </h3>

            <div className="flex flex-wrap items-center gap-4 min-w-0">
              <div className="flex-shrink-0 size-14 rounded-full overflow-hidden border-2 border-[#c89b14]">
                <img
                  className="w-full h-full object-cover"
                  src={
                    profileImageUrl ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  }
                  alt="Perfil"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                  }}
                />
              </div>
              <Texto
                className="break-words min-w-0"
                value={`${datos.primer_nombre} ${datos?.segundo_nombre || ""} ${
                  datos.primer_apellido
                } ${datos?.segundo_apellido || ""}`}
              />
            </div>

            {rol === "Docente" && (
              <div className="flex flex-col sm:flex-row sm:justify-start items-start sm:items-center gap-3 sm:gap-6">
                {/* Puntaje y evaluación (la evaluación la asigna Apoyo Profesoral) */}
                <Puntaje
                  value={puntaje}
                  razon={razonPuntaje}
                  faltantes={faltantesPuntaje}
                  umbral={umbralEvaluacion}
                  categoriaProtegida={categoriaProtegida}
                  onVerCategorias={() => setOpenCategorias(true)}
                />
                <Evaluacion evaluacion={evaluacion} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 col-span-full gap-x-8 gap-y-6 border-t-1 py-4 border-[rgba(30,58,95,0.09)]">
            <div>
              <LabelText value="Correo electrónico" />
              <Texto className="break-words text-[#2c3e50]" value={datos.email} />
            </div>
            <div>
              <LabelText value="Ubicación" />
              <Texto
                className="text-[#2c3e50]"
                value={`${municipio.municipio_nombre || ""}, ${
                  municipio.departamento_nombre || ""
                }`}
              />
            </div>
            {rol === "Docente" && (
              <div>
                <LabelText value="Categoría lograda" />
                <Texto className="text-[#2c3e50]" value={categoria || "Sin categoría"} />
              </div>
            )}
          </div>

          <div className="grid col-span-full gap-y-6 border-t-1 py-4 border-[rgba(30,58,95,0.09)]">
            <div className="flex col-span-full items-center justify-between">
              <div className="flex items-center justify-around gap-4">
                <button onClick={() => setOpenAdd(true)}>
                  <p className="flex items-center font-semibold gap-2 bg-[#1e3a5f] border-2 border-[#1e3a5f] rounded-md px-2 py-1 text-white transition-all duration-300 ease-in-out cursor-pointer">
                    Agregar aptitudes
                    <span>
                      <PlusIcon className="w-5 h-5 stroke-3" />
                    </span>
                  </p>
                </button>
              </div>
              <div className="flex items-center justify-around gap-4">
                <button onClick={() => setOpenEdit(true)}>
                  <p className="flex items-center font-semibold gap-2 bg-[#1e3a5f] border-2 border-[#1e3a5f] rounded-md px-2 py-1 text-white transition-all duration-300 ease-in-out">
                    <span>
                      <EllipsisVerticalIcon className="w-5 h-5 stroke-3 cursor-pointer" />
                    </span>
                  </p>
                </button>
              </div>
            </div>

            <div className="col-span-full">
              <ul className="flex flex-wrap gap-2">
                {aptitudes.map((item, index) => (
                  <li key={index}>
                    <AptitudesCarga value={item.nombre_aptitud} />
                  </li>
                ))}
              </ul>
            </div>
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