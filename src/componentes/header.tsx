import SesionValida from "./SesionValida";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { RolesValidos } from "../types/roles";
import CampanaNotificaciones from "./notificaciones/CampanaNotificaciones";
import {
  Menu, X, Home, User, Briefcase, FileText,
  Settings, LogOut, FileSignature, Bell
} from "lucide-react"; // Importamos los íconos necesarios

const Header = () => (
  <SesionValida>{rol => <HeaderContenido rol={rol} />}</SesionValida>
);

const HeaderContenido = ({ rol }: { rol: RolesValidos }) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const ENDPOINTS = {
          Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_ASPIRANTE,
          Docente: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE,
          Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE,
        };
        const endpoint = rol ? ENDPOINTS[rol] : undefined;
        if (!endpoint) throw new Error("No endpoint found for user role");

        const response = await axiosInstance.get(endpoint);
        const documentos = response.data.fotoPerfil?.documentos_foto_perfil;

        if (documentos && documentos.length > 0) {
          const imageUrl = documentos[0].archivo_url;
          setProfileImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("Error al cargar foto:", error);
      }
    };

    fetchProfileImage();
  }, [rol]);

  const dropdownRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Ocurrió un error al cerrar sesión");
    }
  };

  const { pathname } = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Mismo header contenedor que Admin */}
      <header className="bg-white text-[#2c3e50] sticky top-0 z-50 border-b border-[rgba(30,58,95,0.1)] shadow-sm h-16 w-full">
        <div className="flex w-full max-w-[1200px] h-full m-auto items-center justify-between px-4 md:px-8">

          <div className="flex items-center gap-4">
            {/* Título unificado en color */}
            <h1 className="font-bold text-xl text-[#1e3a5f] tracking-tight">
              UniDoc
            </h1>
          </div>

          {/* Botón menú móvil con estilo Admin */}
          {/* En móvil la barra entera se esconde tras el botón de menú, así que la campana viaja
              junto a él: si quedara dentro de <nav> haría falta abrir el menú para ver que hay algo. */}
          <div className="flex items-center gap-1 md:hidden">
            <CampanaNotificaciones rutaVerTodas="/notificaciones" />

            <button
              className="p-2 text-[#1e3a5f] focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Menú móvil"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menú normal en desktop */}
          <nav className="hidden md:flex h-full">
            <ul className="flex items-center gap-6 h-full">
              <li>
                <Link
                  to="/index"
                  className={`flex items-center gap-2 px-2 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                    pathname === "/index"
                      ? "border-[#1e3a5f] text-[#1e3a5f]"
                      : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
                  }`}
                >
                  <Home size={16} />
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/datos-personales"
                  className={`flex items-center gap-2 px-2 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                    pathname === "/datos-personales"
                      ? "border-[#1e3a5f] text-[#1e3a5f]"
                      : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
                  }`}
                >
                  <User size={16} />
                  Datos personales
                </Link>
              </li>
              <li>
                <Link
                  to="/convocatorias"
                  className={`flex items-center gap-2 px-2 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                    pathname === "/convocatorias"
                      ? "border-[#1e3a5f] text-[#1e3a5f]"
                      : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
                  }`}
                >
                  <Briefcase size={16} />
                  Convocatorias
                </Link>
              </li>
              <li>
                <Link
                  to="/normativas"
                  className={`flex items-center gap-2 px-2 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                    pathname === "/normativas"
                      ? "border-[#1e3a5f] text-[#1e3a5f]"
                      : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
                  }`}
                >
                  <FileText size={16} />
                  Normativas
                </Link>
              </li>

              <li className="flex items-center">
                <CampanaNotificaciones rutaVerTodas="/notificaciones" />
              </li>

              {/* Dropdown Perfil */}
              <li className="relative h-full flex items-center ml-1" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="cursor-pointer flex items-center focus:outline-none rounded-full ring-2 ring-transparent hover:ring-[rgba(30,58,95,0.2)] transition-all"
                >
                  <img
                    src={
                      profileImageUrl ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }
                    alt="Perfil"
                    className="size-9 object-cover rounded-full border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                    }}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%-8px)] w-56 bg-white rounded-xl shadow-lg z-50 text-sm border border-[rgba(30,58,95,0.1)] overflow-hidden py-1">
                    {rol === "Docente" && (
                      <Link
                        className="flex items-center gap-2 px-4 py-3 hover:bg-[rgba(30,58,95,0.05)] text-[#2c3e50] transition-colors"
                        to="/contratacion"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FileSignature size={16} className="text-[#6b7a8d]" />
                        Contratación
                      </Link>
                    )}

                    <Link
                      to="/configuracion"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-[rgba(30,58,95,0.05)] text-[#2c3e50] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} className="text-[#6b7a8d]" />
                      Configuración
                    </Link>

                    <div className="h-[1px] bg-[rgba(30,58,95,0.1)] my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>

        {/* Menú móvil desplegable estilo Admin */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-[rgba(30,58,95,0.1)] shadow-lg md:hidden">
            <ul className="flex flex-col p-4 gap-2">
              <li>
                <Link
                  to="/index"
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    pathname === "/index"
                      ? "bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] font-semibold"
                      : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.05)]"
                  }`}
                >
                  <Home size={18} className={pathname === "/index" ? "text-[#1e3a5f]" : "text-[#6b7a8d]"} />
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/datos-personales"
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    pathname === "/datos-personales"
                      ? "bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] font-semibold"
                      : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.05)]"
                  }`}
                >
                  <User size={18} className={pathname === "/datos-personales" ? "text-[#1e3a5f]" : "text-[#6b7a8d]"} />
                  Datos personales
                </Link>
              </li>
              <li>
                <Link
                  to="/convocatorias"
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    pathname === "/convocatorias"
                      ? "bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] font-semibold"
                      : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.05)]"
                  }`}
                >
                  <Briefcase size={18} className={pathname === "/convocatorias" ? "text-[#1e3a5f]" : "text-[#6b7a8d]"} />
                  Convocatorias
                </Link>
              </li>
              <li>
                <Link
                  to="/normativas"
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    pathname === "/normativas"
                      ? "bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] font-semibold"
                      : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.05)]"
                  }`}
                >
                  <FileText size={18} className={pathname === "/normativas" ? "text-[#1e3a5f]" : "text-[#6b7a8d]"} />
                  Normativas
                </Link>
              </li>

              {rol === "Docente" && (
                <li>
                  <Link
                    to="/contratacion"
                    onClick={toggleMobileMenu}
                    className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                      pathname === "/contratacion"
                        ? "bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] font-semibold"
                        : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.05)]"
                    }`}
                  >
                    <FileSignature size={18} className={pathname === "/contratacion" ? "text-[#1e3a5f]" : "text-[#6b7a8d]"} />
                    Contratación
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/notificaciones"
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    pathname === "/notificaciones"
                      ? "bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] font-semibold"
                      : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.05)]"
                  }`}
                >
                  <Bell size={18} className={pathname === "/notificaciones" ? "text-[#1e3a5f]" : "text-[#6b7a8d]"} />
                  Notificaciones
                </Link>
              </li>

              <li>
                <Link
                  to="/configuracion"
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    pathname === "/configuracion"
                      ? "bg-[rgba(30,58,95,0.05)] text-[#1e3a5f] font-semibold"
                      : "text-[#2c3e50] hover:bg-[rgba(30,58,95,0.05)]"
                  }`}
                >
                  <Settings size={18} className={pathname === "/configuracion" ? "text-[#1e3a5f]" : "text-[#6b7a8d]"} />
                  Configuración
                </Link>
              </li>

              <div className="h-[1px] bg-[rgba(30,58,95,0.1)] my-1 mx-4"></div>

              <li>
                <button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="flex w-full items-center gap-3 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
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

export default Header;
