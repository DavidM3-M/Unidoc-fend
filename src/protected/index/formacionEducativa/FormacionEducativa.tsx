import type { EstudioRegistro } from "../../../types/trayectoria";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosConfig";
import EstadoDocumento from "../../../componentes/Estado";
import { AcademicIcono } from "../../../assets/icons/Iconos";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarEstudio from "../../agregar/AgregarEstudio";
import ButtonPreEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import PreEstudio from "../../editar/estudio/pre-estudio";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import VerEstudio from "../../ver/VerEstudio";
import { notificarTrayectoriaActualizada } from "../../../hooks/useTrayectoriaActualizada";
import {
  TarjetaTrayectoria,
  TituloTarjeta,
  SubtituloTarjeta,
  MetaTarjeta,
  ChipTarjeta,
} from "../../../componentes/TarjetaTrayectoria";
import { fechaCorta } from "../../../utils/fechas";

const FormacionEducativa = () => {
  const [estudios, setEstudios] = useState<EstudioRegistro[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openPreEdit, setOpenPreEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [estudioSeleccionado, setEstudioSeleccionado] = useState<EstudioRegistro | null>(null);

  /**
   * Refresca esta tarjeta y, además, avisa a la tarjeta de Hoja de vida.
   *
   * Las barras de puntaje y antigüedad viven en un componente hermano que no se desmonta al
   * agregar un estudio: sin el aviso se quedaban con el valor de la carga inicial hasta recargar
   * la página.
   */
  const refrescarTrayectoria = () => {
    fetchDatos();
    notificarTrayectoriaActualizada();
  };

  const handleEstudioAgregado = () => {
    refrescarTrayectoria(); // vuelve a traer la lista actualizada
    setOpenAdd(false); // cierra el modal
  };

  // Función para cargar los datos desde el servidor o sesionStorage
  const fetchDatos = async () => {
    try {
      // 1. Intentar cargar desde sesionStorage primero
      const cached = sessionStorage.getItem("estudios");
      if (cached) {
        setEstudios(JSON.parse(cached));
      }

      // 2. Hacer petición al servidor dependiendo del rol
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);

      const rol = decoded.rol;
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_ESTUDIOS_DOCENTE,
      };
      const endpoint = ENDPOINTS[rol];

      const response = await axiosInstance.get(endpoint);

      // 3. Actualizar estado y sesionStorage
      if (response.data?.estudios) {
        setEstudios(response.data.estudios);
        sessionStorage.setItem(
          "estudios",
          JSON.stringify(response.data.estudios)
        );
      }
    } catch (error) {
      console.error("Error al cargar estudios:", error);
      // Si hay error, se mantienen los datos de cache (si existían)
    }
  };

  // Llamar la función cuando el componente se monta
  useEffect(() => {
    fetchDatos();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 h-full max-w-[400px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="font-bold text-xl text-slate-900">Formación educativa</h4>
          <div className="flex gap-1">
            <ButtonAgregar onClick={() => setOpenAdd(true)} />
            <ButtonPreEditar onClick={() => setOpenPreEdit(true)} />
          </div>
        </div>

        <div>
          {estudios.length === 0 ? (
            <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
          ) : (
            <ul className="flex flex-col gap-3">
              {estudios.map((item, index) => {
                const graduado = item.graduado === "Si";

                return (
                  <TarjetaTrayectoria
                    key={item.id_estudio ?? index}
                    icono={<AcademicIcono />}
                    onClick={() => {
                      setEstudioSeleccionado(item);
                      setOpenDetalle(true);
                    }}
                    titulo={<TituloTarjeta>{item.tipo_estudio}</TituloTarjeta>}
                  >
                    <SubtituloTarjeta>{item.titulo_estudio}</SubtituloTarjeta>
                    <p className="truncate">{item.institucion}</p>

                    <MetaTarjeta>
                      <ChipTarjeta tono={graduado ? "navy" : "aviso"}>
                        {graduado ? "Graduado" : "En curso"}
                      </ChipTarjeta>

                      {item.titulo_convalidado === "Si" && (
                        <ChipTarjeta>Convalidado</ChipTarjeta>
                      )}

                      {/* `fecha_graduacion` es nullable: un estudio en curso dejaba la línea en
                          blanco y nunca se caía a `posible_fecha_graduacion`, que sí se captura
                          en el formulario. */}
                      {graduado ? (
                        <span>{fechaCorta(item.fecha_graduacion)}</span>
                      ) : (
                        item.posible_fecha_graduacion && (
                          <span>Grado previsto: {fechaCorta(item.posible_fecha_graduacion)}</span>
                        )
                      )}
                    </MetaTarjeta>

                    <div className="mt-2">
                      <EstadoDocumento documentos={item.documentos_estudio} />
                    </div>
                  </TarjetaTrayectoria>
                );
              })}
            </ul>
          )}
        </div>

        {/* MODAL AGREGAR */}
        <CustomDialog
          title="Agregar Estudios"
          open={openAdd}
          onClose={() => setOpenAdd(false)}
        >
          <AgregarEstudio
            onSuccess={handleEstudioAgregado}
            onCancelar={() => setOpenAdd(false)}
          />
        </CustomDialog>

        {/* MODAL PRE-EDITAR */}
        <CustomDialog
          title="Editar Estudios"
          open={openPreEdit}
          onClose={() => setOpenPreEdit(false)}
        >
          <PreEstudio onSuccess={refrescarTrayectoria} />
        </CustomDialog>

        {/* MODAL VER DETALLE */}
        <CustomDialog
          title="Detalles del Estudio"
          open={openDetalle}
          onClose={() => setOpenDetalle(false)}
        >
          <VerEstudio estudio={estudioSeleccionado} />
        </CustomDialog>
      </div>
    </>
  );
};

export default FormacionEducativa;