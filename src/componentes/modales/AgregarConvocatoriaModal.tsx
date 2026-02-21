/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, FileText, Briefcase, GraduationCap, CheckCircle, Plus, Edit } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import buildConvocatoriaPayload from "../../utils/buildConvocatoriaPayload";

interface ConvocatoriaNueva {
  numero_convocatoria: string;
  nombre_convocatoria: string;
  tipo: string;
  tipo_otro?: string;
  periodo_academico: string;
  cargo_solicitado: string;
  tipo_cargo_id?: number | string;
  facultad: string;
  facultad_otro?: string;
  cursos: string;
  tipo_vinculacion: string;
  personas_requeridas: number;
  estado_convocatoria: string;
  fecha_publicacion: string;
  fecha_cierre: string;
  fecha_inicio_contrato: string;
  descripcion?: string;
  perfil_profesional?: string;
  perfil_profesional_otro?: string;
  experiencia_requerida?: string;
  requisitos_experiencia?: Record<string, number>;
  experiencia_requerida_cantidad?: number | string;
  experiencia_requerida_unidad?: string;
  experiencia_requerida_contexto_text?: string;
  perfil_profesional_id?: number | string;
  experiencia_requerida_id?: number | string;
  solicitante: string;
  aprobaciones: string;
  aprobaciones_list?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConvocatoriaAgregada?: (convocatoria: ConvocatoriaNueva & { id_convocatoria: number }) => void;
  // Optional edit mode
  editId?: number | string;
  initialDatos?: Partial<ConvocatoriaNueva>;
  onConvocatoriaActualizada?: (convocatoria: ConvocatoriaNueva & { id_convocatoria: number }) => void;
}

