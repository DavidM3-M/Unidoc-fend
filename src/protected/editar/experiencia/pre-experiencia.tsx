import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EliminarBoton from "../../../componentes/EliminarBoton";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonEditar";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EditarExperiencia from "./EditarExperiencia";

type Props = {
  onSuccess: () => void;
};

const PreExperiencia = ({ onSuccess }: Props) => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedExperiencia, setSelectedExperiencia] = useState<any | null>(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      // Cargar desde el caché
      const cached = sessionStorage.getItem("experiencias");
      if (cached) {
        setExperiencias(JSON.parse(cached));
      }

      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_ASPIRANTE}`,
        Docente: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_DOCENTE}`,
      };

      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      if (response.data?.experiencias) {
        setExperiencias(response.data.experiencias);
        sessionStorage.setItem(
          "experiencias",
          JSON.stringify(response.data.experiencias)
        );
      }
    } catch (error) {
      console.error("Error al obtener experiencias:", error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_ELIMINAR_EXPERIENCIAS_ASPIRANTE}`,
        Docente: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_ENDPOINT_ELIMINAR_EXPERIENCIAS_DOCENTE}`,
      };

      const endpoint = ENDPOINTS[rol];

      await axiosInstance.delete(`${endpoint}/${id}`);

      const nuevasExperiencias = experiencias.filter((e) => e.id_experiencia !== id);
      setExperiencias(nuevasExperiencias);
      sessionStorage.setItem("experiencias", JSON.stringify(nuevasExperiencias));

      onSuccess();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // Abrir modal de edición
  const handleEdit = (exp: any) => {
    setSelectedExperiencia(exp);
    setOpenEdit(true);
  };

  useEffect(() => {
    const cached = sessionStorage.getItem("experiencias");
    if (cached) {
      setExperiencias(JSON.parse(cached));
    }
    fetchDatos();
  }, []);

  if (loading) {
    return <DivForm>Cargando...</DivForm>;
  }

  return (
    <>
      <DivForm>
        <div>
          {experiencias.length === 0 ? (
            <p>No hay experiencias registradas.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {experiencias.map((item) => (
                <li
                  key={item.id_experiencia}
                  className="flex flex-col sm:flex-row gap-6 w-full border-b-2 border-gray-200 p-2"
                >
                  <div className="flex flex-col w-full text-[#637887]">
                    <p className="font-semibold text-[#121417]">
                      {item.tipo_experiencia}
                    </p>
                    <p>Institución: {item.institucion_experiencia}</p>
                    <p>Cargo: {item.cargo}</p>
                    <p>
                      Desde: {item.fecha_inicio} - Hasta:{" "}
                      {item.fecha_finalizacion || "Actual"}
                    </p>
                  </div>

                  <div className="flex gap-4 items-end">
                    <ButtonEditar onClick={() => handleEdit(item)} />
                    <EliminarBoton
                      id={item.id_experiencia}
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
        title="Editar Experiencia"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <EditarExperiencia
          experiencia={selectedExperiencia}
          onSuccess={() => {
            fetchDatos(); // refresca la lista
            setOpenEdit(false);
            onSuccess(); 
          }}
        />
      </CustomDialog>
    </>
  );
};

export default PreExperiencia;
