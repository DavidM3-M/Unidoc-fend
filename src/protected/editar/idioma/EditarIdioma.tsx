import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useLanguage } from "../../../context/LanguageContext";
import axiosInstance from "../../../utils/axiosConfig";
import { SelectForm } from "../../../componentes/formularios/SelectForm";
import { SelectFormConId } from "../../../componentes/formularios/SelectFormConId";
import InputErrors from "../../../componentes/formularios/InputErrors";
import TextInput from "../../../componentes/formularios/TextInput";
import { languageSchemaUpdate } from "../../../validaciones/languageSchema";
import { SeccionFormulario } from "../../../componentes/formularios/SeccionFormulario";
import {
  CampoFormulario,
  AccionCampo,
  CampoInformativo,
} from "../../../componentes/formularios/CampoFormulario";
import { PieFormulario } from "../../../componentes/formularios/PieFormulario";
import { AdjuntarArchivo } from "../../../componentes/formularios/AdjuntarArchivo";
import { useArchivoPreview } from "../../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../../types/roles";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../../componentes/formularios/DivForm";
import {
  calcularVigencia,
  formatearFecha,
  nivelSegunPuntaje,
  rangoTotal,
  type ExamenOpcion,
} from "../../../utils/idiomaCertificado";
import { Award } from "lucide-react";
import { LanguageIcon } from "@heroicons/react/24/outline";

type Inputs = {
  idioma: string;
  idioma_catalogo_id?: string;
  institucion_idioma: string;
  examen_idioma_id?: string;
  puntaje_obtenido?: string;
  // Opcional: cuando el examen tiene rangos lo llena el formulario desde el puntaje.
  nivel?: string;
  fecha_certificado: string;
  archivo?: FileList;
};

type Props = {
  idioma: any;
  onSuccess: () => void;
  onCancelar?: () => void;
};

