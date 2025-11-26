"use client";

import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const HeaderVicerrectoria = () => {
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

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Ocurrió un error al cerrar sesión");
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="flex bg-white text-xl font-medium sticky top-0 z-50 shadow-md h-16 w-full">
        <div className="flex w-full max-w-[1200px] m-auto relative items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-2xl text-blue-700">UniDoc - Vicerrectoría</h1>
          </div>

          {/* Botón hamburguesa en móviles */}
          <button
            className="md:hidden p-2 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Menú móvil"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="text-3xl">☰</span>
          </button>

          {/* Menú normal en desktop */}
          <nav className="hidden md:flex h-full">
            <ul className="flex items-center gap-8 text-base">
              <li>
                <Link
                  to="/vicerrectoria"
                  className={`hover:text-blue-700 transition-colors ${
                    pathname === "/vicerrectoria" ? "text-blue-600 font-semibold" : ""
                  }`}
                >
                  Avales
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="fixed top-16 left-0 w-full bg-white border-t z-40 shadow-lg md:hidden animate-slideDown">
            <ul className="flex flex-col p-4 gap-4 text-base">
              <li>
                <Link
                  to="/vicerrectoria"
                  onClick={toggleMobileMenu}
                  className="block w-full text-left py-2 px-4 hover:bg-blue-50 rounded"
                >
                  Avales
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="block w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 rounded"
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

export default HeaderVicerrectoria;