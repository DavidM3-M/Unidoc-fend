import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EliminarBoton from "../../../componentes/EliminarBoton";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonEditar";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EditarProduccion from "./EditarProduccion";

type Props = {
  onSuccess: () => void;
};

const PreProduccion = ({ onSuccess }: Props) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduccion, setSelectedProduccion] = useState<any | null>(
    null
  );

  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [producciones, setProducciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      const cached = sessionStorage.getItem("producciones");
      if (cached) setProducciones(JSON.parse(cached));

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

      if (response.data?.producciones) {
        setProducciones(response.data.producciones);
        sessionStorage.setItem(
          "producciones",
          JSON.stringify(response.data.producciones)
        );
      }
    } catch (error) {
      console.error("Error al obtener producciones:", error);
      const cached = sessionStorage.getItem("producciones");
      if (cached) setProducciones(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_PRODUCCIONES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_PRODUCCIONES_DOCENTE
        }`,
      };

      const endpoint = ENDPOINTS[rol];

      await axiosInstance.delete(`${endpoint}/${id}`);

      const nuevas = producciones.filter(
        (p) => p.id_produccion_academica !== id
      );

      setProducciones(nuevas);
      sessionStorage.setItem("producciones", JSON.stringify(nuevas));

      onSuccess();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleEdit = (produccion: any) => {
    setSelectedProduccion(produccion);
    setOpenEdit(true);
  };

  useEffect(() => {
    const cached = sessionStorage.getItem("producciones");
    if (cached) setProducciones(JSON.parse(cached));

    fetchDatos();
  }, []);

  if (loading) {
    return (
      <DivForm className="flex flex-col gap-4 h-full w-[600px] bg-white rounded-3xl p-8 min-h-[600px]">
        Cargando...
      </DivForm>
    );
  }

  return (
    <>
      <DivForm className="flex flex-col gap-4 h-full sm:w-[600px] bg-white rounded-3xl p-8">
        <div>
          {producciones.length === 0 ? (
            <p>No hay producciones registradas.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {producciones.map((item) => (
                <li
                  key={item.id_produccion_academica}
                  className="flex flex-col sm:flex-row gap-6  w-full border-b-2 border-gray-200 p-2"
                >
                  <div className="flex flex-col w-full text-[#637887]">
                    <p className="font-semibold text-[#121417]">
                      {item.titulo}
                    </p>
                    <p className="font-semibold text-[#121417]">
                      {item.nombre_producto_academico}
                    </p>
                    <p className="font-semibold text-[#121417]">
                      {item.nombre_ambito_divulgacion}
                    </p>
                    <p>{item.rol}</p>
                    <p>{item.medio_divulgacion}</p>
                    <p>{item.numero_autores} autores</p>
                    <p>{item.fecha_divulgacion}</p>
                  </div>

                  <div className="flex gap-4 items-end">
                    <ButtonEditar onClick={() => handleEdit(item)} />
                    <EliminarBoton
                      id={item.id_produccion_academica}
                      onConfirmDelete={handleDelete}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DivForm>

      {/* MODAL EDITAR */}
      <CustomDialog
        title="Editar Producción"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <EditarProduccion
          produccion={selectedProduccion}
          onSuccess={() => {
            fetchDatos(); // Refrescar lista
            setOpenEdit(false); // Cerrar modal
            onSuccess(); // Avisar al padre
          }}
        />
      </CustomDialog>
    </>
  );
};

export default PreProduccion;
