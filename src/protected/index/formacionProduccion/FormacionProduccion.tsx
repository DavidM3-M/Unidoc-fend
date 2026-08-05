import axiosInstance from "../../../utils/axiosConfig";
import { useEffect, useState } from "react";
import EstadoDocumento from "../../../componentes/Estado";
import { BeakerIcons } from "../../../assets/icons/Iconos";
import { ChevronRight } from "lucide-react";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarProduccion from "../../agregar/AgregarProduccion";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import PreProduccion from "../../editar/produccion/pre-produccion";
import VerProduccion from "../../ver/VerProduccion";

const FormacionProduccion = () => {
  const [produccion, setProduccion] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [produccionSeleccionado, setProduccionSeleccionado] = useState<any | null>(null);

  const handleProduccionAgregada = () => {
    fetchDatos();
    setOpenAdd(false);
  };

  const fetchDatos = async () => {
    try {
      const cachedData = sessionStorage.getItem("producciones");
      if (cachedData) {
        setProduccion(JSON.parse(cachedData));
      }

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_DOCENTE,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);

      if (response.data?.producciones) {
        const producciones = response.data.producciones;
        setProduccion(producciones);
        sessionStorage.setItem("producciones", JSON.stringify(producciones));
      }
    } catch (error) {
      console.error("Error al cargar produccion:", error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  if (!produccion) {
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
        <h4 className="font-bold text-xl text-slate-900">Formación Producción</h4>
        <div className="flex gap-1">
          <ButtonAgregar onClick={() => setOpenAdd(true)} />
          <ButtonEditar onClick={() => setOpenEdit(true)} />
        </div>
      </div>

      {/* Listado */}
      <div>
        {produccion.length === 0 ? (
          <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
        ) : (
          <ul className="flex flex-col gap-3">
            {produccion.map((item, index) => (
              <li
                key={index}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer p-4"
                onClick={() => {
                  setProduccionSeleccionado(item);
                  setOpenDetalle(true);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icono con gradiente Gold institucional */}
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <BeakerIcons />
                  </div>

                  <div className="text-gray-500 w-full text-sm">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-bold text-gray-800 text-base">
                        {item.titulo}
                      </p>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>

                    <p className="font-medium text-gray-700">{item.rol}</p>
                    <p>{item.medio_divulgacion}</p>
                    <p>{item.numero_autores} autores</p>
                    <p className="text-gray-400 mb-2">{item.fecha_divulgacion}</p>

                    <div className="mt-1">
                      <EstadoDocumento documentos={item.documentos_produccion_academica} />
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
        title="Agregar Producción"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      >
        <AgregarProduccion onSuccess={handleProduccionAgregada} />
      </CustomDialog>

      {/* MODAL EDITAR */}
      <CustomDialog
        title="Editar Producción"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <PreProduccion onSuccess={fetchDatos} />
      </CustomDialog>

      {/* MODAL DETALLE */}
      <CustomDialog
        title="Detalles de producción académica"
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
      >
        <VerProduccion produccion={produccionSeleccionado} />
      </CustomDialog>
    </div>
  );
};

export default FormacionProduccion;