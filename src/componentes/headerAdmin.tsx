import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut, Home, FileText, UserCheck } from "lucide-react";

const HeaderAdmin = () => {
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

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="bg-white text-[#2c3e50] sticky top-0 z-50 border-b border-[rgba(30,58,95,0.1)] shadow-sm h-16 w-full">
        <div className="flex w-full max-w-[1200px] h-full m-auto items-center justify-between px-4 md:px-8">
          
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl text-[#1e3a5f] tracking-tight">
              UniDoc <span className="font-normal text-[#6b7a8d]">| Administrador</span>
            </h1>
          </div>

          <button
            className="md:hidden p-2 text-[#1e3a5f] focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Menú móvil"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menú Desktop */}
          <nav className="hidden md:flex h-full">
            <ul className="flex items-center gap-8 h-full">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                    pathname === "/dashboard" 
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
                  to="/admin/normativas"
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                    pathname === "/admin/normativas" 
                      ? "border-[#1e3a5f] text-[#1e3a5f]" 
                      : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
                  }`}
                >
                  <FileText size={16} />
                  Normativas
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/contrataciones"
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-medium transition-colors border-b-2 h-full ${
                    pathname.startsWith("/admin/contrataciones")
                      ? "border-[#1e3a5f] text-[#1e3a5f]"
                      : "border-transparent text-[#6b7a8d] hover:text-[#1e3a5f]"
                  }`}
                >
                  <UserCheck size={16} />
                  Contrataciones
                </Link>
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
              <li>
                <Link
                  to="/dashboard"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-[rgba(30,58,95,0.05)] rounded-lg text-[#2c3e50]"
                >
                  <Home size={18} />
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/normativas"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-[rgba(30,58,95,0.05)] rounded-lg text-[#2c3e50]"
                >
                  <FileText size={18} />
                  Normativas
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/contrataciones"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-[rgba(30,58,95,0.05)] rounded-lg text-[#2c3e50]"
                >
                  <UserCheck size={18} />
                  Contrataciones
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

export default HeaderAdmin;