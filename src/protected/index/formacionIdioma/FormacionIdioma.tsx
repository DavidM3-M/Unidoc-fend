import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EstadoDocumento from "../../../componentes/Estado";
import { GlobeIcon } from "../../../assets/icons/Iconos";
import { ChevronRight } from "lucide-react";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import ButtonPreEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarIdioma from "../../agregar/AgregarIdioma";
import PreIdioma from "../../editar/idioma/pre-idioma";
import VerIdioma from "../../ver/VerIdioma";

const FormacionIdioma = () => {
  const [idiomas, setIdiomas] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openPreEdit, setOpenPreEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<any | null>(
    null
  );

  const handleIdiomaAgregado = () => {
    fetchDatos(); // vuelve a traer la lista actualizada
    setOpenAdd(false); // cierra el modal
  };

  const fetchDatos = async () => {
    try {
      // 1. Cargar desde cache
      const cached = sessionStorage.getItem("idiomas");
      if (cached) {
        setIdiomas(JSON.parse(cached));
      }

      // 2. Obtener datos reales del servidor
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      if (response.data?.idiomas) {
        setIdiomas(response.data.idiomas);
        sessionStorage.setItem(
          "idiomas",
          JSON.stringify(response.data.idiomas)
        );
      }
    } catch (error) {
      console.error("Error al cargar idiomas:", error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full max-w-[400px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-bold text-xl">Formación idioma</h4>
        <div className="flex gap-1">
          <ButtonAgregar onClick={() => setOpenAdd(true)} />
          <ButtonPreEditar onClick={() => setOpenPreEdit(true)} />
        </div>
      </div>

      <div>
        {idiomas.length === 0 ? (
          <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
        ) : (
          <ul className="flex flex-col gap-3">
            {idiomas.map((item, index) => (
              <li
                key={index}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden border border-gray-100 cursor-pointer p-4"
                onClick={() => {
                  setIdiomaSeleccionado(item);
                  setOpenDetalle(true);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <GlobeIcon />
                  </div>
                  <div className="text-[#637887] w-full">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-[#121417]">{item.idioma}</p>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                    <p>{item.institucion_idioma}</p>
                    <p>{item.nivel}</p>
                    <EstadoDocumento documentos={item.documentos_idioma} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent group-hover:w-full transition-all duration-500" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MODAL AGREGAR */}
      <CustomDialog
        title="Agregar Idioma"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      >
        <AgregarIdioma onSuccess={handleIdiomaAgregado} />
      </CustomDialog>

      {/* MODAL PRE-EDITAR */}
      <CustomDialog
        title="Editar Idioma"
        open={openPreEdit}
        onClose={() => setOpenPreEdit(false)}
      >
        <PreIdioma onSuccess={fetchDatos} />
      </CustomDialog>

      {/* MODAL DETALLE */}
      <CustomDialog
        title="Detalles del Idioma"
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
      >
        <VerIdioma idiomaData={idiomaSeleccionado} />
      </CustomDialog>
    </div>
  );
};

export default FormacionIdioma;
