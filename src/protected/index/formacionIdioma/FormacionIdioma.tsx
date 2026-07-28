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
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<any | null>(null);

  const handleIdiomaAgregado = () => {
    fetchDatos();
    setOpenAdd(false);
  };

  const fetchDatos = async () => {
    try {
      const cached = sessionStorage.getItem("idiomas");
      if (cached) {
        setIdiomas(JSON.parse(cached));
      }

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_DOCENTE,
<<<<<<< HEAD
=======
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_DOCENTE,
>>>>>>> 628d43043a4ce9a1d388f7e4ca35dad740613150
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);

      if (response.data?.idiomas) {
        setIdiomas(response.data.idiomas);
        sessionStorage.setItem("idiomas", JSON.stringify(response.data.idiomas));
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-bold text-xl text-slate-900">Formación Idioma</h4>
        <div className="flex gap-1">
          <ButtonAgregar onClick={() => setOpenAdd(true)} />
          <ButtonPreEditar onClick={() => setOpenPreEdit(true)} />
        </div>
      </div>

      {/* Listado */}
      <div>
        {idiomas.length === 0 ? (
          <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
        ) : (
          <ul className="flex flex-col gap-3">
            {idiomas.map((item, index) => (
              <li
                key={index}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer p-4"
                onClick={() => {
                  setIdiomaSeleccionado(item);
                  setOpenDetalle(true);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icono con gradiente Gold institucional */}
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <GlobeIcon />
                  </div>

                  <div className="text-gray-500 w-full text-sm">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-bold text-gray-800 text-base">
                        {item.idioma}
                      </p>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>

                    <p className="font-medium text-gray-700">{item.institucion_idioma}</p>
                    <p>{item.nivel}</p>

                    <div className="mt-1">
                      <EstadoDocumento documentos={item.documentos_idioma} />
                    </div>
                  </div>
                </div>

                {/* Línea animada inferior Gold institucional */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent group-hover:w-full transition-all duration-500" />
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