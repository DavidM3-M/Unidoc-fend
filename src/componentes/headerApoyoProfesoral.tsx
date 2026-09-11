import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut, Home, ArrowUpRight, Bell } from "lucide-react";
import CampanaNotificaciones from "./notificaciones/CampanaNotificaciones";

const HeaderApoyoProfesoral = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = async () => {
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/cerrar-sesion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Cookies.remove("token");
      Cookies.remove("rol");
      sessionStorage.clear();
      toast.success("Sesión cerrada correctamente");
      setTimeout(() => { window.location.href = "/"; }, 500);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Ocurrió un error al cerrar sesión");
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // La portada es la raíz del rol, así que se marca activa solo en coincidencia exacta: con
  // `startsWith` quedaría encendida también dentro del escalafón.
  const enlaces = [
    { to: "/apoyo-profesoral", etiqueta: "Inicio", icono: Home, exacto: true },
    {
      to: "/apoyo-profesoral/escalafon",
      etiqueta: "Escalafón",
      icono: ArrowUpRight,
      exacto: false,
    },
  ];

  const estaActivo = (to: string, exacto: boolean) =>
    exacto ? pathname === to : pathname.startsWith(to);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="bg-white text-[#2c3e50] sticky top-0 z-50 border-b border-[rgba(30,58,95,0.1)] shadow-sm h-16 w-full">
        <div className="flex w-full max-w-[1200px] h-full m-auto items-center justify-between px-4 md:px-8">

          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl text-[#1e3a5f] tracking-tight">
              UniDoc <span className="font-normal text-[#6b7a8d]">| Apoyo Profesoral</span>
            </h1>
          </div>

          {/* En móvil la barra se esconde tras el botón de menú, así que la campana viaja junto
              a él: dentro de <nav> obligaría a abrir el menú para saber que hay algo pendiente. */}
          <div className="flex items-center gap-1 md:hidden">
            <CampanaNotificaciones rutaVerTodas="/apoyo-profesoral/notificaciones" />

            <button
              className="p-2 text-[#1e3a5f] focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Menú móvil"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className="hidden md:flex h-full">
            <ul className="flex items-center gap-8 h-full">
              {enlaces.map(({ to, etiqueta, icono: Icono, exacto }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-2 px-3 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                      estaActivo(to, exacto)
                        ? "border-[#1e3a5f] text-[#1e3a5f]"
                        : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
                    }`}
                  >
                    <Icono size={16} />
                    {etiqueta}
                  </Link>
                </li>
              ))}
              <li className="flex items-center">
                <CampanaNotificaciones rutaVerTodas="/apoyo-profesoral/notificaciones" />
              </li>
              <li>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-[#6b7a8d] hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-[rgba(30,58,95,0.1)] shadow-lg md:hidden">
            <ul className="flex flex-col p-4 gap-2">
              {enlaces.map(({ to, etiqueta, icono: Icono }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-3 py-3 px-4 hover:bg-[rgba(30,58,95,0.05)] rounded-lg text-[#2c3e50]"
                  >
                    <Icono size={18} />
                    {etiqueta}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/apoyo-profesoral/notificaciones"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-[rgba(30,58,95,0.05)] rounded-lg text-[#2c3e50]"
                >
                  <Bell size={18} />
                  Notificaciones
                </Link>
              </li>
              <li>
                <button
                  onClick={() => { logout(); toggleMobileMenu(); }}
                  className="flex w-full items-center gap-3 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
};

export default HeaderApoyoProfesoral;