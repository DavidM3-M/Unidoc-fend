import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EstadoDocumento from "../../../componentes/Estado";
import { AcademicIcono } from "../../../assets/icons/Iconos";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarEstudio from "../../agregar/AgregarEstudio";
import ButtonPreEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import PreEstudio from "../../editar/estudio/pre-estudio";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import VerEstudio from "../../ver/VerEstudio";
import { ChevronRight } from "lucide-react";

const FormacionEducativa = () => {
  const [estudios, setEstudios] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openPreEdit, setOpenPreEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [estudioSeleccionado, setEstudioSeleccionado] = useState<any | null>(null);

  const handleEstudioAgregado = () => {
    fetchDatos(); // vuelve a traer la lista actualizada
    setOpenAdd(false); // cierra el modal
  };

  // Función para cargar los datos desde el servidor o sesionStorage
  const fetchDatos = async () => {
    try {
      // 1. Intentar cargar desde sesionStorage primero
      const cached = sessionStorage.getItem("estudios");
      if (cached) {
        setEstudios(JSON.parse(cached));
      }

      // 2. Hacer petición al servidor dependiendo del rol
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);

      const rol = decoded.rol;
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];

      const response = await axiosInstance.get(endpoint);

      // 3. Actualizar estado y sesionStorage
      if (response.data?.estudios) {
        setEstudios(response.data.estudios);
        sessionStorage.setItem(
          "estudios",
          JSON.stringify(response.data.estudios)
        );
      }
    } catch (error) {
      console.error("Error al cargar estudios:", error);
      // Si hay error, se mantienen los datos de cache (si existían)
    }
  };

  // Llamar la función cuando el componente se monta
  useEffect(() => {
    fetchDatos();
  }, []);
  console.log("estudios", estudios);

  return (
    <>
      <div className="flex flex-col gap-4 h-full max-w-[400px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="font-bold text-xl text-slate-900">Formación educativa</h4>
          <div className="flex gap-1">
            <ButtonAgregar onClick={() => setOpenAdd(true)} />
            <ButtonPreEditar onClick={() => setOpenPreEdit(true)} />
          </div>
        </div>
        
        <div>
          {estudios.length === 0 ? (
            <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
          ) : (
            <ul className="flex flex-col gap-3">
              {estudios.map((item, index) => (
                <li
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer p-4"
                  key={index}
                  onClick={() => {
                    setEstudioSeleccionado(item);
                    setOpenDetalle(true);
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Contenedor del icono con gradiente institucional */}
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <AcademicIcono />
                    </div>

                    <div className="text-gray-500 w-full text-sm">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-bold text-gray-800 text-base">
                          {item.tipo_estudio}
                        </p>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>

                      <p className="font-medium text-gray-700">{item.titulo_estudio}</p>
                      <p>{item.institucion}</p>
                      <p className="text-gray-400 mb-2">{item.fecha_graduacion}</p>
                      
                      <div className="mt-1">
                        <EstadoDocumento documentos={item.documentos_estudio} />
                      </div>
                    </div>
                  </div>

                  {/* Línea animada inferior con color naranja institucional */}
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent group-hover:w-full transition-all duration-500" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* MODAL AGREGAR */}
        <CustomDialog
          title="Agregar Estudios"
          open={openAdd}
          onClose={() => setOpenAdd(false)}
        >
          <AgregarEstudio onSuccess={handleEstudioAgregado} />
        </CustomDialog>

        {/* MODAL PRE-EDITAR */}
        <CustomDialog
          title="Editar Estudios"
          open={openPreEdit}
          onClose={() => setOpenPreEdit(false)}
        >
          <PreEstudio onSuccess={fetchDatos} />
        </CustomDialog>

        {/* MODAL VER DETALLE */}
        <CustomDialog
          title="Detalles del Estudio"
          open={openDetalle}
          onClose={() => setOpenDetalle(false)}
        >
          <VerEstudio estudio={estudioSeleccionado} />
        </CustomDialog>
      </div>
    </>
  );
};

export default FormacionEducativa;