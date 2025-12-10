import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EliminarBoton from "../../../componentes/EliminarBoton";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EditarIdioma from "./EditarIdioma";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonEditar";

type Props = {
  onSuccess: () => void;
};

const PreIdioma = ({ onSuccess }: Props) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedIdioma, setSelectedIdioma] = useState<any | null>(null);

  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [idiomas, setIdiomas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      // Cargar desde cache
      const cached = sessionStorage.getItem("idiomas");
      if (cached) {
        setIdiomas(JSON.parse(cached));
      }

      // Endpoints según rol
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_DOCENTE
        }`,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);

      if (response.data?.idiomas) {
        setIdiomas(response.data.idiomas);
        sessionStorage.setItem("idiomas", JSON.stringify(response.data.idiomas));
      }
    } catch (error) {
      console.error("Error al obtener idiomas:", error);

      const cached = sessionStorage.getItem("idiomas");
      if (cached) {
        setIdiomas(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  // ELIMINAR
  const handleDelete = async (id: number) => {
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_IDIOMAS_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_IDIOMAS_DOCENTE
        }`,
      };

      await axiosInstance.delete(`${ENDPOINTS[rol]}/${id}`);

      const nuevos = idiomas.filter((i) => i.id_idioma !== id);
      setIdiomas(nuevos);
      sessionStorage.setItem("idiomas", JSON.stringify(nuevos));

      onSuccess();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // EDITAR
  const handleEdit = (idioma: any) => {
    setSelectedIdioma(idioma);
    setOpenEdit(true);
  };

  // CARGAR INICIAL
  useEffect(() => {
    const cached = sessionStorage.getItem("idiomas");
    if (cached) {
      setIdiomas(JSON.parse(cached));
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
          {idiomas.length === 0 ? (
            <p>No hay idiomas registrados.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {idiomas.map((item) => (
                <li
                  key={item.id_idioma}
                  className="flex flex-col sm:flex-row gap-6 w-full border-b-2 border-gray-200 p-2 md:items-center"
                >
                  <div className="flex flex-col w-full text-[#637887]">
                    <p className="font-semibold text-[#121417]">
                      {item.idioma}
                    </p>
                    <p>Nivel: {item.nivel}</p>
                    <p>Institución: {item.institucion_idioma}</p>
                    <p>Fecha certificado: {item.fecha_certificado}</p>
                  </div>

                  <div className="flex gap-4 items-end">
                    <ButtonEditar onClick={() => handleEdit(item)} />

                    <EliminarBoton
                      id={item.id_idioma}
                      onConfirmDelete={handleDelete}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DivForm>

      {/* MODAL DE EDICIÓN */}
      <CustomDialog
        title="Editar Idioma"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <EditarIdioma
          idioma={selectedIdioma}
          onSuccess={() => {
            fetchDatos();
            setOpenEdit(false);
            onSuccess();
          }}
        />
      </CustomDialog>
    </>
  );
};

export default PreIdioma;
