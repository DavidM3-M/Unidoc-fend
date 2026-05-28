import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import { ClipboardList, Users, UserCheck, ArrowRight, Briefcase } from "lucide-react";
import logoImg from "../../assets/images/logo-uniautonoma.png";

const TalentoHumano = () => {
  const { t } = useLanguage();

  const secciones = [
    {
      to: "convocatorias",
      icon: <ClipboardList className="h-8 w-8 text-white" />,
      bgIcon: "linear-gradient(135deg, #0075bf, #19407b)",
      titulo: t("convocations.title") || "Convocatorias",
      descripcion: "Gestiona y publica convocatorias para nuevas vinculaciones.",
      badge: "Activo",
      badgeBg: "#d0eaf7",
      badgeColor: "#19407b",
      borderHover: "#0075bf",
      arrowColor: "#0075bf",
    },
    {
      to: "postulaciones",
      icon: <Users className="h-8 w-8 text-white" />,
      bgIcon: "linear-gradient(135deg, #08ADCF, #0075bf)",
      titulo: "Postulaciones",
      descripcion: "Revisa y evalúa las postulaciones de los candidatos.",
      badge: "Gestión",
      badgeBg: "#d0f2f8",
      badgeColor: "#086d82",
      borderHover: "#08ADCF",
      arrowColor: "#08ADCF",
    },
    {
      to: "contrataciones",
      icon: <UserCheck className="h-8 w-8 text-white" />,
      bgIcon: "linear-gradient(135deg, #19407b, #0075bf)",
      titulo: "Contrataciones",
      descripcion: "Administra los procesos de contratación del personal.",
      badge: "Proceso",
      badgeBg: "#dde8f5",
      badgeColor: "#19407b",
      borderHover: "#19407b",
      arrowColor: "#19407b",
    },
  ];

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Imagen de fondo con overlay institucional */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${logoImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />
      {/* Overlay degradado institucional */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(25,64,123,0.88) 0%, rgba(0,117,191,0.80) 50%, rgba(8,173,207,0.75) 100%)",
          zIndex: 1,
        }}
      />

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto space-y-8" style={{ position: "relative", zIndex: 2 }}>

        {/* Header */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 8px 32px rgba(25,64,123,0.25)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="p-3 rounded-xl shadow-lg"
                style={{ background: "linear-gradient(135deg, #0075bf, #19407b)" }}
              >
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white animate-pulse"
                style={{ background: "#08ADCF" }}
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow">
                Talento Humano
              </h1>
              <p style={{ color: "rgba(255,255,255,0.80)" }} className="mt-1 text-sm">
                Gestión integral del talento y los procesos de vinculación
              </p>
            </div>
          </div>
          <p
            className="text-base leading-relaxed pl-16 mt-3 max-w-3xl"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Bienvenido al módulo de Talento Humano. Selecciona una sección para comenzar a gestionar
            convocatorias, postulaciones y contrataciones del personal de la institución.
          </p>
        </div>

        {/* Tarjetas de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secciones.map((s) => (
            <Link key={s.to} to={s.to}>
              <div
                className="group rounded-2xl transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col gap-5 h-full cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.13)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow: "0 4px 24px rgba(25,64,123,0.18)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `1px solid ${s.borderHover}`;
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,117,191,0.30)`;
                  e.currentTarget.style.background = "rgba(255,255,255,0.20)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(25,64,123,0.18)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                }}
              >
                {/* Icono + Badge */}
                <div className="flex items-start justify-between">
                  <div
                    className="p-4 rounded-xl shadow-md"
                    style={{ background: s.bgIcon }}
                  >
                    {s.icon}
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: s.badgeBg, color: s.badgeColor }}
                  >
                    {s.badge}
                  </span>
                </div>

                {/* Texto */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{s.titulo}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {s.descripcion}
                  </p>
                </div>

                {/* Acción */}
                <div
                  className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                  style={{ color: "#a8ddf4" }}
                >
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