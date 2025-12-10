import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EliminarBoton from "../../../componentes/EliminarBoton";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonEditar";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EditarEstudio from "./EditarEstudio";

type Props = {
  onSuccess: () => void;
};

const PreEstudio = ({ onSuccess }: Props) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEstudio, setSelectedEstudio] = useState<any | null>(null);

  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;
  const [estudios, setEstudios] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      // Cargar desde sessionStorage si existe
      const cached = sessionStorage.getItem("estudios");
      if (cached) {
        setEstudios(JSON.parse(cached));
      }

      // Obtener datos del servidor
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

      // Actualizar estado y sessionStorage
      if (response.data?.estudios) {
        setEstudios(response.data.estudios);
        sessionStorage.setItem(
          "estudios",
          JSON.stringify(response.data.estudios)
        );
      }
    } catch (error) {
      console.error("Error al obtener estudios:", error);
    } finally {
      setLoading(false);
    }
  };
  // Función para eliminar un estudio
  const handleDelete = async (id: number) => {
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_ESTUDIOS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_ESTUDIOS_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];
      await axiosInstance.delete(`${endpoint}/${id}`);
      // Actualizar estado y sessionStorage
      const nuevosEstudios = estudios.filter((e) => e.id_estudio !== id);
      setEstudios(nuevosEstudios);
      sessionStorage.setItem("estudios", JSON.stringify(nuevosEstudios));

      onSuccess();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  //Función para abrir el modal de edición
  const handleEdit = (estudio: any) => {
    setSelectedEstudio(estudio);
    setOpenEdit(true);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    // Cargar datos iniciales desde cache para mejor UX
    const cached = sessionStorage.getItem("estudios");
    if (cached) {
      setEstudios(JSON.parse(cached));
    }
    fetchDatos();
  }, []);

  if (loading) {
    return (
      <DivForm>
        Cargando...
      </DivForm>
    );
  }

  return (
    <>
      <DivForm>
        <div>
          {estudios.length === 0 ? (
            <p>Aún no hay estudios agregados</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {estudios.map((item) => (
                <li
                  key={item.id_estudio}
                  className="flex flex-col sm:flex-row gap-6  w-full border-b-2 border-gray-200 p-2 md:items-center "
                >
                  <div className="flex flex-col w-full text-[#637887]">
                    <p className="font-semibold text-[#121417]">
                      {item.tipo_estudio}
                    </p>
                    <p>{item.titulo_estudio}</p>
                    <p>{item.institucion}</p>
                    <p>{item.fecha_graduacion}</p>
                  </div>
                  <div className="flex gap-4 items-end">
                    <ButtonEditar onClick={() => handleEdit(item)} />
                    <EliminarBoton
                      id={item.id_estudio}
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
        title="Editar Estudio"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <EditarEstudio
          estudio={selectedEstudio}
          onSuccess={() => {
            fetchDatos(); // refresca la lista de estudios
            setOpenEdit(false); // opcional: cierra el modal tras editar
            onSuccess(); // para notificar al padre si lo necesitas
          }}
        />
      </CustomDialog>
    </>
  );
};

export default PreEstudio;
