import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  Home,
  FileText,
  UserCheck,
  Library,
  Briefcase,
  GraduationCap,
  BookOpen,
  Languages,
  Award,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: {
  to: string;
  label: string;
  Icono: LucideIcon;
  match: (pathname: string) => boolean;
}[] = [
  { to: "/dashboard", label: "Inicio", Icono: Home, match: (p) => p === "/dashboard" },
  { to: "/admin/normativas", label: "Normativas", Icono: FileText, match: (p) => p === "/admin/normativas" },
  {
    to: "/admin/contrataciones",
    label: "Contrataciones",
    Icono: UserCheck,
    match: (p) => p.startsWith("/admin/contrataciones"),
  },
  {
    to: "/admin/escalafon-docente",
    label: "Escalafón docente",
    Icono: Award,
    match: (p) => p === "/admin/escalafon-docente",
  },
];

// Catálogos que administra el rol Administrador. Van agrupados en un desplegable para no
// alargar la barra: son pantallas de mantenimiento, no de uso diario.
const CATALOGOS = [
  { to: "/admin/catalogos/produccion-academica", label: "Producción académica", Icono: Library },
  { to: "/admin/catalogos/tipos-experiencia", label: "Tipos de experiencia", Icono: Briefcase },
  { to: "/admin/catalogos/idiomas", label: "Idiomas", Icono: Languages },
];

// Formación académica es a su vez un submenú dentro de Catálogos: agrupa Niveles de formación
// (catálogo real, hoy) y Formación educativa (Fase 2 — catálogo de programas SNIES, todavía un
// placeholder "Próximamente").
const FORMACION_ACADEMICA_ITEMS = [
  {
    to: "/admin/catalogos/formacion-academica/niveles",
    label: "Niveles de formación",
    Icono: GraduationCap,
  },
  {
    to: "/admin/catalogos/formacion-academica/programas",
    label: "Formación educativa",
    Icono: BookOpen,
  },
];

const INDENT_PADDING = { 1: "pl-9 pr-3", 2: "pl-14 pr-3" } as const;

const SidebarLink = ({
  to,
  label,
  Icono,
  active,
  collapsed,
  indent,
  onClick,
}: {
  to: string;
  label: string;
  Icono: LucideIcon;
  active: boolean;
  collapsed?: boolean;
  /** Nivel de anidación dentro de un submenú: 1 = Catálogos, 2 = Formación académica. */
  indent?: 1 | 2;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`flex items-center gap-3 rounded-lg py-2.5 text-sm transition-colors ${
      collapsed ? "justify-center px-0" : indent ? INDENT_PADDING[indent] : "px-3"
    } ${
      active
        ? "border-r-[3px] border-[#e8740e] bg-[rgba(30,58,95,0.08)] font-semibold text-[#1e3a5f]"
        : "text-[#6b7a8d] hover:bg-[rgba(30,58,95,0.05)] hover:text-[#1e3a5f]"
    }`}
  >
    <Icono size={indent ? 15 : 18} className="shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}
  </Link>
);

