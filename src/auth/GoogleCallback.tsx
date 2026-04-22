import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      toast.error("Error al autenticar con Google");
      navigate("/inicio-sesion");
      return;
    }

    Cookies.set("token", token, { sameSite: "Strict", path: "/", expires: 1 });

    const decoded = jwtDecode<{ rol: string }>(token);
    const rol = decoded.rol;

    if (rol === "Aspirante" || rol === "Docente") {
      navigate("/index");
    } else if (rol === "Administrador") {
      navigate("/dashboard");
    } else if (rol === "Talento Humano") {
      navigate("/talento-humano");
    } else if (rol === "Apoyo Profesoral") {
      navigate("/apoyo-profesoral");
    } else if (rol === "Rectoria") {
      navigate("/rectoria/avales");
    } else if (rol === "Vicerrectoria") {
      navigate("/vicerrectoria/avales");
    } else if (rol === "Coordinador") {
      navigate("/coordinador");
    } else {
      toast.error("Rol no reconocido");
      navigate("/inicio-sesion");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600 text-sm animate-pulse">Autenticando con Google...</p>
    </div>
  );
};

export default GoogleCallback;
