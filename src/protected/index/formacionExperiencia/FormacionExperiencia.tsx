import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EstadoDocumento from "../../../componentes/Estado";
import { useObtenerAno } from "../../../hooks/TomarAno";
import { BriefIcon } from "../../../assets/icons/Iconos";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarExperiencia from "../../agregar/AgregarExperiencia";
import PreExperiencia from "../../editar/experiencia/pre-experiencia";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import VerExperiencia from "../../ver/VerExperiencia";
import { ChevronRight } from "lucide-react";

const FormacionExperiencia = () => {
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const { obtenerAno } = useObtenerAno();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);

  const [experienciaSeleccionada, setExperienciaSeleccionada] =
    useState<any | null>(null);

  // === Callback: al agregar una experiencia ===
  const handleExperienciaAgregada = () => {
    fetchDatos();
    setOpenAdd(false);
  };

  // === Función reutilizable para cargar datos ===
  const fetchDatos = async () => {
    try {
      // 1. Cargar desde sessionStorage primero
      const cached = sessionStorage.getItem("experiencias");
      if (cached) {
        setExperiencias(JSON.parse(cached));
      }

      // 2. Obtener token y rol
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      // 3. Endpoints por rol
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_DOCENTE,
<<<<<<< HEAD
=======
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_DOCENTE,
>>>>>>> 628d43043a4ce9a1d388f7e4ca35dad740613150
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);

      // 4. Actualizar estado + sessionStorage
      if (response.data?.experiencias) {
        setExperiencias(response.data.experiencias);
        sessionStorage.setItem(
          "experiencias",
          JSON.stringify(response.data.experiencias)
        );
      }
    } catch (error) {
      console.error("Error al cargar experiencias:", error);
      // Se mantiene el cache si existe
    }
  };

  // === cargar datos al montar componente ===
  useEffect(() => {
    fetchDatos();
  }, []);

  if (!experiencias) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full max-w-[400px]">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-bold text-xl text-slate-900">Experiencia Profesional</h4>
        <div className="flex gap-1">
          <ButtonAgregar onClick={() => setOpenAdd(true)} />
          <ButtonEditar onClick={() => setOpenEdit(true)} />
        </div>
      </div>

      {/* Listado */}
      <div>
        {experiencias.length === 0 ? (
          <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
        ) : (
          <ul className="flex flex-col gap-3">
            {experiencias.map((item, index) => (
              <li
                key={index}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer p-4"
                onClick={() => {
                  setExperienciaSeleccionada(item);
                  setOpenDetalle(true);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Contenedor del icono con gradiente Gold institucional */}
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <BriefIcon />
                  </div>

                  <div className="text-gray-500 w-full text-sm">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-bold text-gray-800 text-base">
                        {item.tipo_experiencia}
                      </p>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>

                    <p className="font-medium text-gray-700">{item.cargo}</p>
                    <p>{item.institucion_experiencia}</p>

                    <p className="text-gray-400 mb-2">
                      {obtenerAno(item.fecha_inicio)} - {" "}
                      {item.fecha_finalizacion
                        ? obtenerAno(item.fecha_finalizacion)
                        : "Actual"}
                    </p>

                    <div className="mt-1">
                      <EstadoDocumento documentos={item.documentos_experiencia} />
                    </div>
                  </div>
                </div>

                {/* Línea animada inferior con color Gold institucional */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent group-hover:w-full transition-all duration-500" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MODAL AGREGAR */}
      <CustomDialog
        title="Agregar Experiencia"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      >
        <AgregarExperiencia onSuccess={handleExperienciaAgregada} />
      </CustomDialog>

      {/* MODAL PRE-EDITAR */}
      <CustomDialog
        title="Editar Experiencia"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <PreExperiencia onSuccess={fetchDatos} />
      </CustomDialog>

      {/* MODAL DETALLE */}
      <CustomDialog
        title="Detalles de la Experiencia"
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
      >
        <VerExperiencia experiencia={experienciaSeleccionada} />
      </CustomDialog>
    </div>
  );
};

export default FormacionExperiencia;