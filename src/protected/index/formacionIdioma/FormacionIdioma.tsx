import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EstadoDocumento from "../../../componentes/Estado";
import { GlobeIcon } from "../../../assets/icons/Iconos";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import ButtonPreEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarIdioma from "../../agregar/AgregarIdioma";
import PreIdioma from "../../editar/idioma/pre-idioma";
import VerIdioma from "../../ver/VerIdioma";
import { notificarTrayectoriaActualizada } from "../../../hooks/useTrayectoriaActualizada";
import {
  TarjetaTrayectoria,
  TituloTarjeta,
  MetaTarjeta,
  ChipTarjeta,
} from "../../../componentes/TarjetaTrayectoria";
import { calcularVigencia, formatearFecha } from "../../../utils/idiomaCertificado";
import { fechaCorta } from "../../../utils/fechas";

/**
 * Insignia del nivel MCER. Es el veredicto de la tarjeta y por eso va sólida y a la derecha del
 * título, no como tercera línea gris.
 *
 * Distingue de dónde salió el nivel, que es justamente lo que el catálogo del Administrador
 * existe para resolver: con puntaje, el servidor lo derivó de `examenes_idioma_rangos`; sin
 * puntaje, el docente lo eligió de una lista. Son dos cosas muy distintas y antes se veían
 * idénticas.
 */
const InsigniaNivel = ({ nivel, calculado }: { nivel: string; calculado: boolean }) => (
  <span
    className={`inline-flex flex-col items-center rounded-lg px-2.5 py-1.5 leading-none text-white ${
      calculado ? "bg-[#1e3a5f]" : "bg-[#6b7a8d]"
    }`}
    title={
      calculado
        ? "Calculado por el sistema a partir del puntaje del certificado"
        : "Declarado por ti; el certificado no trae puntaje numérico"
    }
  >
    <b className="text-[17px] font-bold tracking-tight">{nivel}</b>
    <i className="not-italic text-[8.5px] font-bold uppercase tracking-wider opacity-80 mt-0.5">
      {calculado ? "calculado" : "declarado"}
    </i>
  </span>
);

const FormacionIdioma = () => {
  const [idiomas, setIdiomas] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openPreEdit, setOpenPreEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<any | null>(null);

  /**
   * Refresca esta tarjeta y, además, avisa a la tarjeta de Hoja de vida.
   *
   * Las barras de puntaje y antigüedad viven en un componente hermano que no se desmonta al
   * agregar un idioma: sin el aviso se quedaban con el valor de la carga inicial hasta recargar
   * la página.
   */
  const refrescarTrayectoria = () => {
    fetchDatos();
    notificarTrayectoriaActualizada();
  };

  const handleIdiomaAgregado = () => {
    refrescarTrayectoria();
    setOpenAdd(false);
  };

  const fetchDatos = async () => {
    try {
      const cached = sessionStorage.getItem("idiomas");
      if (cached) {
        setIdiomas(JSON.parse(cached));
      }

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_IDIOMAS_DOCENTE,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);

      if (response.data?.idiomas) {
        setIdiomas(response.data.idiomas);
        sessionStorage.setItem("idiomas", JSON.stringify(response.data.idiomas));
      }
    } catch (error) {
      console.error("Error al cargar idiomas:", error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full max-w-[400px]">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-bold text-xl text-slate-900">Formación Idioma</h4>
        <div className="flex gap-1">
          <ButtonAgregar onClick={() => setOpenAdd(true)} />
          <ButtonPreEditar onClick={() => setOpenPreEdit(true)} />
        </div>
      </div>

      {/* Listado */}
      <div>
        {idiomas.length === 0 ? (
          <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
        ) : (
          <ul className="flex flex-col gap-3">
            {idiomas.map((item, index) => {
              // Con puntaje, el nivel lo derivó el servidor de los rangos del examen; sin él,
              // lo eligió el docente a mano.
              const tienePuntaje =
                item.puntaje_obtenido !== null && item.puntaje_obtenido !== undefined;

              // `vigencia_meses` viene del examen del catálogo. Los exámenes que no vencen
              // (Cambridge) lo traen nulo y entonces no se dibuja nada: no se inventa un
              // "Sin vencimiento" que nadie pidió.
              const vigencia = calcularVigencia(
                item.fecha_certificado,
                item.examen_idioma?.vigencia_meses
              );

              return (
                <TarjetaTrayectoria
                  key={item.id_idioma ?? index}
                  icono={<GlobeIcon />}
                  onClick={() => {
                    setIdiomaSeleccionado(item);
                    setOpenDetalle(true);
                  }}
                  titulo={
                    <>
                      <TituloTarjeta>{item.idioma}</TituloTarjeta>

                      {/* El examen es la evidencia del nivel, y el puntaje la respalda. Antes el
                          examen se pintaba donde Educativa pone la universidad, así que "IELTS"
                          parecía el nombre de un instituto. */}
                      <p className="font-medium text-gray-700 mt-0.5 truncate">
                        {item.institucion_idioma}
                        {tienePuntaje && (
                          <span className="ml-1.5 rounded bg-[#1e3a5f]/[0.07] px-1.5 py-0.5 font-mono text-xs font-bold text-[#1e3a5f]">
                            {item.puntaje_obtenido}
                          </span>
                        )}
                      </p>
                    </>
                  }
                  aparte={
                    item.nivel ? (
                      <InsigniaNivel nivel={item.nivel} calculado={tienePuntaje} />
                    ) : null
                  }
                >
                  <MetaTarjeta>
                    {vigencia && (
                      <ChipTarjeta tono={vigencia.vencido ? "alerta" : "ok"}>
                        {vigencia.vencido
                          ? `Venció el ${formatearFecha(vigencia.venceEl)}`
                          : `Vigente hasta ${formatearFecha(vigencia.venceEl)}`}
                      </ChipTarjeta>
                    )}
                    <span>{fechaCorta(item.fecha_certificado)}</span>
                  </MetaTarjeta>

                  <div className="mt-2">
                    <EstadoDocumento documentos={item.documentos_idioma} />
                  </div>
                </TarjetaTrayectoria>
              );
            })}
          </ul>
        )}
      </div>

      {/* MODAL AGREGAR */}
      <CustomDialog
        title="Agregar Idioma"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      >
        <AgregarIdioma onSuccess={handleIdiomaAgregado} onCancelar={() => setOpenAdd(false)} />
      </CustomDialog>

      {/* MODAL PRE-EDITAR */}
      <CustomDialog
        title="Editar Idioma"
        open={openPreEdit}
        onClose={() => setOpenPreEdit(false)}
      >
        <PreIdioma onSuccess={refrescarTrayectoria} />
      </CustomDialog>

      {/* MODAL DETALLE */}
      <CustomDialog
        title="Detalles del Idioma"
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
      >
        <VerIdioma idiomaData={idiomaSeleccionado} />
      </CustomDialog>
    </div>
  );
};

export default FormacionIdioma;
