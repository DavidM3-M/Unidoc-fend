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
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_DOCENTE
        }`,
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
      <div className="flex justify-center items-center h-full">Cargando...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full max-w-[400px]">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-bold text-xl">Experiencia Profesional</h4>
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
          <ul className="flex flex-col">
            {experiencias.map((item, index) => (
              <li
                key={index}
                className="flex flex-col sm:flex-row gap-6 border-b-[1px] border-gray-300 cursor-pointer hover:bg-gray-100 pt-4 pl-2"
                onClick={() => {
                  setExperienciaSeleccionada(item);
                  setOpenDetalle(true);
                }}
              >
                <BriefIcon />
                <div className="text-[#637887]">
                  <p className="font-semibold text-[#121417]">
                    {item.tipo_experiencia}
                  </p>
                  <p>{item.cargo}</p>
                  <p>{item.institucion_experiencia}</p>

                  <p>
                    {obtenerAno(item.fecha_inicio)} /{" "}
                    {item.fecha_finalizacion
                      ? obtenerAno(item.fecha_finalizacion)
                      : "Actual"}
                  </p>

                  <EstadoDocumento documentos={item.documentos_experiencia} />
                </div>
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
