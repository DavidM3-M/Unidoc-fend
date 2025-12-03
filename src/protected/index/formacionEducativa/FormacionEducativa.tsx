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

const FormacionEducativa = () => {
  const [estudios, setEstudios] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openPreEdit, setOpenPreEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [estudioSeleccionado, setEstudioSeleccionado] = useState<any | null>(
    null
  );

  const handleEstudioAgregado = () => {
    fetchDatos(); // vuelve a traer la lista actualizada
    setOpenAdd(false); // cierra el modal
  };

  //Función para cargar los datos desde el servidor o sesionStorage
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
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_DOCENTE
        }`,
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

  return (
    <>
      <div className="flex flex-col gap-4 h-full max-w-[400px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="font-bold text-xl">Formación educativa</h4>
          <div className="flex gap-1">
            <ButtonAgregar onClick={() => setOpenAdd(true)} />
            <ButtonPreEditar onClick={() => setOpenPreEdit(true)} />
          </div>
        </div>
        <div>
          {estudios.length === 0 ? (
            <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
          ) : (
            <ul className="flex flex-col">
              {estudios.map((item, index) => (
                <li className="flex flex-col sm:flex-row gap-6 border-b-[1px] border-gray-300 cursor-pointer hover:bg-gray-100 pt-4 pl-2" key={index}
                  onClick={() => {
                    setEstudioSeleccionado(item);
                    setOpenDetalle(true);
                  }}
                >
                  <AcademicIcono />
                  <div className="text-[#637887] ">
                    <p className="font-semibold text-[#121417]">
                      {item.tipo_estudio}
                    </p>
                    <p>{item.titulo_estudio}</p>
                    <p>{item.institucion}</p>
                    <p>{item.fecha_graduacion}</p>
                    <EstadoDocumento documentos={item.documentos_estudio} />

                  </div>
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