const HeaderAdmin = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // En tablet (md–lg) arranca colapsada: con la sidebar expandida ahí el
  // contenido queda muy angosto, ya que antes ese ancho no lo ocupaba nada.
  const [isCollapsed, setIsCollapsed] = useState(
    () => window.innerWidth >= 768 && window.innerWidth < 1024
  );
  const [isCatalogosOpen, setIsCatalogosOpen] = useState(false);
  const [isFormacionAcademicaOpen, setIsFormacionAcademicaOpen] = useState(false);

  const enCatalogos = pathname.startsWith("/admin/catalogos");
  const enFormacionAcademica = pathname.startsWith("/admin/catalogos/formacion-academica");

  // Mantener los submenús abiertos mientras estemos dentro de su sección, y cerrarlos
  // automáticamente al salir.
  useEffect(() => {
    setIsCatalogosOpen(enCatalogos);
  }, [enCatalogos]);

  useEffect(() => {
    setIsFormacionAcademicaOpen(enFormacionAcademica);
  }, [enFormacionAcademica]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const toggleMobileMenu = () => setIsMobileMenuOpen((abierto) => !abierto);

  const toggleCatalogos = () => {
    if (isCollapsed) setIsCollapsed(false);
    setIsCatalogosOpen((abierto) => !abierto);
  };

  const toggleFormacionAcademica = () => {
    if (isCollapsed) setIsCollapsed(false);
    setIsFormacionAcademicaOpen((abierto) => !abierto);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Barra superior delgada, solo en móvil: da acceso al drawer lateral */}
      <header className="fixed top-0 left-0 z-40 flex h-16 w-full items-center justify-between border-b border-[rgba(30,58,95,0.1)] bg-white px-4 shadow-sm md:hidden">
        <h1 className="text-xl font-bold tracking-tight text-[#1e3a5f]">
          UniDoc <span className="font-normal text-[#6b7a8d]">| Administrador</span>
        </h1>
        <button
          className="p-2 text-[#1e3a5f] focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Menú"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Fondo oscuro + drawer del menú móvil, deslizando desde la izquierda */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col bg-white shadow-lg transition-transform duration-200 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[rgba(30,58,95,0.1)] px-4">
          <h1 className="text-lg font-bold tracking-tight text-[#1e3a5f]">
            UniDoc <span className="font-normal text-[#6b7a8d]">| Admin</span>
          </h1>
          <button onClick={toggleMobileMenu} aria-label="Cerrar menú" className="p-1 text-[#6b7a8d]">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ to, label, Icono, match }) => (
            <SidebarLink
              key={to}
              to={to}
              label={label}
              Icono={Icono}
              active={match(pathname)}
              onClick={toggleMobileMenu}
            />
          ))}

          <button
            onClick={toggleCatalogos}
            aria-expanded={isCatalogosOpen}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              enCatalogos
                ? "font-semibold text-[#1e3a5f]"
                : "text-[#6b7a8d] hover:bg-[rgba(30,58,95,0.05)] hover:text-[#1e3a5f]"
            }`}
          >
            <Library size={18} className="shrink-0" />
            <span className="flex-1 text-left">Catálogos</span>
            <ChevronDown size={14} className={`transition-transform ${isCatalogosOpen ? "rotate-180" : ""}`} />
          </button>
          {isCatalogosOpen && (
            <div className="flex flex-col gap-1">
              {CATALOGOS.map(({ to, label, Icono }) => (
                <SidebarLink
                  key={to}
                  to={to}
                  label={label}
                  Icono={Icono}
                  active={pathname === to}
                  onClick={toggleMobileMenu}
                  indent={1}
                />
              ))}

              <button
                onClick={toggleFormacionAcademica}
                aria-expanded={isFormacionAcademicaOpen}
                className={`flex items-center gap-3 rounded-lg pl-9 pr-3 py-2.5 text-sm transition-colors ${
                  enFormacionAcademica
                    ? "font-semibold text-[#1e3a5f]"
                    : "text-[#6b7a8d] hover:bg-[rgba(30,58,95,0.05)] hover:text-[#1e3a5f]"
                }`}
              >
                <GraduationCap size={15} className="shrink-0" />
                <span className="flex-1 truncate text-left">Formación académica</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${isFormacionAcademicaOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isFormacionAcademicaOpen && (
                <div className="flex flex-col gap-1">
                  {FORMACION_ACADEMICA_ITEMS.map(({ to, label, Icono }) => (
                    <SidebarLink
                      key={to}
                      to={to}
                      label={label}
                      Icono={Icono}
                      active={pathname === to}
                      onClick={toggleMobileMenu}
                      indent={2}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="border-t border-[rgba(30,58,95,0.1)] p-3">
          <button
            onClick={() => { logout(); toggleMobileMenu(); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6b7a8d] hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar de escritorio, fija a la izquierda y colapsable */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[rgba(30,58,95,0.1)] bg-white transition-[width] duration-200 md:flex ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-[rgba(30,58,95,0.1)] ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!isCollapsed && (
            <h1 className="text-lg font-bold tracking-tight text-[#1e3a5f]">
              UniDoc <span className="font-normal text-[#6b7a8d]">| Admin</span>
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed((c) => !c)}
            aria-label={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            className="rounded-md p-1.5 text-[#6b7a8d] hover:bg-[rgba(30,58,95,0.08)] hover:text-[#1e3a5f]"
          >
            {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ to, label, Icono, match }) => (
            <SidebarLink
              key={to}
              to={to}
              label={label}
              Icono={Icono}
              active={match(pathname)}
              collapsed={isCollapsed}
            />
          ))}

          <button
            onClick={toggleCatalogos}
            title={isCollapsed ? "Catálogos" : undefined}
            aria-expanded={isCatalogosOpen}
            className={`flex items-center gap-3 rounded-lg py-2.5 text-sm transition-colors ${
              isCollapsed ? "justify-center px-0" : "px-3"
            } ${
              enCatalogos
                ? "font-semibold text-[#1e3a5f]"
                : "text-[#6b7a8d] hover:bg-[rgba(30,58,95,0.05)] hover:text-[#1e3a5f]"
            }`}
          >
            <Library size={18} className="shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">Catálogos</span>
                <ChevronDown size={14} className={`transition-transform ${isCatalogosOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
          {!isCollapsed && isCatalogosOpen && (
            <div className="flex flex-col gap-1">
              {CATALOGOS.map(({ to, label, Icono }) => (
                <SidebarLink key={to} to={to} label={label} Icono={Icono} active={pathname === to} indent={1} />
              ))}

              <button
                onClick={toggleFormacionAcademica}
                aria-expanded={isFormacionAcademicaOpen}
                className={`flex items-center gap-3 rounded-lg pl-9 pr-3 py-2.5 text-sm transition-colors ${
                  enFormacionAcademica
                    ? "font-semibold text-[#1e3a5f]"
                    : "text-[#6b7a8d] hover:bg-[rgba(30,58,95,0.05)] hover:text-[#1e3a5f]"
                }`}
              >
                <GraduationCap size={15} className="shrink-0" />
                <span className="flex-1 truncate text-left">Formación académica</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${isFormacionAcademicaOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isFormacionAcademicaOpen && (
                <div className="flex flex-col gap-1">
                  {FORMACION_ACADEMICA_ITEMS.map(({ to, label, Icono }) => (
                    <SidebarLink
                      key={to}
                      to={to}
                      label={label}
                      Icono={Icono}
                      active={pathname === to}
                      indent={2}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="border-t border-[rgba(30,58,95,0.1)] p-3">
          <button
            onClick={logout}
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className={`flex items-center gap-3 rounded-lg py-2.5 text-sm text-[#6b7a8d] hover:bg-red-50 hover:text-red-600 ${
              isCollapsed ? "w-full justify-center px-0" : "w-full px-3"
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && "Cerrar sesión"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default HeaderAdmin;