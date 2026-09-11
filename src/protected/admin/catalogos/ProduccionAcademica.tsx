import { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ChevronRight, Library, PlusCircle } from "lucide-react";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { DataTable2 } from "../../../componentes/tablas/DataTable2";
import CustomDialog from "../../../componentes/CustomDialogForm";
import EliminarBoton from "../../../componentes/EliminarBoton";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";
import { BotonEditar, EstadoBadge } from "./ControlesCatalogo";
import ProductoAcademicoModal from "./ProductoAcademicoModal";
import AmbitoDivulgacionModal from "./AmbitoDivulgacionModal";
import type { AmbitoDivulgacion, ProductoAcademico } from "../../../types/catalogos";

const ENDPOINT_PRODUCTOS = import.meta.env.VITE_ENDPOINT_ADMIN_PRODUCTOS_ACADEMICOS;
const ENDPOINT_AMBITOS = import.meta.env.VITE_ENDPOINT_ADMIN_AMBITOS_DIVULGACION;

/**
 * Catálogo de producción académica: tipos de producto académico y, colgando de cada uno, sus
 * ámbitos de divulgación.
 *
 * La jerarquía es real (un ámbito no existe suelto), pero en vez de mostrar ambas tablas
 * permanentemente lado a lado, los ámbitos se consultan en una modal al hacer clic sobre el
 * tipo de producto: el producto al que pertenecen sale de la fila seleccionada.
 */
