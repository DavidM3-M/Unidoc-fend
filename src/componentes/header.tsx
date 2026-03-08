import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { RolesValidos } from "../types/roles";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const token = Cookies.get("token");
  // Sin token válido: redirigir al login en lugar de lanzar excepción no capturada
  if (!token) {
    window.location.replace("/");
    return null;
  }
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        // 2. Hacer petición al servidor

        const ENDPOINTS = {
          Aspirante: `${import.meta.env.VITE_API_URL}${
            import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_ASPIRANTE
          }`,
          Docente: `${import.meta.env.VITE_API_URL}${
            import.meta.env.VITE_ENDPOINT_OBTENER_FOTO_PERFIL_DOCENTE
          }`,
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
        // Si hay error, se mantiene la imagen de cache (si existía)
      }
    };

    fetchProfileImage();
  }, []);

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
      const token = Cookies.get("token"); // Obtén el token

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/cerrar-sesion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Aquí envías tu token
            "Content-Type": "application/json",
          },
        }
      );
      Cookies.remove("token");
      Cookies.remove("rol");
      //borrar todo el sessionStorage

      sessionStorage.clear();
      setTimeout(() => {
        toast.success("Sesión cerrada correctamente");
      }, 100);
      window.location.href = "/"; // Redirige a la página de inicio
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const { pathname } = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <ToastContainer />
      <header className="flex bg-white text-xl font-medium sticky top-0 z-50 shadow-md h-16 w-full">
        <div className="flex w-full max-w-[1200px] m-auto relative items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-2xl">UniDoc</h1>
          </div>

          {/* Botón de hamburguesa solo en móviles */}
          <button className="md:hidden" onClick={toggleMobileMenu}>
            <span className="text-3xl">☰</span>
          </button>

          {/* Menú normal en desktop */}
          <nav className="hidden md:flex h-full">
            <ul className="flex items-center gap-8 text-base">
              <li>
                <Link
                  className={`hover:border-b-2 ${
                    pathname === "/index" ? "border-b-2 border-blue-500" : ""
                  }`}
                  to="/index"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  className={`hover:border-b-2 ${
                    pathname === "/datos-personales"
                      ? "border-b-2 border-blue-500"
                      : ""
                  }`}
                  to="/datos-personales"
                >
                  Datos personales
                </Link>
              </li>
              <li>
                <Link
                  className={`hover:border-b-2 ${
                    pathname === "/convocatorias"
                      ? "border-b-2 border-blue-500"
                      : ""
                  }`}
                  to="/convocatorias"
                >
                  Convocatorias
                </Link>
              </li>
              <li>
                <Link
                  className={`hover:border-b-2 ${
                    pathname === "/normativas"
                      ? "border-b-2 border-blue-500"
                      : ""
                  }`}
                  to="/normativas"
                >
                  Normativas
                </Link>
              </li>

              <li className="relative" ref={dropdownRef}>
                <div
                  onClick={toggleDropdown}
                  className="cursor-pointer flex items-center"
                >
                  <img
                    src={
                      profileImageUrl ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }
                    alt="Perfil"
                    className="size-10 object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                    }}
                  />
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg z-50 text-sm border border-gray-200">
                    {rol === "Docente" && (
                      <Link
                        className="block px-4 py-2 hover:bg-gray-100 border-b border-gray-200"
                        to="/contratacion"
                      >
                        Contratación
                      </Link>
                    )}

                    <Link
                      to="/configuracion"
                      className="block px-4 py-2 hover:bg-gray-100 border-b border-gray-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Configuración
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>

        {/* Menú móvil desplegable */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-t z-40 shadow-md md:hidden">
            <ul className="flex flex-col p-4 gap-4 text-base">
              <li>
                <Link
                  to="/index"
                  className={`${
                    pathname === "/index" ? "font-bold text-blue-600" : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/datos-personales"
                  className={`${
                    pathname === "/datos-personales"
                      ? "font-bold text-blue-600"
                      : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Datos personales
                </Link>
              </li>
              <li>
                <Link
                  to="/normativas"
                  className={`${
                    pathname === "/normativas" ? "font-bold text-blue-600" : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Normativas
                </Link>
              </li>
              <li>
                <Link
                  to="/contratacion"
                  className={`${
                    pathname === "/convocatorias"
                      ? "font-bold text-blue-600"
                      : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Contratación
                </Link>
              </li>
              <li>
                <Link to="/configuracion" onClick={toggleMobileMenu}>
                  Configuración
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="text-left text-red-600"
                >
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
