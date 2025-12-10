import axiosInstance from "../../../utils/axiosConfig";
import { useEffect, useState } from "react";
import EstadoDocumento from "../../../componentes/Estado";
import { BeakerIcons } from "../../../assets/icons/Iconos";
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
  const [produccionSeleccionado, setProduccionSeleccionado] = useState<any | null>(
    null
  );

  const handleProduccionAgregada = () => {
    fetchDatos();
    setOpenAdd(false);
  };

  //Función para cargar los datos desde el servidor o sessionStorage
  const fetchDatos = async () => {
    try {
      // 1. Intentar cargar desde sessionStorage primero
      const cachedData = sessionStorage.getItem("producciones");
      if (cachedData) {
        setProduccion(JSON.parse(cachedData));
      }

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];

      const response = await axiosInstance.get(endpoint);

      // 3. Actualizar estado y sessionStorage
      if (response.data?.producciones) {
        const producciones = response.data.producciones;
        setProduccion(producciones);
        sessionStorage.setItem("producciones", JSON.stringify(producciones));
      }
    } catch (error) {
      console.error("Error al cargar produccion:", error);
      // Si hay error, se mantienen los datos de cache (si existían)
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  if (!produccion) {
    return (
      <div className="flex justify-center items-center h-full">Cargando...</div>
    );
  }
  console.log("produccion", produccion);
  return (
    <>
      <div className="flex flex-col gap-4 h-full max-w-[400px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="font-bold text-xl">Formación Producción</h4>
          <div className="flex gap-1">
            <ButtonAgregar onClick={() => setOpenAdd(true)} />
            <ButtonEditar onClick={() => setOpenEdit(true)} />
          </div>
        </div>
        <div>
          {produccion.length === 0 ? (
            <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
          ) : (
            <ul className="flex flex-col">
              {produccion.map((item, index) => (
                <li
                  className="flex flex-col sm:flex-row gap-6 border-b-[1px] border-gray-300 cursor-pointer hover:bg-gray-100 pt-4 pl-2"
                  key={index}
                  onClick={() => {
                    setProduccionSeleccionado(item);
                    setOpenDetalle(true);
                  }}
                >
                  <BeakerIcons />
                  <div className="text-[#637887]">
                    <p className="font-semibold text-[#121417]">
                      {item.titulo}
                    </p>
                    <p>{item.rol}</p>
                    <p>{item.medio_divulgacion}</p>
                    <p>{item.numero_autores} autores</p>
                    <p>{item.fecha_divulgacion}</p>
                    <EstadoDocumento
                      documentos={item.documentos_produccion_academica}
                    />
                  </div>
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

        <CustomDialog
          title="Detalles de producción académica"
          open={openDetalle}
          onClose={() => setOpenDetalle(false)}
        >
          <VerProduccion produccion={produccionSeleccionado} />
        </CustomDialog>
      </div>
    </>
  );
};
export default FormacionProduccion;