const AgregarConvocatoriaModal = ({ isOpen, onClose, onConvocatoriaAgregada, editId, initialDatos, onConvocatoriaActualizada }: Props) => {
  const [datos, setDatos] = useState<ConvocatoriaNueva>({
    numero_convocatoria: '',
    nombre_convocatoria: '',
    tipo: '',
    tipo_otro: '',
    periodo_academico: '',
    cargo_solicitado: '',
    tipo_cargo_id: '',
    facultad: '',
    cursos: '',
    tipo_vinculacion: '',
    personas_requeridas: 1,
    estado_convocatoria: 'Abierta',
    fecha_publicacion: '',
    fecha_cierre: '',
    fecha_inicio_contrato: '',
    descripcion: '',
    perfil_profesional: '',
    facultad_otro: '',
    requisitos_experiencia: {},
    experiencia_requerida_cantidad: '',
    experiencia_requerida_unidad: 'anos',
    experiencia_requerida_contexto_text: '',
    perfil_profesional_id: '',
    experiencia_requerida: '',
    experiencia_requerida_id: '',
    solicitante: '',
    aprobaciones: ''
  });
  const [tiposCargo, setTiposCargo] = useState<any[]>([]);
  const [perfilesProfesionales, setPerfilesProfesionales] = useState<any[]>([]);
  const [allowedAvales, setAllowedAvales] = useState<string[]>([]);
  const [constantesPerfiles, setConstantesPerfiles] = useState<string[]>([]);
  const [perfilSelectValue, setPerfilSelectValue] = useState<string>('');
  const [facultades, setFacultades] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);
  const isEdit = Boolean(editId);
  
  const [requisitosIdiomasSelected, setRequisitosIdiomasSelected] = useState<string[]>([]);
  const [archivo, setArchivo] = useState<File | { name: string; url: string; isExisting: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Prefill when editing
  useEffect(() => {
    if (!initialDatos) return;
    const normalizeDate = (v: any) => {
      if (!v) return v;
      if (typeof v === 'string') {
        // If already in YYYY-MM-DD or starts with that, take first 10 chars
        const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
        if (m) return m[1];
        // Fallback: try Date parse
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        return v;
      }
      if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
      return v;
    };

    const prefilled: any = { ...initialDatos } as any;
    prefilled.fecha_publicacion = normalizeDate(initialDatos.fecha_publicacion);
    prefilled.fecha_cierre = normalizeDate(initialDatos.fecha_cierre);
    prefilled.fecha_inicio_contrato = normalizeDate(initialDatos.fecha_inicio_contrato);
    // Normalize tipo_cargo_id variants that may come from backend
    prefilled.tipo_cargo_id = initialDatos.tipo_cargo_id ?? (initialDatos as any).id_tipo_cargo ?? (initialDatos as any).idTipoCargo ?? initialDatos.tipo_cargo_id ?? '';

    // Preserve perfil fields and set select display accordingly
    // Determine perfilSelectValue so the select shows the current profile when editing
    let profileSelect = '';
    if (typeof initialDatos.perfil_profesional_id !== 'undefined' && initialDatos.perfil_profesional_id !== null && String(initialDatos.perfil_profesional_id).trim() !== '') {
      profileSelect = `id:${initialDatos.perfil_profesional_id}`;
      prefilled.perfil_profesional_id = initialDatos.perfil_profesional_id;
    } else if (initialDatos.perfil_profesional_otro) {
      profileSelect = 'otro';
      prefilled.perfil_profesional_otro = initialDatos.perfil_profesional_otro;
    } else if (initialDatos.perfil_profesional) {
      profileSelect = `const:${initialDatos.perfil_profesional}`;
      prefilled.perfil_profesional = initialDatos.perfil_profesional;
    }

    setDatos(prev => ({ ...prev, ...prefilled } as ConvocatoriaNueva));
    setPerfilSelectValue(profileSelect);
    
    // Prefill años de experiencia: map cantidad_experiencia -> experiencia_requerida_cantidad
    if ((initialDatos as any).cantidad_experiencia !== undefined) {
      prefilled.experiencia_requerida_cantidad = (initialDatos as any).cantidad_experiencia;
    }
    // Map unidad_experiencia -> experiencia_requerida_unidad
    if ((initialDatos as any).unidad_experiencia !== undefined) {
      const unidad = (initialDatos as any).unidad_experiencia;
      // Normalize backend unit names to modal format
      let mappedUnidad = unidad;
      if (typeof unidad === 'string') {
        if (unidad.toLowerCase().startsWith('a')) mappedUnidad = 'anos';
        else if (unidad.toLowerCase().startsWith('m')) mappedUnidad = 'meses';
        else if (unidad.toLowerCase().startsWith('s')) mappedUnidad = 'semanas';
        else if (unidad.toLowerCase().startsWith('d')) mappedUnidad = 'dias';
      }
      prefilled.experiencia_requerida_unidad = mappedUnidad;
    }
    // Prefill referencia_experiencia -> experiencia_requerida_contexto_text
    if ((initialDatos as any).referencia_experiencia !== undefined) {
      prefilled.experiencia_requerida_contexto_text = (initialDatos as any).referencia_experiencia;
    }
    
    setDatos(prev => ({ ...prev, ...prefilled } as ConvocatoriaNueva));
    
    // Prefill idiomas if present in initialDatos (support multiple possible property names)
    const idiomasFromInitial = (initialDatos as any).idiomas_list ?? (initialDatos as any).requisitos_idiomas ?? (initialDatos as any).requisitosIdiomas ?? (initialDatos as any).requisitos_idiomas_list ?? null;
    if (Array.isArray(idiomasFromInitial)) {
      // Handle array of objects { idioma, nivel } or strings
      const formatted = idiomasFromInitial.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.idioma) return `${item.idioma}:${item.nivel || ''}`.trim();
        return item;
      }).filter(Boolean);
      setRequisitosIdiomasSelected(formatted);
    }
    // Prefill aprobaciones_list into datos (datos already merged above, but ensure it's an array)
    if (initialDatos.aprobaciones_list && Array.isArray(initialDatos.aprobaciones_list)) {
      setDatos(prev => ({ ...prev, aprobaciones_list: initialDatos.aprobaciones_list, aprobaciones: (initialDatos.aprobaciones_list || []).join(', ') } as ConvocatoriaNueva));
    }
    
    // Prefill archivo from documentos_convocatoria if present
    if ((initialDatos as any).documentos_convocatoria && Array.isArray((initialDatos as any).documentos_convocatoria) && (initialDatos as any).documentos_convocatoria.length > 0) {
      const doc = (initialDatos as any).documentos_convocatoria[0];
      // Store existing file URL for display
      if (doc.url || doc.archivo) {
        setArchivo({
          name: (doc.archivo ? doc.archivo.split('/').pop() : 'archivo.pdf'),
          url: doc.url,
          isExisting: true
        });
      }
    }
  }, [initialDatos]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setArchivo(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const fieldCls = (field: string, base: string) => `${base} ${validationErrors[field] ? 'border-red-500 ring-2 ring-red-100' : ''}`;
  

  const handleChange = (campo: keyof ConvocatoriaNueva, valor: string | number) => {
    // Si el tipo cambia a Administrativo, limpiar campos de docencia
    if (campo === 'tipo' && valor === 'Administrativo') {
      setDatos(prev => ({ ...prev, [campo]: valor, facultad: '', cursos: '' }));
      return;
    }

    setDatos(prev => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    // Determinar si mostrar campos de docencia (no mostrar en Administrativo)
    const mostrarCamposDocentes = datos.tipo !== 'Administrativo';
    // Requerir facultad/cursos sólo si es Docente
    // NOTE: facultad is optional in the UI; backend enforces required_without:facultad_id. Do not force it here.
    const mostrarTipoOtro = datos.tipo === 'Otro';

    // Validación básica con resaltado de campos
    const errors: Record<string, boolean> = {};
    const missingLabels: string[] = [];
    const perfilOk = !!(datos.perfil_profesional_id || datos.perfil_profesional || datos.perfil_profesional_otro);

    if (!datos.numero_convocatoria) { errors.numero_convocatoria = true; missingLabels.push('Número de Convocatoria'); }
    if (!datos.nombre_convocatoria) { errors.nombre_convocatoria = true; missingLabels.push('Nombre de la Convocatoria'); }
    if (!datos.tipo) { errors.tipo = true; missingLabels.push('Tipo'); }
    if (!datos.fecha_publicacion) { errors.fecha_publicacion = true; missingLabels.push('Fecha de Publicación'); }
    if (!datos.fecha_cierre) { errors.fecha_cierre = true; missingLabels.push('Fecha de Cierre'); }
    if (!datos.fecha_inicio_contrato) { errors.fecha_inicio_contrato = true; missingLabels.push('Fecha de Inicio de Contrato'); }
    if (!datos.periodo_academico) { errors.periodo_academico = true; missingLabels.push('Período Académico'); }
    const tipoCargoOk = typeof datos.tipo_cargo_id !== 'undefined' && datos.tipo_cargo_id !== null && String(datos.tipo_cargo_id).trim() !== '';
    if (!tipoCargoOk) { errors.tipo_cargo_id = true; missingLabels.push('Tipo de cargo'); }
    if (!datos.tipo_vinculacion) { errors.tipo_vinculacion = true; missingLabels.push('Tipo de Vinculación'); }
    if (!datos.descripcion) { errors.descripcion = true; missingLabels.push('Descripción'); }
    if (!perfilOk) { errors.perfil_profesional = true; missingLabels.push('Perfil Profesional'); }
    const experienciaOk = !!(datos.experiencia_requerida_id || datos.experiencia_requerida || datos.experiencia_requerida_contexto_text || (typeof datos.experiencia_requerida_cantidad !== 'undefined' && datos.experiencia_requerida_cantidad !== ''));
    if (!experienciaOk) { errors.experiencia_requerida = true; missingLabels.push('Experiencia requerida'); }
    if (!datos.solicitante) { errors.solicitante = true; missingLabels.push('Solicitante'); }
    const aprobacionesList = Array.isArray(datos.aprobaciones_list)
      ? datos.aprobaciones_list
      : (typeof datos.aprobaciones === 'string' && datos.aprobaciones.trim() ? datos.aprobaciones.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    const aprobacionesOk = aprobacionesList.length > 0;
    if (!aprobacionesOk) { errors.aprobaciones = true; missingLabels.push('Aprobaciones'); }
    // facultad is optional on the client; backend will validate presence when necessary
    if (mostrarTipoOtro && !datos.tipo_otro) { errors.tipo_otro = true; missingLabels.push('Especifique el tipo'); }

    if (missingLabels.length > 0) {
      // mark validation errors
      setValidationErrors(errors);
      toast.error('Faltan campos obligatorios: ' + missingLabels.join(', '));
      return;
    }
    // clear previous errors
    setValidationErrors({});

    setGuardando(true);
    try {
      // Preparar tipo final (si seleccionó Otro, usar tipo_otro)

      // Don't send existing files to the backend (isExisting flag means file already exists)
      const archivoParaPayload = (archivo instanceof File) ? archivo : null;
      const built = buildConvocatoriaPayload(datos, datos.requisitos_experiencia ?? null, requisitosIdiomasSelected, archivoParaPayload);

      // payload prepared (no debug logging in production)

      // If editId present => update flow
      if (editId) {
        const url = `/talentoHumano/actualizar-convocatoria/${editId}`;
        if (built.isFormData) {
          const fd = built.payload as FormData;
          fd.append('_method', 'PUT');
          const resp = await axiosInstance.post(url, fd as any);
          toast.success('Convocatoria actualizada correctamente');
          if (onConvocatoriaActualizada) onConvocatoriaActualizada(resp.data.convocatoria);
        } else {
          // send as PUT with JSON
          const resp = await axiosInstance.put(url, built.payload as any);
          toast.success('Convocatoria actualizada correctamente');
          if (onConvocatoriaActualizada) onConvocatoriaActualizada(resp.data.convocatoria);
        }
        onClose();
      } else {
        const response = await axiosInstance.post('/talentoHumano/crear-convocatoria', built.payload as any);
        toast.success('Convocatoria creada correctamente');
        if (onConvocatoriaAgregada) {
          onConvocatoriaAgregada(response.data.convocatoria);
        }
        onClose();
      }

      // Resetear formulario
      setDatos({
        numero_convocatoria: '',
        nombre_convocatoria: '',
        tipo: '',
        tipo_otro: '',
        periodo_academico: '',
        cargo_solicitado: '',
        tipo_cargo_id: '',
        facultad: '',
        facultad_otro: '',
        cursos: '',
        tipo_vinculacion: '',
        personas_requeridas: 1,
        estado_convocatoria: 'Abierta',
        fecha_publicacion: '',
        fecha_cierre: '',
        fecha_inicio_contrato: '',
        descripcion: '',
        perfil_profesional: '',
        perfil_profesional_otro: '',
        perfil_profesional_id: '',
        experiencia_requerida: '',
        requisitos_experiencia: {},
        experiencia_requerida_contexto_text: '',
        experiencia_requerida_id: '',
        solicitante: '',
        aprobaciones: '',
        aprobaciones_list: []
      });
      setRequisitosIdiomasSelected([]);
      setArchivo(null);
    } catch (error: unknown) {
      console.error('Error al crear convocatoria:', error);
      let errorMessage = 'Error al crear la convocatoria';
      const errorObj = error as any;
      
      if (errorObj?.response?.data?.message) {
        errorMessage = errorObj.response.data.message;
      }
      
      // Mostrar detalles de validación si existen
      const validationErrors = errorObj?.response?.data?.errors;
      if (validationErrors && typeof validationErrors === 'object') {
        const errorDetails = Object.entries(validationErrors)
          .map(([field, messages]: [string, any]) => {
            const msgs = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgs.join(', ')}`;
          })
          .join('\n');
        
        if (errorDetails) {
          console.error('Detalles de validación:', errorDetails);
          errorMessage = `${errorMessage}\n\nDetalles:\n${errorDetails}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setGuardando(false);
    }
  };

  // Construir los campos de 'Información del Cargo' en orden dinámico
  const cargoFields = (() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mostrarCamposDocentes = datos.tipo !== 'Administrativo';
    const nodes: React.ReactNode[] = [];

    nodes.push(
      <div key="tipo-cargo">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cargo *</label>
        <select
          value={datos.tipo_cargo_id}
          onChange={(e) => {
            const v = e.target.value;
            const parsed = /^\d+$/.test(v) ? Number(v) : v;
            handleChange('tipo_cargo_id', parsed);
          }}
          className={fieldCls('tipo_cargo_id', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500')}
          required
        >
          <option value="">Seleccione tipo de cargo</option>
          {tiposCargo.map((t: any) => (
            <option key={t.id_tipo_cargo} value={t.id_tipo_cargo}>{t.nombre_tipo_cargo}{t.es_administrativo ? ' (Administrativo)' : ''}</option>
          ))}
        </select>
      </div>
    );

    // Cargo solicitado (campo visible para edición)
    nodes.push(
      <div key="cargo-solicitado">
        <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Solicitado</label>
        <input
          type="text"
          value={datos.cargo_solicitado || ''}
          onChange={(e) => handleChange('cargo_solicitado', e.target.value)}
          className={fieldCls('cargo_solicitado', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500')}
          placeholder="Ej: Administrador financiero"
        />
      </div>
    );

    if (mostrarCamposDocentes) {
      nodes.push(
        <div key="facultad">
          <label className="block text-sm font-medium text-gray-700 mb-2">Facultad (opcional)</label>
          <select
            value={datos.facultad}
            onChange={(e) => handleChange('facultad', e.target.value)}
            className={fieldCls('facultad', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500')}
          >
            <option value="">Seleccione una facultad</option>
            <option value="otro">Otra (especificar)</option>
            {facultades.map((f: any) => (
              <option key={f.id_facultad} value={f.id_facultad}>{f.nombre_facultad}</option>
            ))}
          </select>
          {datos.facultad === 'otro' && (
            <div className="mt-2">
              <input
                type="text"
                value={datos.facultad_otro || ''}
                onChange={(e) => handleChange('facultad_otro', e.target.value)}
                className={fieldCls('facultad_otro', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500')}
                placeholder="Especifique la facultad"
              />
            </div>
          )}
        </div>
      );

      nodes.push(
        <div key="cursos">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cursos (opcional)</label>
          <input
            type="text"
            value={datos.cursos}
            onChange={(e) => handleChange('cursos', e.target.value)}
            className={fieldCls('cursos', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500')}
            placeholder="Cursos relacionados"
          />
        </div>
      );
    }

    // Vinculación, plazas y periodo siempre aparecen (pero se ordenan después de facultad/cursos if present)
    nodes.push(
      <div key="tipo-vinculacion">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vinculación *</label>
        <select
          value={datos.tipo_vinculacion}
          onChange={(e) => handleChange('tipo_vinculacion', e.target.value)}
          className={fieldCls('tipo_vinculacion', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500')}
          required
        >
          <option value="">Seleccionar tipo</option>
          <option value="Tiempo Completo">Tiempo Completo</option>
          <option value="Medio Tiempo">Medio Tiempo</option>
          <option value="Contrato">Contrato</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
    );

    nodes.push(
      <div key="plazas">
        <label className="block text-sm font-medium text-gray-700 mb-2">Plazas Disponibles *</label>
        <input
          type="number"
          value={datos.personas_requeridas}
          onChange={(e) => handleChange('personas_requeridas', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="1"
          min="1"
          required
        />
      </div>
    );

    nodes.push(
      <div key="periodo">
        <label className="block text-sm font-medium text-gray-700 mb-2">Período Académico *</label>
        <input
          type="text"
          value={datos.periodo_academico}
          onChange={(e) => handleChange('periodo_academico', e.target.value)}
          className={fieldCls('periodo_academico', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500')}
          placeholder="Ej: 2024-1"
          required
        />
      </div>
    );

    return nodes;
  })();

  const handleClose = () => {
    if (!guardando) {
      onClose();
    }
  };

  const handlePerfilSelectChange = (e: any) => {
    const val: string = e.target.value;
    setPerfilSelectValue(val);
    if (val.startsWith('id:')) {
      const id = val.split(':')[1];
      const parsed = /^\d+$/.test(id) ? Number(id) : id;
      setDatos(prev => ({ ...prev, perfil_profesional_id: parsed, perfil_profesional: '', perfil_profesional_otro: '' }));
    } else if (val.startsWith('const:')) {
      const name = val.split(':')[1];
      setDatos(prev => ({ ...prev, perfil_profesional_id: '', perfil_profesional: name, perfil_profesional_otro: '' }));
    } else if (val === 'otro') {
      setDatos(prev => ({ ...prev, perfil_profesional_id: '', perfil_profesional: '', perfil_profesional_otro: '' }));
    } else {
      setDatos(prev => ({ ...prev, perfil_profesional_id: '', perfil_profesional: '', perfil_profesional_otro: '' }));
    }
  };

  const toggleAprobacion = (aval: string) => {
    setDatos(prev => {
      const exists = prev.aprobaciones_list && prev.aprobaciones_list.includes(aval);
      const nextList = exists ? (prev.aprobaciones_list || []).filter((a: string) => a !== aval) : ([...(prev.aprobaciones_list || []), aval]);
      // toggle aprobaciones list
      return { ...prev, aprobaciones_list: nextList, aprobaciones: nextList.join(', ') } as any;
    });
  };

  const toggleIdioma = (nivel: string) => {
    setRequisitosIdiomasSelected(prev => prev.includes(nivel) ? prev.filter(x => x !== nivel) : [...prev, nivel]);
  };

  const handleArchivoChange = (e: any) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setArchivo(null);
      return;
    }
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Solo pdf/doc/docx.');
      e.currentTarget.value = '';
      return;
    }
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      toast.error('El archivo es demasiado grande. Máximo 10MB.');
      e.currentTarget.value = '';
      return;
    }
    setArchivo(file);
  };

  // Cargar opciones necesarias (tipos de cargo, perfiles, experiencias)
  useEffect(() => {
    const cargar = async () => {
      // Cargar cada endpoint de forma individual para evitar que un 404 bloquee todo
      try {
        // Use the backend controller ConvocatoriaController::obtenerTiposCargo
        // Endpoint: GET /talentoHumano/obtener-tipos-cargo
        const tiposRes = await axiosInstance.get('/talentoHumano/obtener-tipos-cargo').catch((err) => err?.response || null);
          const perfilesRes = await axiosInstance.get('/talentoHumano/opciones-perfiles-profesionales').catch(() => null);
          const constantesRes = await axiosInstance.get('/constantes/perfiles-profesionales').catch(() => null);
        const facultadesRes = await axiosInstance.get('/talentoHumano/opciones-facultades').catch(() => null);

        if (tiposRes && tiposRes.status === 200) {
          // normalize possible shapes: { tipos_cargo: [...] } or direct array
          const raw = tiposRes.data?.tipos_cargo || tiposRes.data || [];
          const normalized = (Array.isArray(raw) ? raw : []).map((t: any) => ({
            id_tipo_cargo: t.id_tipo_cargo ?? t.id ?? t.idTipoCargo ?? t.id_tipo,
            nombre_tipo_cargo: t.nombre_tipo_cargo ?? t.nombre ?? t.nombreTipo ?? t.nombre_tipo,
            es_administrativo: typeof t.es_administrativo !== 'undefined' ? Boolean(t.es_administrativo) : !!t.esAdministrativo
          }));
          setTiposCargo(normalized);
        } else {
          // If backend returned 401/403, let user know; otherwise use fallback
          if (tiposRes && (tiposRes.status === 401 || tiposRes.status === 403)) {
            toast.warn('No autorizado para obtener tipos de cargo. Verifica permisos o sesión.');
          } else {
            console.warn('No se pudieron obtener tipos de cargo; usando fallback local');
          }
          const fallback = [
            'Profesor Titular',
            'Profesor Asociado',
            'Profesor Asistente',
            'Instructor',
            'Profesor Cátedra',
            'Secretario Académico',
            'Coordinador de Programa',
            'Asistente Administrativo',
            'Jefe de Departamento',
            'Decano',
          ].map((nombre, idx) => ({ id_tipo_cargo: idx + 1, nombre_tipo_cargo: nombre, es_administrativo: /Administrativo|Secretario|Jefe|Decano/i.test(nombre) }));
          setTiposCargo(fallback);
        }

        if (perfilesRes && perfilesRes.status === 200) setPerfilesProfesionales(perfilesRes.data.perfiles_profesionales || []);
        else setPerfilesProfesionales([]);

        if (constantesRes && constantesRes.status === 200) setConstantesPerfiles(constantesRes.data.perfiles_profesionales || []);
        else setConstantesPerfiles([]);

        // experienciasRequeridas removed — not used in the modal UI

        if (facultadesRes && facultadesRes.status === 200) setFacultades(facultadesRes.data.facultades || []);
        else setFacultades([]);
        // Cargar avales permitidos (constantes)
        const avalesRes = await axiosInstance.get('/constantes/aprobaciones').catch(() => null);
        // Build avales list (fallback if request fails) and exclude 'Decanato'
        const fetchedAvales: string[] = avalesRes && avalesRes.status === 200 ? (avalesRes.data.aprobaciones || []) : ['Coordinador','Talento Humano','Vicerrectoría','Rectoría'];
        const filteredAvales = fetchedAvales.filter((a: string) => a !== 'Decanato');
        setAllowedAvales(filteredAvales);
      } catch (err) {
        console.error('Error cargando opciones del modal:', err);
      }
    };
    cargar();
  }, []);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-r ${isEdit ? 'from-orange-600 to-orange-700' : 'from-green-600 to-green-700'} text-white px-6 py-4 flex justify-between items-center shadow-md z-10`}>
          <div className="flex items-center gap-3">
            {isEdit ? <Edit size={28} /> : <Plus size={28} />}
            <div>
              <h2 className="text-2xl font-bold">{isEdit ? 'Editar Convocatoria' : 'Agregar Nueva Convocatoria'}</h2>
              <p className={`text-sm ${isEdit ? 'text-orange-100' : 'text-green-100'}`}>{isEdit ? 'Actualice los campos necesarios' : 'Complete todos los campos requeridos'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={guardando}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-green-600" />
                Información Básica
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Convocatoria *</label>
                  <input
                    type="text"
                    value={datos.numero_convocatoria}
                    onChange={(e) => handleChange('numero_convocatoria', e.target.value)}
                    className={fieldCls('numero_convocatoria', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500')}
                    placeholder="Ej: CONV-2024-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Convocatoria *</label>
                  <input
                    type="text"
                    value={datos.nombre_convocatoria}
                    onChange={(e) => handleChange('nombre_convocatoria', e.target.value)}
                    className={fieldCls('nombre_convocatoria', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500')}
                    placeholder="Nombre completo de la convocatoria"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                  <select
                    value={datos.tipo}
                    onChange={(e) => handleChange('tipo', e.target.value)}
                    className={fieldCls('tipo', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500')}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Docente">Docente</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Otro">Otro</option>
                  </select>
                    {datos.tipo === 'Otro' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Especifique el tipo</label>
                        <input
                          type="text"
                          value={datos.tipo_otro}
                          onChange={(e) => handleChange('tipo_otro', e.target.value)}
                          className={fieldCls('tipo_otro', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500')}
                          placeholder="Especifique el tipo de convocatoria"
                          required
                        />
                      </div>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={datos.estado_convocatoria}
                    onChange={(e) => handleChange('estado_convocatoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Abierta">Abierta</option>
                    <option value="Cerrada">Cerrada</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información del Cargo */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={24} className="text-blue-600" />
                Información del Cargo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cargoFields}
              </div>
            </div>

            {/* Información del Solicitante */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-orange-600" />
                Información del Solicitante
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solicitante *</label>
                  <input
                    type="text"
                    value={datos.solicitante}
                    onChange={(e) => handleChange('solicitante', e.target.value)}
                    className={fieldCls('solicitante', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500')}
                    placeholder="Nombre del solicitante"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aprobaciones *</label>
                  <div className={`flex flex-wrap gap-2 ${validationErrors.aprobaciones ? 'ring-2 ring-red-100 border-red-500 rounded-md p-1' : ''}`}>
                    {allowedAvales.map((aval) => {
                      const active = datos.aprobaciones_list && datos.aprobaciones_list.includes(aval);
                      return (
                        <button
                          key={aval}
                          type="button"
                          onClick={() => toggleAprobacion(aval)}
                          className={
                            `px-3 py-1 rounded-full border text-sm transition-colors duration-150 ` +
                            (active
                              ? 'bg-orange-500 text-white border-transparent'
                              : 'bg-white text-gray-700 border-gray-300')
                          }
                        >
                          {aval}
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" value={datos.aprobaciones} />
                </div>
              </div>
            </div>

            

            {/* Fechas Importantes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={24} className="text-purple-600" />
                Fechas Importantes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Publicación *</label>
                  <input
                    type="date"
                    value={datos.fecha_publicacion}
                    onChange={(e) => handleChange('fecha_publicacion', e.target.value)}
                    className={fieldCls('fecha_publicacion', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Cierre *</label>
                  <input
                    type="date"
                    value={datos.fecha_cierre}
                    onChange={(e) => handleChange('fecha_cierre', e.target.value)}
                    className={fieldCls('fecha_cierre', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio de Contrato *</label>
                  <input
                    type="date"
                    value={datos.fecha_inicio_contrato}
                    onChange={(e) => handleChange('fecha_inicio_contrato', e.target.value)}
                    className={fieldCls('fecha_inicio_contrato', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={20} />
                Descripción General *
              </h4>
              <textarea
                value={datos.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className={fieldCls('descripcion', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500')}
                rows={4}
                placeholder="Describe la convocatoria..."
                required
              />
            </div>

            {/* Perfil Profesional */}
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
              <h4 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                <GraduationCap size={20} />
                Perfil Profesional *
              </h4>
              <select
                value={perfilSelectValue}
                onChange={handlePerfilSelectChange}
                className={fieldCls('perfil_profesional', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500')}
                required
              >
                <option value="">Seleccione un perfil profesional</option>
                {perfilesProfesionales.map((p: any) => (
                  <option key={`id:${p.id_perfil_profesional}`} value={`id:${p.id_perfil_profesional}`}>{p.nombre_perfil}{p.descripcion ? ` - ${p.descripcion}` : ''}</option>
                ))}
                {constantesPerfiles
                  .filter(name => name && !perfilesProfesionales.some((p:any) => p.nombre_perfil === name))
                  .map((name) => (
                    <option key={`const:${name}`} value={`const:${name}`}>{name}</option>
                  ))}
                {/* Añadir opción 'otro' sólo si no la provee el backend */}
                {!constantesPerfiles.some(n => n?.toLowerCase() === 'otro') && !perfilesProfesionales.some((p:any) => p.nombre_perfil?.toLowerCase() === 'otro') && (
                  <option value="otro">Otro</option>
                )}
              </select>

              {(() => {
                const isOther = perfilSelectValue === 'otro' ||
                  (perfilSelectValue.startsWith('const:') && perfilSelectValue.split(':')[1].toLowerCase() === 'otro') ||
                  (perfilSelectValue.startsWith('id:') && (() => {
                    const id = perfilSelectValue.split(':')[1];
                    const found = perfilesProfesionales.find((p:any) => String(p.id_perfil_profesional) === String(id));
                    return !!found && found.nombre_perfil?.toLowerCase() === 'otro';
                  })());
                return isOther ? (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Especifique perfil profesional</label>
                    <input
                      type="text"
                      value={datos.perfil_profesional_otro || ''}
                      onChange={(e) => setDatos(prev => ({ ...prev, perfil_profesional_otro: e.target.value }))}
                      className={fieldCls('perfil_profesional_otro', 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500')}
                      placeholder="Nombre del perfil profesional"
                    />
                  </div>
                ) : null;
              })()}
            </div>

            
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Cantidad de Experiencia (opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <input
                    type="number"
                    min={0}
                    value={datos.experiencia_requerida_cantidad as any || ''}
                    onChange={(e) => setDatos(prev => ({ ...prev, experiencia_requerida_cantidad: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Ej: 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
                  <select
                    value={datos.experiencia_requerida_unidad}
                    onChange={(e) => setDatos(prev => ({ ...prev, experiencia_requerida_unidad: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="anos">Años</option>
                    <option value="meses">Meses</option>
                    <option value="semanas">Semanas</option>
                    <option value="dias">Días</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referencia (contexto/cargo)</label>
                  <input
                    type="text"
                    placeholder="Cargo o contexto (ej: Profesor de tiempo completo)"
                    value={datos.experiencia_requerida_contexto_text || ''}
                    onChange={(e) => setDatos(prev => ({ ...prev, experiencia_requerida_contexto_text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Requisitos de Idiomas (opcional)</h4>
              <div className="flex flex-wrap gap-3">
                {['A1','A2','B1','B2','C1','C2'].map((nivel) => (
                  <label
                    key={nivel}
                    onClick={() => toggleIdioma(nivel)}
                    className={`px-3 py-1 border rounded-full cursor-pointer select-none transition-colors transition-transform duration-200 ease-in-out transform ${requisitosIdiomasSelected.includes(nivel) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'} active:scale-95`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={requisitosIdiomasSelected.includes(nivel)}
                      onChange={() => toggleIdioma(nivel)}
                      aria-label={`Seleccionar nivel ${nivel}`}
                    />
                    {nivel}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Documento adjunto (opcional)</h4>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-gray-400 transition-colors bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                    <Plus size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Arrastra el archivo aquí o haz clic para seleccionar</div>
                    <div className="text-xs text-gray-500">Aceptado: PDF, DOC, DOCX. Tamaño máximo 10MB.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {archivo ? (
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-700">{archivo.name}</div>
                      {archivo instanceof File && (
                        <div className="text-xs text-gray-500">{formatBytes(archivo.size)}</div>
                      )}
                      {!(archivo instanceof File) && !((archivo as any).isExisting) ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setArchivo(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                        >Eliminar</button>
                      ) : (archivo instanceof File) ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setArchivo(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                        >Eliminar</button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setArchivo(null); }}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                        >Cambiar</button>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Ningún archivo seleccionado</div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => { handleArchivoChange(e); }}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={guardando}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className={`px-6 py-2 ${isEdit ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50`}
          >
            {guardando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle size={16} />
            )}
            {guardando ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar cambios' : 'Crear Convocatoria')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarConvocatoriaModal;