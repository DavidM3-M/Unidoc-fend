/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BuildResult {
  payload: FormData | Record<string, unknown>;
  isFormData: boolean;
}

export default function buildConvocatoriaPayload(
  datos: Record<string, any>,
  requisitosExperiencia: Record<string, number> | number[] | null,
  requisitosIdiomasSelected: string[],
  archivo: File | null
): BuildResult {
  const tipoFinal = datos.tipo === 'Otro' && datos.tipo_otro ? datos.tipo_otro : datos.tipo;

  const base: Record<string, unknown> = {};
  if (datos.numero_convocatoria) base.numero_convocatoria = datos.numero_convocatoria;
  if (datos.nombre_convocatoria) base.nombre_convocatoria = datos.nombre_convocatoria;
  base.tipo = tipoFinal;
  if (datos.tipo_otro) base.tipo_otro = datos.tipo_otro;
  if (datos.periodo_academico) base.periodo_academico = datos.periodo_academico;
  if (datos.cargo_solicitado) base.cargo_solicitado = datos.cargo_solicitado;
  if (datos.tipo_cargo_id) base.tipo_cargo_id = String(datos.tipo_cargo_id);
  // Facultad: prefer explicit facultad_otro, otherwise send facultad_id when numeric
  if (typeof datos.facultad_otro !== 'undefined' && datos.facultad_otro !== '') {
    base.facultad_otro = datos.facultad_otro;
  } else if (datos.facultad && datos.facultad !== 'otro') {
    if (!isNaN(Number(datos.facultad))) base.facultad_id = String(datos.facultad);
    else base.facultad_otro = String(datos.facultad);
  }
  if (datos.cursos) base.cursos = datos.cursos;
  if (datos.tipo_vinculacion) base.tipo_vinculacion = datos.tipo_vinculacion;
  if (typeof datos.personas_requeridas !== 'undefined') base.personas_requeridas = Number(datos.personas_requeridas);
  if (datos.fecha_publicacion) base.fecha_publicacion = datos.fecha_publicacion;
  if (datos.fecha_cierre) base.fecha_cierre = datos.fecha_cierre;
  if (datos.fecha_inicio_contrato) base.fecha_inicio_contrato = datos.fecha_inicio_contrato;
  // perfil: prefer id, then explicit otro, then texto libre
  if (datos.perfil_profesional_id) base.perfil_profesional_id = String(datos.perfil_profesional_id);
  else if (datos.perfil_profesional_otro) base.perfil_profesional_otro = datos.perfil_profesional_otro;
  else if (datos.perfil_profesional) base.perfil_profesional_otro = datos.perfil_profesional;
    // Estado de la convocatoria (backend expects this field)
    if (datos.estado_convocatoria) base.estado_convocatoria = datos.estado_convocatoria;
  // experiencia: prefer id, otherwise build/accept a 'fecha' representation
  if (datos.experiencia_requerida_id) {
    base.experiencia_requerida_id = String(datos.experiencia_requerida_id);
  } else {
    // Normalize or compute a fecha in YYYY-MM-DD format
    const toYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];
    const parseToDateString = (val: any): string | null => {
      if (val === undefined || val === null || val === '') return null;
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
      const parsed = Date.parse(String(val));
      if (isNaN(parsed)) return null;
      return toYYYYMMDD(new Date(parsed));
    };

    // 1) explicit fecha field
    const explicit = parseToDateString(datos.experiencia_requerida_fecha);
    if (explicit) {
      base.experiencia_requerida_fecha = explicit;
    } else if (typeof datos.experiencia_requerida_cantidad !== 'undefined' && datos.experiencia_requerida_cantidad !== null && datos.experiencia_requerida_cantidad !== '') {
      // 2) cantidad + unidad -> compute date by subtracting from today
      const cantidadNum = Number(datos.experiencia_requerida_cantidad);
      if (!isNaN(cantidadNum) && cantidadNum >= 0) {
        const unidadRaw = (datos.experiencia_requerida_unidad || '').toString().toLowerCase();
        const d = new Date();
        if (unidadRaw.startsWith('a')) { // Años / años / año
          d.setFullYear(d.getFullYear() - cantidadNum);
        } else if (unidadRaw.startsWith('m')) { // Meses
          d.setMonth(d.getMonth() - cantidadNum);
        } else if (unidadRaw.startsWith('s')) { // Semanas
          d.setDate(d.getDate() - cantidadNum * 7);
        } else if (unidadRaw.startsWith('d')) { // Días
          d.setDate(d.getDate() - cantidadNum);
        } else {
          // fallback: treat as days
          d.setDate(d.getDate() - cantidadNum);
        }
        base.experiencia_requerida_fecha = toYYYYMMDD(d);
      }
    } else {
      // 3) try to parse any free-text experiencia_requerida as a date
      const parsed = parseToDateString(datos.experiencia_requerida);
      if (parsed) base.experiencia_requerida_fecha = parsed;
    }
  }

  // contexto/referencia (cargo/rol) para la experiencia: enviar como referencia_experiencia
  // Intentar primero con experiencia_requerida_contexto_text, luego otras variantes
  if (datos.experiencia_requerida_contexto_text) {
    base.referencia_experiencia = datos.experiencia_requerida_contexto_text;
  } else if (datos.referencia_experiencia) {
    base.referencia_experiencia = datos.referencia_experiencia;
  } else if (typeof datos.experiencia_requerida_contexto !== 'undefined' && datos.experiencia_requerida_contexto !== null && datos.experiencia_requerida_contexto !== '') {
    base.referencia_experiencia = String(datos.experiencia_requerida_contexto);
  }
  
  // Duplicar como experiencia_requerida_contexto (legacy) para compatibilidad
  if (base.referencia_experiencia) {
    base.experiencia_requerida_contexto = base.referencia_experiencia;
  }
  // cantidad y unidad de experiencia: enviar ambas (backend espera cantidad_experiencia y unidad_experiencia)
  // IMPORTANTE: La unidad solo se envía si hay cantidad (validación del backend)
  const tieneQuantidad = typeof datos.experiencia_requerida_cantidad !== 'undefined' && datos.experiencia_requerida_cantidad !== null && datos.experiencia_requerida_cantidad !== '';
  if (tieneQuantidad) {
    base.experiencia_requerida_cantidad = String(datos.experiencia_requerida_cantidad);
    // Duplicar como cantidad_experiencia (nombre preferido por backend)
    base.cantidad_experiencia = String(datos.experiencia_requerida_cantidad);
    
    // Solo enviar unidad si hay cantidad
    if (datos.experiencia_requerida_unidad) {
      base.experiencia_requerida_unidad = datos.experiencia_requerida_unidad;
      // Duplicar como unidad_experiencia (nombre preferido por backend)
      base.unidad_experiencia = datos.experiencia_requerida_unidad;
    }
  }
  if (datos.descripcion) base.descripcion = datos.descripcion;
  if (datos.solicitante) base.solicitante = datos.solicitante;
  if (datos.aprobaciones) base.aprobaciones = datos.aprobaciones;
  if (Array.isArray(datos.aprobaciones_list) && datos.aprobaciones_list.length > 0) base.aprobaciones_list = datos.aprobaciones_list;
  
  // Ensure we do not send legacy/update-only field names to the create endpoint
  // Map any free-text perfil -> perfil_profesional_otro (already handled above), then remove raw keys
    // Some backend variants expect the older field names `perfil_profesional` and `experiencia_requerida`.
    // To maximize compatibility, populate those legacy keys when we have the newer equivalents.
    if (typeof base['perfil_profesional_otro'] !== 'undefined' && base['perfil_profesional_otro'] !== '') {
      // duplicate into legacy `perfil_profesional` string field so validations expecting it pass
      base.perfil_profesional = String(base.perfil_profesional_otro);
    }
    // If we computed an experiencia_requerida_fecha, also set experiencia_requerida (legacy) to that value
    if (typeof base['experiencia_requerida_fecha'] !== 'undefined' && base['experiencia_requerida_fecha'] !== null) {
      base.experiencia_requerida = String(base.experiencia_requerida_fecha);
    }


  // Arrays
  // Compatibility: backend may expect 'avales_establecidos' as the field name for approvals
  if (Array.isArray(datos.aprobaciones_list) && datos.aprobaciones_list.length > 0) base.avales_establecidos = datos.aprobaciones_list;
  // requisitos_experiencia can be either an array of ids (legacy) or an object { tipo: cantidad }
  if (Array.isArray(requisitosExperiencia) && requisitosExperiencia.length > 0) base.requisitos_experiencia = requisitosExperiencia.map(String);
  else if (requisitosExperiencia && typeof requisitosExperiencia === 'object' && !Array.isArray(requisitosExperiencia)) base.requisitos_experiencia = requisitosExperiencia;
  if (Array.isArray(requisitosIdiomasSelected) && requisitosIdiomasSelected.length > 0) base.requisitos_idiomas = requisitosIdiomasSelected;

  // If there's a file, build FormData
  if (archivo) {
    const fd = new FormData();
    Object.entries(base).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((item) => fd.append(`${k}[]`, String(item)));
      } else if (typeof v === 'object' && v !== null) {
        // object -> append as requisitos_experiencia[key]=value
        Object.entries(v as Record<string, unknown>).forEach(([subk, subv]) => {
          fd.append(`${k}[${subk}]`, String(subv));
        });
      } else {
        fd.append(k, String(v));
      }
    });
    fd.append('archivo', archivo, archivo.name);
    fd.append('_method', 'POST');
    return { payload: fd, isFormData: true };
  }

  // Otherwise return JSON-friendly object
  // backend expects arrays as repeated fields for form-data; for JSON we send arrays directly
  return { payload: base, isFormData: false };
}
