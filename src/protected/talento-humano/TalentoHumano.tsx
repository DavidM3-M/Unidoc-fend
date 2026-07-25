import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import { ClipboardList, Users, UserCheck, ArrowRight, Briefcase } from "lucide-react";

const TalentoHumano = () => {
  const { t } = useLanguage();

  const secciones = [
    {
      to: "convocatorias",
      icon: <ClipboardList className="h-8 w-8 text-white" />,
      bgIcon: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      titulo: t("convocations.title") || "Convocatorias",
      descripcion: "Gestiona y publica convocatorias para nuevas vinculaciones.",
      badge: "Activo",
      badgeColor: "bg-emerald-100 text-emerald-700",
      borderHover: "hover:border-emerald-300",
      shadow: "hover:shadow-emerald-100",
    },
    {
      to: "postulaciones",
      icon: <Users className="h-8 w-8 text-white" />,
      bgIcon: "bg-gradient-to-br from-teal-500 to-teal-600",
      titulo: "Postulaciones",
      descripcion: "Revisa y evalúa las postulaciones de los candidatos.",
      badge: "Gestión",
      badgeColor: "bg-teal-100 text-teal-700",
      borderHover: "hover:border-teal-300",
      shadow: "hover:shadow-teal-100",
    },
    {
      to: "contrataciones",
      icon: <UserCheck className="h-8 w-8 text-white" />,
      bgIcon: "bg-gradient-to-br from-green-500 to-green-600",
      titulo: "Contrataciones",
      descripcion: "Administra los procesos de contratación del personal.",
      badge: "Proceso",
      badgeColor: "bg-green-100 text-green-700",
      borderHover: "hover:border-green-300",
      shadow: "hover:shadow-green-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">
                Talento Humano
              </h1>
              <p className="text-gray-600 mt-1">Gestión integral del talento y los procesos de vinculación</p>
            </div>
          </div>
          <p className="text-gray-600 text-base leading-relaxed pl-16 mt-2 max-w-3xl">
            Bienvenido al módulo de Talento Humano. Selecciona una sección para comenzar a gestionar
            convocatorias, postulaciones y contrataciones del personal de la institución.
          </p>
        </div>

        {/* Tarjetas de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secciones.map((s) => (
            <Link key={s.to} to={s.to}>
              <div
                className={`group bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl ${s.shadow} ${s.borderHover} transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col gap-5 h-full cursor-pointer`}
              >
                {/* Icono + Badge */}
                <div className="flex items-start justify-between">
                  <div className={`p-4 rounded-xl shadow-md ${s.bgIcon}`}>
                    {s.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>

                {/* Texto */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{s.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.descripcion}</p>
                </div>

                {/* Acción */}
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:gap-3 transition-all">
                  <span>Ir a {s.titulo.toLowerCase()}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TalentoHumano;