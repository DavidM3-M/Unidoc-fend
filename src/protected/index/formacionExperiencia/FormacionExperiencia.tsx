import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EstadoDocumento from "../../../componentes/Estado";
import { BriefIcon } from "../../../assets/icons/Iconos";
import {
  TarjetaTrayectoria,
  TituloTarjeta,
  SubtituloTarjeta,
  MetaTarjeta,
  ChipTarjeta,
} from "../../../componentes/TarjetaTrayectoria";
import { anio } from "../../../utils/fechas";
import { mesesDeExperiencia, textoMeses } from "../../../utils/experienciaMeses";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarExperiencia from "../../agregar/AgregarExperiencia";
import PreExperiencia from "../../editar/experiencia/pre-experiencia";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import VerExperiencia from "../../ver/VerExperiencia";

const FormacionExperiencia = () => {
  const [experiencias, setExperiencias] = useState<any[]>([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);

  const [experienciaSeleccionada, setExperienciaSeleccionada] =
    useState<any | null>(null);

  // === Callback: al agregar una experiencia ===
  const handleExperienciaAgregada = () => {
    fetchDatos();
    setOpenAdd(false);
  };

  // === Función reutilizable para cargar datos ===
  const fetchDatos = async () => {
    try {
      // 1. Cargar desde sessionStorage primero
      const cached = sessionStorage.getItem("experiencias");
      if (cached) {
        setExperiencias(JSON.parse(cached));
      }

      // 2. Obtener token y rol
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      // 3. Endpoints por rol
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_EXPERIENCIAS_DOCENTE,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);

      // 4. Actualizar estado + sessionStorage
      if (response.data?.experiencias) {
        setExperiencias(response.data.experiencias);
        sessionStorage.setItem(
          "experiencias",
          JSON.stringify(response.data.experiencias)
        );
      }
    } catch (error) {
      console.error("Error al cargar experiencias:", error);
      // Se mantiene el cache si existe
    }
  };

  // === cargar datos al montar componente ===
  useEffect(() => {
    fetchDatos();
  }, []);

  if (!experiencias) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full max-w-[400px]">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-bold text-xl text-slate-900">Experiencia Profesional</h4>
        <div className="flex gap-1">
          <ButtonAgregar onClick={() => setOpenAdd(true)} />
          <ButtonEditar onClick={() => setOpenEdit(true)} />
        </div>
      </div>

      {/* Listado */}
      <div>
        {experiencias.length === 0 ? (
          <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
        ) : (
          <ul className="flex flex-col gap-3">
            {experiencias.map((item, index) => {
              const meses = mesesDeExperiencia(item);

              return (
                <TarjetaTrayectoria
                  key={item.id_experiencia ?? index}
                  icono={<BriefIcon />}
                  onClick={() => {
                    setExperienciaSeleccionada(item);
                    setOpenDetalle(true);
                  }}
                  titulo={<TituloTarjeta>{item.tipo_experiencia}</TituloTarjeta>}
                >
                  <SubtituloTarjeta>{item.cargo}</SubtituloTarjeta>
                  <p className="truncate">{item.institucion_experiencia}</p>

                  <MetaTarjeta>
                    {/* `es_uniautonoma` es el campo que decide el escalafón: el motor solo suma
                        las experiencias marcadas así y con documento aprobado. Estaba solo en el
                        modal de detalle. Mismo dorado que usa allí. */}
                    {item.es_uniautonoma && <ChipTarjeta tono="gold">Uniautónoma</ChipTarjeta>}

                    {/* El escalafón razona en meses y la tarjeta solo mostraba años. */}
                    {meses !== null && <ChipTarjeta>{textoMeses(meses)}</ChipTarjeta>}

                    <span>
                      {anio(item.fecha_inicio)} –{" "}
                      {item.fecha_finalizacion ? anio(item.fecha_finalizacion) : "Actual"}
                    </span>
                  </MetaTarjeta>

                  <div className="mt-2">
                    <EstadoDocumento documentos={item.documentos_experiencia} />
                  </div>
                </TarjetaTrayectoria>
              );
            })}
          </ul>
        )}
      </div>

      {/* MODAL AGREGAR */}
      <CustomDialog
        title="Agregar Experiencia"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      >
        <AgregarExperiencia
          onSuccess={handleExperienciaAgregada}
          onCancelar={() => setOpenAdd(false)}
        />
      </CustomDialog>

      {/* MODAL PRE-EDITAR */}
      <CustomDialog
        title="Editar Experiencia"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <PreExperiencia onSuccess={fetchDatos} />
      </CustomDialog>

      {/* MODAL DETALLE */}
      <CustomDialog
        title="Detalles de la Experiencia"
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
      >
        <VerExperiencia experiencia={experienciaSeleccionada} />
      </CustomDialog>
    </div>
  );
};

export default FormacionExperiencia;