const CatalogoProduccionAcademica = () => {
  const [productos, setProductos] = useState<ProductoAcademico[]>([]);
  const [ambitos, setAmbitos] = useState<AmbitoDivulgacion[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [cargandoAmbitos, setCargandoAmbitos] = useState(false);

  // Se guarda el ID y no el objeto: así, al recargar la lista tras un cambio, la selección se
  // resuelve contra los datos frescos y se limpia sola si el producto fue eliminado.
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

  const [modalProducto, setModalProducto] = useState<{
    abierto: boolean;
    producto: ProductoAcademico | null;
  }>({ abierto: false, producto: null });

  const [modalAmbito, setModalAmbito] = useState<{
    abierto: boolean;
    ambito: AmbitoDivulgacion | null;
  }>({ abierto: false, ambito: null });

  // Modal que lista los ámbitos del producto seleccionado. Antes se mostraba en un panel fijo
  // al lado de la tabla de productos; en una modal queda más limpio y no obliga a partir la
  // pantalla en dos tablas permanentes.
  const [modalVerAmbitos, setModalVerAmbitos] = useState(false);

  const seleccionado =
    productos.find((p) => p.id_producto_academico === seleccionadoId) ?? null;

  const fetchProductos = async () => {
    try {
      setCargandoProductos(true);
      const respuesta = await axiosInstance.get(ENDPOINT_PRODUCTOS);
      setProductos(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los tipos de producto académico:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los tipos de producto académico"));
    } finally {
      setCargandoProductos(false);
    }
  };

  const fetchAmbitos = async (idProducto: number) => {
    try {
      setCargandoAmbitos(true);
      const respuesta = await axiosInstance.get(ENDPOINT_AMBITOS, {
        params: { producto_academico_id: idProducto },
      });
      setAmbitos(respuesta.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener los ámbitos de divulgación:", error);
      toast.error(mensajeDeErrorApi(error, "Error al cargar los ámbitos de divulgación"));
    } finally {
      setCargandoAmbitos(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (seleccionadoId === null) {
      setAmbitos([]);
      return;
    }

    fetchAmbitos(seleccionadoId);
  }, [seleccionadoId]);

  const eliminarProducto = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT_PRODUCTOS}/${id}`);
      toast.success("Tipo de producto académico eliminado.");

      // Si se borró el que estaba abierto, el detalle deja de tener sentido.
      if (seleccionadoId === id) {
        setSeleccionadoId(null);
        setModalVerAmbitos(false);
      }
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar el tipo de producto académico:", error);
      // El 409 llega con el detalle de cuántos ámbitos lo bloquean y la sugerencia de inactivarlo.
      toast.error(
        mensajeDeErrorApi(error, "No se pudo eliminar el tipo de producto académico."),
        { autoClose: 6000 }
      );
    }
  }, [seleccionadoId]);

  const eliminarAmbito = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(`${ENDPOINT_AMBITOS}/${id}`);
      toast.success("Ámbito de divulgación eliminado.");

      // Recargar ambas: el conteo de ámbitos del maestro también cambió.
      if (seleccionadoId !== null) fetchAmbitos(seleccionadoId);
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar el ámbito de divulgación:", error);
      toast.error(
        mensajeDeErrorApi(error, "No se pudo eliminar el ámbito de divulgación."),
        { autoClose: 6000 }
      );
    }
  }, [seleccionadoId]);

  const handleProductoGuardado = () => {
    setModalProducto({ abierto: false, producto: null });
    fetchProductos();
  };

  const handleAmbitoGuardado = () => {
    setModalAmbito({ abierto: false, ambito: null });
    if (seleccionadoId !== null) fetchAmbitos(seleccionadoId);
    fetchProductos();
  };

  const columnasProductos = useMemo<ColumnDef<ProductoAcademico>[]>(
    () => [
      {
        accessorKey: "nombre_producto_academico",
        header: "Tipo de producto académico",
        // El nombre es el selector: clic sobre él abre la modal con los ámbitos de ese tipo.
        cell: ({ row }) => {
          const producto = row.original;

          return (
            <button
              type="button"
              onClick={() => {
                setSeleccionadoId(producto.id_producto_academico);
                setModalVerAmbitos(true);
              }}
              className="flex items-center gap-1.5 text-left font-medium text-gray-900 transition-colors hover:text-[#e8740e]"
            >
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#6b7a8d]" />
              <span className="whitespace-normal">
                {producto.nombre_producto_academico}
              </span>
            </button>
          );
        },
      },
      {
        id: "ambitos",
        accessorFn: (fila) => fila.ambito_divulgacions_producto_academico_count ?? 0,
        header: "Ámbitos",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
            {row.original.ambito_divulgacions_producto_academico_count ?? 0}
          </span>
        ),
      },
      {
        id: "estado",
        accessorFn: (fila) => (fila.activo ? "Activo" : "Inactivo"),
        header: "Estado",
        cell: ({ row }) => <EstadoBadge activo={row.original.activo} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BotonEditar
              onClick={() =>
                setModalProducto({ abierto: true, producto: row.original })
              }
            />
            <EliminarBoton
              id={row.original.id_producto_academico}
              onConfirmDelete={eliminarProducto}
            />
          </div>
        ),
      },
    ],
    [eliminarProducto]
  );

  const columnasAmbitos = useMemo<ColumnDef<AmbitoDivulgacion>[]>(
    () => [
      {
        accessorKey: "nombre_ambito_divulgacion",
        header: "Ámbito de divulgación",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.nombre_ambito_divulgacion}
          </span>
        ),
      },
      {
        id: "puntaje",
        accessorFn: (fila) => fila.puntaje ?? 0,
        header: "Puntaje",
        cell: ({ row }) => (
          <span
            className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#c89b14]/10 text-[#8a6c0e]"
            title="Se edita desde Escalafón docente → Puntajes"
          >
            {row.original.puntaje ?? 0}
          </span>
        ),
      },
      {
        id: "usos",
        accessorFn: (fila) => fila.produccion_academicas_ambito_divulgacion_count ?? 0,
        header: "Producciones que lo usan",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
            {row.original.produccion_academicas_ambito_divulgacion_count ?? 0}
          </span>
        ),
      },
      {
        id: "estado",
        accessorFn: (fila) => (fila.activo ? "Activo" : "Inactivo"),
        header: "Estado",
        cell: ({ row }) => <EstadoBadge activo={row.original.activo} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BotonEditar
              onClick={() => setModalAmbito({ abierto: true, ambito: row.original })}
            />
            <EliminarBoton
              id={row.original.id_ambito_divulgacion}
              onConfirmDelete={eliminarAmbito}
            />
          </div>
        ),
      },
    ],
    [eliminarAmbito]
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1700px] mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
            <Library className="h-6 w-6 text-[#e8740e]" />
            Catálogo de producción académica
          </h1>
          <p className="text-sm text-[#6b7a8d]">
            Tipos de producto académico y los ámbitos de divulgación de cada uno
          </p>
        </div>
      </div>

      {/* Tipos de producto académico. Los ámbitos de cada uno se consultan en una modal aparte
          en vez de una tabla fija al lado: con las dos tablas siempre visibles se veía recargado. */}
      <div className="bg-white border border-[rgba(30,58,95,0.09)] rounded-xl shadow-md p-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1e3a5f]">
              Tipos de producto académico
            </h2>
            <p className="text-sm text-[#6b7a8d]">
              Haz clic en un nombre para ver y administrar sus ámbitos de divulgación.
            </p>
          </div>

          <button
            onClick={() => setModalProducto({ abierto: true, producto: null })}
            className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors whitespace-nowrap"
          >
            <PlusCircle className="h-5 w-5" />
            Nuevo tipo
          </button>
        </div>

        <div className="overflow-x-auto">
          <DataTable2
            data={productos}
            columns={columnasProductos}
            loading={cargandoProductos}
            searchPlaceholder="Buscar tipo de producto académico..."
          />
        </div>
      </div>

      {/* Modal: ámbitos del producto seleccionado */}
      {modalVerAmbitos && seleccionado && (
        <CustomDialog
          title={`Ámbitos de «${seleccionado.nombre_producto_academico}»`}
          open={modalVerAmbitos}
          onClose={() => {
            setModalVerAmbitos(false);
            setSeleccionadoId(null);
          }}
          width="1000px"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <p className="text-sm text-[#6b7a8d]">
                Es lo que el aspirante escoge al registrar una producción académica.
              </p>

              <button
                onClick={() => setModalAmbito({ abierto: true, ambito: null })}
                className="inline-flex items-center justify-center gap-2 bg-[#e8740e] hover:bg-[#c2600b] text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-colors whitespace-nowrap"
              >
                <PlusCircle className="h-5 w-5" />
                Nuevo ámbito
              </button>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p>
                Los ámbitos creados desde aquí{" "}
                <span className="font-semibold">no otorgan puntaje</span> en la evaluación
                docente hasta que se actualice la tabla de clasificación por ámbito en el
                backend. Solicita ese ajuste al equipo de desarrollo después de crearlos.
              </p>
            </div>

            <div className="overflow-x-auto">
              <DataTable2
                data={ambitos}
                columns={columnasAmbitos}
                loading={cargandoAmbitos}
                searchPlaceholder="Buscar ámbito de divulgación..."
              />
            </div>
          </div>
        </CustomDialog>
      )}

      {modalProducto.abierto && (
        <CustomDialog
          title={
            modalProducto.producto
              ? "Editar tipo de producto académico"
              : "Nuevo tipo de producto académico"
          }
          open={modalProducto.abierto}
          onClose={() => setModalProducto({ abierto: false, producto: null })}
          width="600px"
        >
          <ProductoAcademicoModal
            producto={modalProducto.producto}
            onSuccess={handleProductoGuardado}
            onCancel={() => setModalProducto({ abierto: false, producto: null })}
          />
        </CustomDialog>
      )}

      {modalAmbito.abierto && seleccionado && (
        <CustomDialog
          title={
            modalAmbito.ambito
              ? "Editar ámbito de divulgación"
              : "Nuevo ámbito de divulgación"
          }
          open={modalAmbito.abierto}
          onClose={() => setModalAmbito({ abierto: false, ambito: null })}
          width="600px"
        >
          <AmbitoDivulgacionModal
            producto={seleccionado}
            ambito={modalAmbito.ambito}
            onSuccess={handleAmbitoGuardado}
            onCancel={() => setModalAmbito({ abierto: false, ambito: null })}
          />
        </CustomDialog>
      )}
    </div>
  );
};

export default CatalogoProduccionAcademica;
