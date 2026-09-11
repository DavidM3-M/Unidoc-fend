import { zodResolver } from "@hookform/resolvers/zod";
import { languageSchema } from "../../validaciones/languageSchema";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import TextInput from "../../componentes/formularios/TextInput";
import InputErrors from "../../componentes/formularios/InputErrors";
import { SelectForm } from "../../componentes/formularios/SelectForm";
import { SelectFormConId } from "../../componentes/formularios/SelectFormConId";
import { AdjuntarArchivo } from "../../componentes/formularios/AdjuntarArchivo";
import { useArchivoPreview } from "../../hooks/ArchivoPreview";
import { MostrarArchivo } from "../../componentes/formularios/MostrarArchivo";
import { RolesValidos } from "../../types/roles";
import axiosInstance from "../../utils/axiosConfig";
import { jwtDecode } from "jwt-decode";
import DivForm from "../../componentes/formularios/DivForm";
import { SeccionFormulario } from "../../componentes/formularios/SeccionFormulario";
import {
  CampoFormulario,
  AccionCampo,
  CampoInformativo,
} from "../../componentes/formularios/CampoFormulario";
import { PieFormulario } from "../../componentes/formularios/PieFormulario";
import {
  calcularVigencia,
  formatearFecha,
  nivelSegunPuntaje,
  rangoTotal,
  type ExamenOpcion,
} from "../../utils/idiomaCertificado";
import { useEffect, useState } from "react";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { Award } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

type Inputs = {
  idioma: string;
  idioma_catalogo_id?: string;
  institucion_idioma: string;
  examen_idioma_id?: string;
  puntaje_obtenido?: string;
  // Opcional en el tipo porque cuando el examen tiene rangos lo llena el propio formulario a
  // partir del puntaje; el schema exige uno u otro (ver `exigirNivelOPuntaje`).
  nivel?: string;
  fecha_certificado: string;
  archivo: FileList;
};

type Props = {
  onSuccess: (data: Inputs) => void;
  onCancelar?: () => void;
};

const AgregarIdioma = ({ onSuccess, onCancelar }: Props) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(languageSchema),
  });

  const idiomaCatalogoId = watch("idioma_catalogo_id");

  // El examen/certificación sí admite texto libre (catálogo pequeño y curado por el Admin, pero
  // no cubre cualquier examen regional/menos común) — a diferencia de "Idioma", que es
  // estrictamente del catálogo.
  const [examenManual, setExamenManual] = useState(false);
  // Guarda el examen completo (con sus rangos y vigencia), no solo el id: con eso el formulario
  // calcula la vista previa del nivel y el vencimiento sin pedirle nada más al servidor.
  const [examen, setExamen] = useState<ExamenOpcion | null>(null);
  // No todo certificado trae el puntaje numérico; algunos solo dicen "B2". Con esto el docente
  // registra lo que tenga: el puntaje (mejor dato, el nivel sale solo) o el nivel directamente.
  const [nivelManual, setNivelManual] = useState(false);

  const archivoValue = watch("archivo");
  const { existingFile } = useArchivoPreview(archivoValue);

  const puntaje = watch("puntaje_obtenido") ?? "";
  const fechaCertificado = watch("fecha_certificado") ?? "";

  // Hay tres situaciones y de ellas depende todo lo que se muestra abajo:
  // - `sinExamen`: todavía no se eligió nada, no hay nada que preguntar sobre el certificado.
  // - `derivaNivel`: el examen tiene rangos y el docente va a dar el puntaje → el nivel se calcula.
  // - resto: el nivel lo elige el docente (examen a mano, examen sin rangos, o él lo prefiere así).
  const rangos = examen?.rangos ?? [];
  const sinExamen = !examenManual && !examen;
  const puedeDerivar = !examenManual && rangos.length > 0;
  const derivaNivel = puedeDerivar && !nivelManual;
  const nivelDerivado = derivaNivel ? nivelSegunPuntaje(rangos, String(puntaje)) : null;
  const vigencia = calcularVigencia(fechaCertificado, examen?.vigencia_meses);

  // El nivel derivado viaja en el formulario para que el resumen sea coherente, pero el
  // servidor lo vuelve a calcular al guardar: nunca se confía en este valor.
  useEffect(() => {
    if (derivaNivel) setValue("nivel", nivelDerivado ?? "");
  }, [derivaNivel, nivelDerivado, setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("idioma", data.idioma);
      formData.append("idioma_catalogo_id", data.idioma_catalogo_id || "");
      formData.append("institucion_idioma", data.institucion_idioma);
      formData.append("examen_idioma_id", data.examen_idioma_id || "");
      formData.append("puntaje_obtenido", data.puntaje_obtenido || "");
      formData.append("nivel", data.nivel || "");
      formData.append("fecha_certificado", data.fecha_certificado || "");
      formData.append("archivo", data.archivo?.[0] || "");

      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode<{ rol: RolesValidos }>(token);
      const rol = decoded.rol;

      const ENDPOINTS = {
        Aspirante: import.meta.env.VITE_ENDPOINT_CREAR_IDIOMAS_ASPIRANTE,
        Docente: import.meta.env.VITE_ENDPOINT_CREAR_IDIOMAS_DOCENTE,
        Administrativo: import.meta.env.VITE_ENDPOINT_CREAR_IDIOMAS_DOCENTE,
      };

      const endpoint = ENDPOINTS[rol];

      await toast.promise(axiosInstance.post(endpoint, formData), {
        pending: t("messages.language.adding"),
        success: t("messages.language.added"),
        error: t("messages.language.addError"),
      });

      onSuccess(data);
    } catch (error) {
      console.error("Error en el envío:", error);
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
                      // Cambiar de idioma invalida el examen ya elegido y todo lo que colgaba
                      // de él (puntaje y nivel derivado).
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

            Las cuatro celdas —Puntaje, Nivel, Fecha y Vigencia— ocupan siempre las mismas
            posiciones. Antes aparecían y desaparecían según el examen elegido, así que "Fecha
            de certificado" saltaba de columna mientras el docente llenaba el formulario. Ahora
            lo que cambia es el contenido: cuando un dato no aplica, en su lugar va una caja que
            explica por qué. */}
        <div className="col-span-full">
          <SeccionFormulario
            icono={<Award size={24} />}
            titulo="Resultado del certificado"
            descripcion="Puntaje, nivel alcanzado, fecha y vigencia"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {/* Puntaje: solo cuando el examen del catálogo tiene rangos con los que derivar. */}
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

            {/* Nivel: calculado cuando hay puntaje, elegido a mano cuando no. */}
            <CampoFormulario
              htmlFor="nivel"
              label={derivaNivel || sinExamen ? "Nivel MCER" : "Nivel MCER *"}
              accion={
                // Solo tiene sentido ofrecer el cambio cuando de verdad se puede derivar.
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
          textoGuardar="Agregar idioma"
          enviando={isSubmitting}
        />
      </form>
    </DivForm>
  );
};

export default AgregarIdioma;
