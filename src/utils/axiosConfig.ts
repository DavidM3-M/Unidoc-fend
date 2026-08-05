import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// Crear una instancia de Axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  timeout: 20000, 
});

// Interceptor de solicitud (request)
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtén el token de las cookies
    const token = Cookies.get("token");

    if (token) {
      // Si hay token, lo agregamos al encabezado de autorización
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta (response)
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // Si la respuesta es exitosa, la pasamos como está
  },
  (error) => {
    if (error.response) {
      // Si hay una respuesta del servidor
      if (error.response.status === 401) {
        //Borrar la cookie del token
        Cookies.remove("rol");
        Cookies.remove("token");
        sessionStorage.clear()
        

        // Si el código de estado es 401, redirigir al login
        toast.error("Sesión expirada, por favor inicia sesión.");
        // Redirigir al login con window.location usando el hook useNavigate
        // const navigate = useNavigate();
        // navigate("/");
        window.location.href = "/";
        
      }

      return Promise.reject(error);
    }

    toast.error("Error de red, intenta nuevamente.");
    return Promise.reject(error);
  }
);

export default axiosInstance;
