import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { PencilIcon } from "../../../assets/icons/Iconos";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";

const PreAptitud = () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [aptitudes, setAptitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);

      // 1. Cargar desde caché primero
      const cached = sessionStorage.getItem("aptitudes");
      if (cached) {
        setAptitudes(JSON.parse(cached));
      }

      // 2. Obtener datos del servidor
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_APTITUDES_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];
      const response = await axiosInstance.get(endpoint);

      // 3. Actualizar estado y caché
      if (response.data?.aptitudes) {
        setAptitudes(response.data.aptitudes);
        sessionStorage.setItem(
          "aptitudes",
          JSON.stringify(response.data.aptitudes)
        );
      }
    } catch (error) {
      console.error("Error al obtener aptitudes:", error);
      // Fallback a caché si hay error
      const cached = sessionStorage.getItem("aptitudes");
      if (cached) {
        setAptitudes(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_APTITUDES_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_APTITUDES_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];

      await axiosInstance.delete(`${endpoint}/${id}`);
      // Actualizar estado y caché
      const nuevasAptitudes = aptitudes.filter((a) => a.id_aptitud !== id);
      setAptitudes(nuevasAptitudes);
      sessionStorage.setItem("aptitudes", JSON.stringify(nuevasAptitudes));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  useEffect(() => {
    // Cargar datos iniciales desde caché
    const cached = sessionStorage.getItem("aptitudes");
    if (cached) {
      setAptitudes(JSON.parse(cached));
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
    <DivForm >
      <div>
        {aptitudes.length === 0 ? (
          <p>No hay aptitudes registradas.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {aptitudes.map((item) => (
              <li
                key={item.id_aptitud}
                className="flex flex-col sm:flex-row gap-6  w-full border-b-2 border-gray-200 p-2 md:items-center "
              >
                <div className="flex flex-col w-full text-[#637887]">
                  <p className="font-semibold text-[#121417]">
                    {item.nombre_aptitud}
                  </p>
                  <p>{item.descripcion_aptitud}</p>
                </div>
                <div className="flex gap-4 items-end">
                  <Link
                    to={`/editar/aptitud/editar/${item.id_aptitud}`}
                    className="flex items-center justify-center w-10 h-10 bg-[#F0F2F5] rounded-lg text-[#121417] hover:bg-[#E0E4E8] transition duration-300 ease-in-out"
                  >
                    <PencilIcon />
                  </Link>
                  <EliminarBoton
                    id={item.id_aptitud}
                    onConfirmDelete={handleDelete}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DivForm>
  );
};

export default PreAptitud;