const EditarIdioma = ({ idioma, onSuccess, onCancelar }: Props) => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");
  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;

  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Igual que en AgregarIdioma: el examen/certificación admite texto libre además del catálogo.
  const [examenManual, setExamenManual] = useState(false);
  // El examen completo (rangos + vigencia) para calcular la vista previa del nivel y el
  // vencimiento sin llamadas extra.
  const [examen, setExamen] = useState<ExamenOpcion | null>(null);
  // Igual que en Agregar: el docente registra el puntaje o, si su certificado no lo trae, el
  // nivel directamente.
  const [nivelManual, setNivelManual] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(languageSchemaUpdate),
  });

  const idiomaCatalogoId = watch("idioma_catalogo_id");
  const archivoValue = watch("archivo");
  const { existingFile, setExistingFile } = useArchivoPreview(archivoValue);

  const puntaje = watch("puntaje_obtenido") ?? "";
  const fechaCertificado = watch("fecha_certificado") ?? "";

  const rangos = examen?.rangos ?? [];
  const sinExamen = !examenManual && !examen;
  const puedeDerivar = !examenManual && rangos.length > 0;
  const derivaNivel = puedeDerivar && !nivelManual;
  const nivelDerivado = derivaNivel ? nivelSegunPuntaje(rangos, String(puntaje)) : null;
  const vigencia = calcularVigencia(fechaCertificado, examen?.vigencia_meses);

  useEffect(() => {
    if (derivaNivel) setValue("nivel", nivelDerivado ?? "");
  }, [derivaNivel, nivelDerivado, setValue]);

  useEffect(() => {
    if (!idioma) return;

    setValue("idioma", idioma.idioma || "");
    setValue("institucion_idioma", idioma.institucion_idioma || "");
    setValue("fecha_certificado", idioma.fecha_certificado || "");
    setValue("nivel", idioma.nivel || "");

    if (idioma.puntaje_obtenido !== null && idioma.puntaje_obtenido !== undefined) {
      setValue("puntaje_obtenido", String(idioma.puntaje_obtenido));
    }
    if (idioma.idioma_catalogo_id) {
      setValue("idioma_catalogo_id", String(idioma.idioma_catalogo_id));
    }

    if (idioma.examen_idioma_id) {
      setValue("examen_idioma_id", String(idioma.examen_idioma_id));
      // El objeto completo del examen (rangos y vigencia) no está en el registro: lo entrega
      // `SelectFormConId` vía `onCargado` cuando el catálogo llega. Hasta entonces `examen`
      // queda en null, que es lo correcto.
    } else {
      // Sin id de catálogo (registro viejo o se cargó manual): arranca en modo manual con
      // el texto que ya tenía, en vez de forzar a elegir de nuevo del catálogo.
      setExamenManual(true);
    }

    // Un registro con examen del catálogo pero sin puntaje tiene el nivel autodeclarado: hay que
    // abrir el formulario en ese modo para que el nivel guardado se vea y se pueda cambiar.
    if (
      idioma.examen_idioma_id &&
      (idioma.puntaje_obtenido === null || idioma.puntaje_obtenido === undefined)
    ) {
      setNivelManual(true);
    }

    if (idioma.documentos_idioma && idioma.documentos_idioma.length > 0) {
      const archivo = idioma.documentos_idioma[0];
      setExistingFile({
        url: archivo.archivo_url,
        name: archivo.archivo.split("/").pop() || "Archivo existente",
      });
    }
  }, [idioma, setValue, setExistingFile]);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("idioma", data.idioma);
      formData.append("idioma_catalogo_id", data.idioma_catalogo_id || "");
      formData.append("institucion_idioma", data.institucion_idioma);
      formData.append("examen_idioma_id", data.examen_idioma_id || "");
      formData.append("puntaje_obtenido", data.puntaje_obtenido || "");
      formData.append("nivel", data.nivel || "");
      formData.append("fecha_certificado", data.fecha_certificado || "");

      // === Archivo (solo si el usuario carga uno nuevo) ===
      if (data.archivo && data.archivo.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      // === Endpoints por rol ===
      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_ACTUALIZAR_IDIOMAS_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      // === Petición con toast.promise ===
      const putPromise = axiosInstance.post(
        `${endpoint}/${idioma.id_idioma}`,
        formData
      );

      await toast.promise(putPromise, {
        pending: t("messages.language.updating"),
        success: t("messages.language.updated"),
        error: t("messages.language.updateError"),
      });

      // Callback de éxito
      onSuccess?.();
    } catch (error) {
      console.error("Error en la actualización:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DivForm>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* ============ SECCIÓN 1: idioma y examen ============ */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<LanguageIcon className="w-6 h-6" />}
            titulo="Idioma y examen"
            descripcion="Ambos salen del catálogo que administra la Universidad"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <CampoFormulario
              htmlFor="idioma"
              label="Idioma *"
              error={<InputErrors errors={errors} name="idioma" />}
            >
              <Controller
                name="idioma_catalogo_id"
                control={control}
                render={({ field }) => (
                  <SelectFormConId
                    id="idioma"
                    url="idiomas"
                    value={field.value ?? ""}
                    onChange={(id, opcion) => {
                      field.onChange(id);
                      setValue("idioma", opcion?.nombre || "");
                      setValue("institucion_idioma", "");
                      setValue("examen_idioma_id", "");
                      setValue("puntaje_obtenido", "");
                      setValue("nivel", "");
                      setExamen(null);
                      setNivelManual(false);
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="institucion_idioma"
              label="Examen / Certificación *"
              accion={
                <AccionCampo
                  onClick={() => {
                    setExamenManual((actual) => !actual);
                    setExamen(null);
                    setNivelManual(false);
                    setValue("examen_idioma_id", "");
                    setValue("institucion_idioma", "");
                    setValue("puntaje_obtenido", "");
                    setValue("nivel", "");
                  }}
                >
                  {examenManual ? "Elegir del catálogo" : "No está en la lista"}
                </AccionCampo>
              }
              error={<InputErrors errors={errors} name="institucion_idioma" />}
              ayuda={
                examenManual
                  ? "No está en el catálogo, así que el nivel lo eliges tú y no habrá vigencia automática."
                  : examen
                  ? examen.vigencia_meses
                    ? `${examen.nombre} vence a los ${examen.vigencia_meses} meses.`
                    : `${examen.nombre} no vence.`
                  : "El catálogo lo mantiene la Universidad. Si tu examen no aparece, escríbelo a mano."
              }
            >
              {examenManual ? (
                <TextInput
                  id="institucion_idioma"
                  placeholder="Ej: Alianza Francesa de Popayán"
                  maxLength={150}
                  {...register("institucion_idioma")}
                />
              ) : (
                <Controller
                  name="examen_idioma_id"
                  control={control}
                  render={({ field }) => (
                    <SelectFormConId
                      id="institucion_idioma"
                      url="examenes-idioma"
                      params={{ idioma_catalogo_id: idiomaCatalogoId }}
                      value={field.value ?? ""}
                      disabled={!idiomaCatalogoId}
                      placeholder={
                        idiomaCatalogoId ? "Seleccione una opción" : "Primero elige el idioma"
                      }
                      /* Al abrir para editar, el registro solo trae el id del examen. Aquí se
                         recupera el objeto completo —rangos y vigencia— apenas llega el
                         catálogo. Sin esto el formulario creía que no había examen elegido: el
                         campo de puntaje no se dibujaba y el nivel mostraba "Primero elige el
                         idioma y el examen" con ambos ya seleccionados. */
                      onCargado={(opcionActual) => {
                        if (opcionActual) {
                          setExamen(opcionActual as unknown as ExamenOpcion);
                        }
                      }}
                      onChange={(id, opcion) => {
                        field.onChange(id);
                        setValue("institucion_idioma", opcion?.nombre || "");
                        setValue("puntaje_obtenido", "");
                        setValue("nivel", "");
                        setExamen((opcion as unknown as ExamenOpcion) ?? null);
                        setNivelManual(false);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              )}
            </CampoFormulario>
          </div>
        </div>

        <hr className="col-span-full border-[rgba(30,58,95,0.1)] my-1" />

        {/* ============ SECCIÓN 2: resultado del certificado ============
            Cuatro celdas en posiciones fijas; lo que cambia es el contenido. Ver el comentario
            equivalente en AgregarIdioma. */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<Award size={24} />}
            titulo="Resultado del certificado"
            descripcion="Puntaje, nivel alcanzado, fecha y vigencia"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <CampoFormulario
              htmlFor="puntaje_obtenido"
              label={derivaNivel ? "Puntaje obtenido *" : "Puntaje obtenido"}
              error={<InputErrors errors={errors} name="puntaje_obtenido" />}
              ayuda={
                derivaNivel && rangoTotal(rangos)
                  ? `Entre ${rangoTotal(rangos)}, según los rangos que ${examen?.nombre} tiene cargados.`
                  : undefined
              }
            >
              {derivaNivel ? (
                <TextInput
                  id="puntaje_obtenido"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 7.5"
                  {...register("puntaje_obtenido")}
                />
              ) : (
                <CampoInformativo>
                  {sinExamen
                    ? "Depende del examen que elijas arriba"
                    : "Este examen no registra puntaje numérico"}
                </CampoInformativo>
              )}
            </CampoFormulario>

            <CampoFormulario
              htmlFor="nivel"
              label={derivaNivel || sinExamen ? "Nivel MCER" : "Nivel MCER *"}
              accion={
                puedeDerivar ? (
                  <AccionCampo
                    onClick={() => {
                      setNivelManual((actual) => !actual);
                      setValue("puntaje_obtenido", "");
                      setValue("nivel", "");
                    }}
                  >
                    {nivelManual ? "Tengo el puntaje" : "Mi certificado no trae puntaje"}
                  </AccionCampo>
                ) : undefined
              }
              error={
                !sinExamen && !derivaNivel ? <InputErrors errors={errors} name="nivel" /> : undefined
              }
              ayuda={
                sinExamen
                  ? "Se calcula cuando registres el puntaje"
                  : derivaNivel
                  ? "Lo calcula el sistema desde tu puntaje. No se elige a mano."
                  : !examenManual && examen && rangos.length === 0
                  ? `${examen.nombre} todavía no tiene rangos de puntaje cargados, así que el nivel se elige a mano.`
                  : "Elige el nivel que aparece en tu certificado."
              }
            >
              {sinExamen ? (
                <CampoInformativo>Primero elige el idioma y el examen</CampoInformativo>
              ) : derivaNivel ? (
                <CampoInformativo tono="dato">
                  {nivelDerivado ?? (
                    <span className="font-medium text-[#9aa7b5]">— sin nivel —</span>
                  )}
                  {nivelDerivado && (
                    <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#e9f5ee] text-[#2f7d54] px-2 py-0.5">
                      calculado
                    </span>
                  )}
                </CampoInformativo>
              ) : (
                <SelectForm
                  id="nivel"
                  register={register("nivel")}
                  url="niveles-idioma"
                  data_url="nivel_idioma"
                />
              )}
            </CampoFormulario>

            <CampoFormulario
              htmlFor="fecha_certificado"
              label="Fecha de certificado *"
              error={<InputErrors errors={errors} name="fecha_certificado" />}
              ayuda="La fecha de emisión que aparece en el documento."
            >
              <TextInput
                type="date"
                id="fecha_certificado"
                {...register("fecha_certificado")}
              />
            </CampoFormulario>

            <CampoFormulario
              htmlFor="vigencia"
              label="Vigencia"
              ayuda={
                vigencia && examen?.vigencia_meses
                  ? `${examen.vigencia_meses} meses desde la emisión, según el catálogo.`
                  : undefined
              }
            >
              {vigencia ? (
                <CampoInformativo tono={vigencia.vencido ? "alerta" : "ok"}>
                  {vigencia.vencido
                    ? `Venció el ${formatearFecha(vigencia.venceEl)}`
                    : `Vigente hasta ${formatearFecha(vigencia.venceEl)}`}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                      vigencia.vencido
                        ? "bg-[#fbeaea] text-[#b3413a]"
                        : "bg-[#e9f5ee] text-[#2f7d54]"
                    }`}
                  >
                    {vigencia.vencido ? "vencido" : "vigente"}
                  </span>
                </CampoInformativo>
              ) : (
                <CampoInformativo>
                  {sinExamen
                    ? "Depende del examen y de la fecha"
                    : examenManual || !examen?.vigencia_meses
                    ? "Este examen no declara vencimiento"
                    : "Elige la fecha del certificado"}
                </CampoInformativo>
              )}
            </CampoFormulario>
          </div>
        </div>

        <hr className="col-span-full border-[rgba(30,58,95,0.1)] my-1" />

        {/* ============ ARCHIVO ============ */}
        <div className="col-span-full">
          <AdjuntarArchivo id="archivo" register={register("archivo")} />
          <InputErrors errors={errors} name="archivo" />
          <MostrarArchivo file={existingFile} />
        </div>

        <PieFormulario
          onCancelar={onCancelar}
          textoGuardar="Guardar cambios"
          enviando={isSubmitting}
        />
      </form>
    </DivForm>
  );
};

export default EditarIdioma;
