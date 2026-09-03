import axiosInstance from "../../../utils/axiosConfig";
import { useEffect, useState } from "react";
import EstadoDocumento from "../../../componentes/Estado";
import { BeakerIcons } from "../../../assets/icons/Iconos";
import {
  TarjetaTrayectoria,
  TituloTarjeta,
  SubtituloTarjeta,
  MetaTarjeta,
  ChipTarjeta,
} from "../../../componentes/TarjetaTrayectoria";
import { fechaCorta } from "../../../utils/fechas";
import Cookies from "js-cookie";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import ButtonAgregar from "../../../componentes/formularios/buttons/ButtonAgregar";
import ButtonEditar from "../../../componentes/formularios/buttons/ButtonPreEditar";
import CustomDialog from "../../../componentes/CustomDialogForm";
import AgregarProduccion from "../../agregar/AgregarProduccion";
import ButtonAgregarVacio from "../../../componentes/formularios/buttons/ButtonAgregarVacio";
import PreProduccion from "../../editar/produccion/pre-produccion";
import VerProduccion from "../../ver/VerProduccion";
import { notificarTrayectoriaActualizada } from "../../../hooks/useTrayectoriaActualizada";

const FormacionProduccion = () => {
  const [produccion, setProduccion] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [produccionSeleccionado, setProduccionSeleccionado] = useState<any | null>(null);

  /**
   * Refresca esta tarjeta y, además, avisa a la tarjeta de Hoja de vida.
   *
   * Las barras de puntaje y antigüedad viven en un componente hermano que no se desmonta al
   * agregar una producción: sin el aviso se quedaban con el valor de la carga inicial hasta recargar
   * la página.
   */
  const refrescarTrayectoria = () => {
    fetchDatos();
    notificarTrayectoriaActualizada();
  };

  const handleProduccionAgregada = () => {
    refrescarTrayectoria();
    setOpenAdd(false);
  };

  const fetchDatos = async () => {
    try {
      const cachedData = sessionStorage.getItem("producciones");
      if (cachedData) {
        setProduccion(JSON.parse(cachedData));
      }

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_OBTENER_PRODUCCIONES_DOCENTE,
      };

      const response = await axiosInstance.get(ENDPOINTS[rol]);

      if (response.data?.producciones) {
        const producciones = response.data.producciones;
        setProduccion(producciones);
        sessionStorage.setItem("producciones", JSON.stringify(producciones));
      }
    } catch (error) {
      console.error("Error al cargar produccion:", error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  if (!produccion) {
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
        <h4 className="font-bold text-xl text-slate-900">Formación Producción</h4>
        <div className="flex gap-1">
          <ButtonAgregar onClick={() => setOpenAdd(true)} />
          <ButtonEditar onClick={() => setOpenEdit(true)} />
        </div>
      </div>

      {/* Listado */}
      <div>
        {produccion.length === 0 ? (
          <ButtonAgregarVacio onClick={() => setOpenAdd(true)} />
        ) : (
          <ul className="flex flex-col gap-3">
            {produccion.map((item, index) => {
              const autores = Number(item.numero_autores) || 0;

              return (
                <TarjetaTrayectoria
                  key={item.id_produccion_academica ?? index}
                  icono={<BeakerIcons />}
                  onClick={() => {
                    setProduccionSeleccionado(item);
                    setOpenDetalle(true);
                  }}
                  titulo={<TituloTarjeta>{item.titulo}</TituloTarjeta>}
                >
                  {/* El ámbito de divulgación es el valor del catálogo del Administrador y el
                      que otorga el puntaje; `medio_divulgacion` es texto que escribe el docente
                      ("Revista UNAM"). Aquí el del catálogo va primero. En este renglón se
                      pintaba `item.rol`, una columna que no existe en `produccion_academicas`:
                      cada tarjeta arrastraba un párrafo vacío. */}
                  <SubtituloTarjeta>
                    {item.ambito_divulgacion_produccion_academica?.nombre_ambito_divulgacion ??
                      "Ámbito sin registrar"}
                  </SubtituloTarjeta>
                  <p className="truncate">{item.medio_divulgacion}</p>

                  <MetaTarjeta>
                    <ChipTarjeta>
                      {autores} {autores === 1 ? "autor" : "autores"}
                    </ChipTarjeta>
                    <span>{fechaCorta(item.fecha_divulgacion)}</span>
                  </MetaTarjeta>

                  <div className="mt-2">
                    <EstadoDocumento documentos={item.documentos_produccion_academica} />
                  </div>
                </TarjetaTrayectoria>
              );
            })}
          </ul>
        )}
      </div>

      {/* MODAL AGREGAR */}
      <CustomDialog
        title="Agregar Producción"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      >
        <AgregarProduccion
          onSuccess={handleProduccionAgregada}
          onCancelar={() => setOpenAdd(false)}
        />
      </CustomDialog>

      {/* MODAL EDITAR */}
      <CustomDialog
        title="Editar Producción"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <PreProduccion onSuccess={refrescarTrayectoria} />
      </CustomDialog>

      {/* MODAL DETALLE */}
      <CustomDialog
        title="Detalles de producción académica"
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
      >
        <VerProduccion produccion={produccionSeleccionado} />
      </CustomDialog>
    </div>
  );
};

export default FormacionProduccion;