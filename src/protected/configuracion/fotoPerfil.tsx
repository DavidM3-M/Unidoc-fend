import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import axiosInstance from "../../utils/axiosConfig";
import axios from "axios";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import InputErrors from "../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import { RolesValidos } from "../../types/roles";
import { jwtDecode } from "jwt-decode";

type Inputs = {
  archivo: FileList;
};

const FotoPerfil = () => {
  const token = Cookies.get("token");
  // Sin token válido: redirigir al login en lugar de lanzar excepción no capturada
  if (!token) {
    window.location.replace("/");
    return null;
  }
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const archivoWatch = watch("archivo");

  // Cargar y manejar imágenes
  useEffect(() => {
    const loadProfileImage = async () => {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];
      try {
        const { data } = await axiosInstance.get(endpoint);

        const imageUrl =
          data?.fotoPerfil?.documentos_foto_perfil?.[0]?.archivo_url;
        if (imageUrl) {
          setCurrentProfileImage(imageUrl);
          setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error("Error al cargar foto:", error);
      }
    };

    loadProfileImage();
  }, []);

  useEffect(() => {
    if (archivoWatch?.[0]) {
      const reader = new FileReader();
      reader.onload = (e) =>
        e.target?.result && setProfileImage(e.target.result as string);
      reader.readAsDataURL(archivoWatch[0]);
    }
  }, [archivoWatch]);

  // Manejo de formulario
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("archivo", data.archivo[0]);

    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_FOTO_PERFIL_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_CREAR_FOTO_PERFIL_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];
      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: "Enviando datos...",
        success: {
          render() {
            setTimeout(() => (window.location.href = "/index"), 1500);
            return "Foto de perfil actualizada correctamente";
          },
        },
        error: handleApiError("guardar la imagen"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!currentProfileImage) return;
    setIsDeleting(true);

    try {
      const ENDPOINTS = {
        Aspirante: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_FOTO_PERFIL_ASPIRANTE
        }`,
        Docente: `${import.meta.env.VITE_API_URL}${
          import.meta.env.VITE_ENDPOINT_ELIMINAR_FOTO_PERFIL_DOCENTE
        }`,
      };
      const endpoint = ENDPOINTS[rol];
      await toast.promise(axiosInstance.delete(endpoint), {
        pending: "Eliminando foto...",
        success: {
          render() {
            setProfileImage(null);
            setCurrentProfileImage(null);
            reset();
            return "Foto eliminada correctamente";
          },
        },
        error: handleApiError("eliminar la imagen"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper para errores
  const handleApiError = (action: string) => ({
    render({ data: error }: { data: unknown }) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") return "Tiempo de espera agotado";
        if (error.response) {
          const errors = error.response.data?.errors;
          return typeof errors === "object"
            ? Object.values(errors).flat().join("\n")
            : error.response.data?.message || `Error al ${action}`;
        }
        return "Sin respuesta del servidor";
      }
      return "Error inesperado";
    },
  });

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center mb-8">
        <Link to="/index" className="mr-4">
          <ButtonRegresar />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Foto de Perfil</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div
          className={`w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg mb-4 ${
            !currentProfileImage ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={() =>
            !currentProfileImage && document.getElementById("archivo")?.click()
          }
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Vista previa"
              className="w-full h-full object-cover"
              onError={(e) =>
                ((e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/150")
              }
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-center text-sm px-2">
                Haz clic para seleccionar una imagen
              </span>
            </div>
          )}
        </div>

        {!currentProfileImage && (
          <>
            <input
              type="file"
              id="archivo"
              {...register("archivo", { required: !currentProfileImage })}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              Formatos soportados: JPEG, PNG, WEBP (Max. 2MB)
            </p>
            <InputErrors errors={errors} name="archivo" />
          </>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {!currentProfileImage ? (
          <ButtonPrimary
            value={isSubmitting ? "Guardando..." : "Guardar cambios"}
            disabled={isSubmitting || !profileImage}
          />
        ) : (
          <button
            type="button"
            onClick={handleDeleteProfileImage}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors"
          >
            {isDeleting ? "Eliminando..." : "Eliminar foto"}
          </button>
        )}
      </div>
    </form>
  );
};

export default FotoPerfil;
