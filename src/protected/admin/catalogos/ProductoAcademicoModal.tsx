import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosConfig";
import { mensajeDeErrorApi } from "../../../utils/erroresApi";
import { InputLabel } from "../../../componentes/formularios/InputLabel";
import TextInput from "../../../componentes/formularios/TextInput";
import InputErrors from "../../../componentes/formularios/InputErrors";
import { ButtonPrimary } from "../../../componentes/formularios/ButtonPrimary";
import { ButtonSecondary } from "../../../componentes/formularios/ButtonSecondary";
import { CheckboxActivo } from "./ControlesCatalogo";
import {
  productoAcademicoSchema,
  type ProductoAcademicoFormInputs,
} from "../../../validaciones/admin/catalogosSchema";
import type { ProductoAcademico } from "../../../types/catalogos";

type Props = {
  /** Registro a editar; ausente o null cuando se está creando. */
  producto?: ProductoAcademico | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const ENDPOINT = import.meta.env.VITE_ENDPOINT_ADMIN_PRODUCTOS_ACADEMICOS;

const ProductoAcademicoModal = ({ producto, onSuccess, onCancel }: Props) => {
  const editando = Boolean(producto);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductoAcademicoFormInputs>({
    resolver: zodResolver(productoAcademicoSchema),
    defaultValues: {
      nombre_producto_academico: producto?.nombre_producto_academico ?? "",
      activo: producto?.activo ?? true,
    },
  });

  const onSubmit = async (data: ProductoAcademicoFormInputs) => {
    try {
      await toast.promise(
        editando
          ? axiosInstance.put(`${ENDPOINT}/${producto!.id_producto_academico}`, data)
          : axiosInstance.post(ENDPOINT, data),
        {
          pending: editando
            ? "Actualizando tipo de producto académico..."
            : "Creando tipo de producto académico...",
          success: editando
            ? "Tipo de producto académico actualizado."
            : "Tipo de producto académico creado.",
          error: {
            render({ data }) {
              return mensajeDeErrorApi(
                data,
                "No se pudo guardar el tipo de producto académico."
              );
            },
            autoClose: 5000,
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error al guardar el tipo de producto académico:", error);
    }
  };

  return (
    // noValidate: sin esto el navegador bloquea el submit con su propio globo y zod nunca
    // alcanza a pintar el mensaje debajo del campo.
    <form
      className="flex flex-col gap-5 p-1"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <InputLabel
          htmlFor="nombre_producto_academico"
          value="Nombre del tipo de producto académico *"
        />
        <TextInput
          id="nombre_producto_academico"
          placeholder="Ej: Artículo científico"
          maxLength={255}
          {...register("nombre_producto_academico")}
        />
        <InputErrors errors={errors} name="nombre_producto_academico" />
      </div>

      <CheckboxActivo
        id="activo_producto"
        registro={register("activo")}
        ayuda="Si lo desmarcas, deja de ofrecerse al registrar producciones académicas, pero las ya registradas conservan su clasificación."
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          <ButtonSecondary value="Cancelar" className="px-8 py-3" />
        </button>
        <ButtonPrimary
          value={editando ? "Guardar cambios" : "Crear tipo"}
          className="px-8"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ProductoAcademicoModal;
