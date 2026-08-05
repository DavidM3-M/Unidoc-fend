import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Cookies from 'js-cookie';

// ─── Types ────────────────────────────────────────────────────────────────────
type DocumentoAdjunto = { id_documento?: number; archivo_url?: string; url?: string; archivo?: string };

export interface AspiranteParaPDF {
  id: number;
  datos_personales: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    tipo_identificacion?: string;
    numero_identificacion: string;
    genero?: string;
    fecha_nacimiento?: string;
    estado_civil?: string;
    email?: string;
    municipio?: string;
    departamento?: string;
    foto_perfil_url?: string;
  };
  informacion_contacto?: {
    telefono?: string;
    celular?: string;
    direccion?: string;
    barrio?: string;
    correo_alterno?: string;
  };
  eps?: { nombre_eps?: string };
  rut?: { numero_rut?: string };
  idiomas?: Array<{ idioma: string; nivel: string }>;
  experiencias?: Array<{
    cargo: string;
    empresa: string;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion?: string;
    documentos_experiencia?: Array<DocumentoAdjunto>;
    documentosExperiencia?: Array<DocumentoAdjunto>;
  }>;
  estudios?: Array<{
    titulo: string;
    institucion: string;
    nivel_educativo: string;
    fecha_inicio: string;
    fecha_fin?: string;
    documentos_estudio?: Array<DocumentoAdjunto>;
    documentosEstudio?: Array<DocumentoAdjunto>;
  }>;
  produccion_academica?: Array<{ titulo: string; tipo?: string; fecha?: string; numero_autores?: number; medio_divulgacion?: string; fecha_divulgacion?: string }>;
  aptitudes?: Array<{ nombre: string }>;
  postulaciones?: Array<{ convocatoriaPostulacion?: { titulo: string } }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchImageAsBase64(url: string): Promise<string | null> {
  // Strategy 1: fetch with auth token
  try {
    const token = Cookies.get('token');
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    if (response.ok) {
      const blob = await response.blob();
      return await blobToBase64(blob);
    }
  } catch { /* try next strategy */ }

  // Strategy 2: fetch without credentials (public storage)
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return await blobToBase64(blob);
    }
  } catch { /* try next strategy */ }

  // Strategy 3: load via Image element + canvas (bypasses some CORS restrictions)
  try {
    return await imageElementToBase64(url);
  } catch { /* give up */ }

  return null;
}

function blobToBase64(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

function imageElementToBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    // Timeout after 5 seconds
    setTimeout(() => resolve(null), 5000);
    img.src = url;
  });
}

function formatFecha(fecha?: string): string {
  if (!fecha) return '—';
  try {
    const [year, month, day] = fecha.split('-');
    if (!year) return fecha;
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const m = parseInt(month || '1', 10);
    return `${day ? day + ' ' : ''}${meses[(m - 1) % 12]} ${year}`;
  } catch {
    return fecha;
  }
}

function nivelIdiomaLabel(nivel: string): string {
  const map: Record<string, string> = {
    basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado',
    nativo: 'Nativo', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2', a1: 'A1', a2: 'A2',
  };
  return map[nivel?.toLowerCase()] ?? nivel ?? '—';
}

function calcularDuracion(inicio?: string, fin?: string): string {
  if (!inicio) return '';
  const fechaInicio = new Date(inicio);
  const fechaFin = fin ? new Date(fin) : new Date();
  if (isNaN(fechaInicio.getTime())) return '';
  let meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaFin.getMonth() - fechaInicio.getMonth());
  if (meses < 0) meses = 0;
  const anios = Math.floor(meses / 12);
  const mesesResto = meses % 12;
  if (anios > 0 && mesesResto > 0) return `${anios} año${anios > 1 ? 's' : ''} ${mesesResto} mes${mesesResto > 1 ? 'es' : ''}`;
  if (anios > 0) return `${anios} año${anios > 1 ? 's' : ''}`;
  if (mesesResto > 0) return `${mesesResto} mes${mesesResto > 1 ? 'es' : ''}`;
  return 'Menos de 1 mes';
}

function safe(val?: string | null, fallback = '—'): string {
  if (val === undefined || val === null || val === 'undefined' || val.trim() === '') return fallback;
  return val;
}

function nombreCompleto(d: AspiranteParaPDF['datos_personales']): string {
  return [d.primer_nombre, d.segundo_nombre, d.primer_apellido, d.segundo_apellido]
    .filter(Boolean)
    .join(' ');
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildHojaVidaHTML(asp: AspiranteParaPDF, fotoBase64: string | null): string {
  const dp = asp.datos_personales;
  const ic = asp.informacion_contacto;
  const nombre = nombreCompleto(dp);

  const fotoHTML = fotoBase64
    ? `<img src="${fotoBase64}" alt="foto" crossorigin="anonymous" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.18);" />`
    : `<div style="width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;border:4px solid rgba(255,255,255,0.6);box-shadow:0 4px 16px rgba(0,0,0,0.18);"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>`;

  const sectionTitle = (text: string) =>
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #6366f1;">
      <div style="width:4px;height:16px;background:#6366f1;border-radius:2px;flex-shrink:0;"></div>
      <span style="font-size:11px;font-weight:700;color:#312e81;text-transform:uppercase;letter-spacing:1.2px;">${text}</span>
    </div>`;

  const infoRow = (label: string, value?: string) =>
    value
      ? `<tr>
          <td style="color:#6b7280;font-size:11px;padding:3px 8px 3px 0;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="color:#1f2937;font-size:11px;padding:3px 0;font-weight:500;">${value}</td>
        </tr>`
      : '';

  const tag = (text: string, color = '#e0e7ff', textColor = '#3730a3') =>
    `<span style="background:${color};color:${textColor};font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;display:inline-block;margin:2px;">${text}</span>`;

  // ── Datos Personales rows ──
  const datosRows = [
    infoRow('Identificación:', `${dp.tipo_identificacion ? dp.tipo_identificacion + ' ' : ''}${dp.numero_identificacion}`),
    infoRow('Género:', dp.genero),
    infoRow('Nacimiento:', formatFecha(dp.fecha_nacimiento)),
    infoRow('Estado civil:', dp.estado_civil),
    infoRow('Municipio:', [dp.municipio, dp.departamento].filter(Boolean).join(', ')),
    infoRow('E-mail:', dp.email),
    infoRow('E-mail alterno:', ic?.correo_alterno),
    infoRow('Teléfono:', ic?.telefono),
    infoRow('Celular:', ic?.celular),
    infoRow('Dirección:', ic?.direccion ? [ic.direccion, ic.barrio].filter(Boolean).join(', ') : undefined),
    infoRow('EPS:', asp.eps?.nombre_eps),
    infoRow('RUT:', asp.rut?.numero_rut),
  ].join('');

  // ── Idiomas ──
  const idiomasHTML = (asp.idiomas?.length ?? 0) > 0
    ? `<div style="margin-bottom:20px;">
        ${sectionTitle('Idiomas')}
        <div>
          ${asp.idiomas!.map(i =>
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f3f4f6;">
              <span style="font-size:11px;color:#1f2937;font-weight:600;">${safe(i.idioma)}</span>
              ${tag(nivelIdiomaLabel(i.nivel), '#d1fae5', '#065f46')}
            </div>`
          ).join('')}
        </div>
      </div>`
    : '';

  // ── Aptitudes ──
  const aptitudesHTML = (asp.aptitudes?.length ?? 0) > 0
    ? `<div style="margin-bottom:20px;">
        ${sectionTitle('Aptitudes')}
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${asp.aptitudes!.map(a => tag(a.nombre)).join('')}
        </div>
      </div>`
    : '';

  // ── Postulaciones ──
  const postulacionesHTML = (asp.postulaciones?.length ?? 0) > 0
    ? `<div style="margin-bottom:20px;">
        ${sectionTitle('Convocatorias')}
        <ul style="margin:0;padding-left:14px;">
          ${asp.postulaciones!.map(p =>
            `<li style="font-size:11px;color:#374151;padding:2px 0;">${p.convocatoriaPostulacion?.titulo ?? '—'}</li>`
          ).join('')}
        </ul>
      </div>`
    : '';

  // ── Experiencias ──
  const experienciasHTML = (asp.experiencias?.length ?? 0) > 0
    ? `<div style="margin-bottom:24px;">
        ${sectionTitle('Experiencia Laboral')}
        ${asp.experiencias!.map(exp => {
          const duracion = calcularDuracion(exp.fecha_inicio, exp.fecha_fin);
          return `<div style="margin-bottom:12px;padding:10px;background:#f8fafc;border-radius:8px;border-left:3px solid #6366f1;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="flex:1;">
                <div style="font-size:12px;font-weight:700;color:#1e1b4b;">${safe(exp.cargo)}</div>
                <div style="font-size:11px;color:#4f46e5;font-weight:600;">${safe(exp.empresa)}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px;">
                <div style="font-size:10px;color:#6b7280;">
                  ${formatFecha(exp.fecha_inicio)} – ${exp.fecha_fin ? formatFecha(exp.fecha_fin) : 'Actual'}
                </div>
                ${duracion ? `<div style="font-size:9px;color:#9ca3af;margin-top:2px;">${duracion}</div>` : ''}
              </div>
            </div>
            ${exp.descripcion && exp.descripcion !== 'undefined' ? `<p style="font-size:10px;color:#6b7280;margin:6px 0 0;line-height:1.5;">${exp.descripcion}</p>` : ''}
          </div>`;
        }).join('')}
      </div>`
    : '';

  // ── Estudios ──
  const estudiosHTML = (asp.estudios?.length ?? 0) > 0
    ? `<div style="margin-bottom:24px;">
        ${sectionTitle('Formación Académica')}
        ${asp.estudios!.map(est => {
          const duracion = calcularDuracion(est.fecha_inicio, est.fecha_fin);
          return `<div style="margin-bottom:12px;padding:10px;background:#f8fafc;border-radius:8px;border-left:3px solid #06b6d4;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="flex:1;">
                <div style="font-size:12px;font-weight:700;color:#1e1b4b;">${safe(est.titulo)}</div>
                <div style="font-size:11px;color:#0891b2;font-weight:600;">${safe(est.institucion)}</div>
                ${safe(est.nivel_educativo) !== '—' ? tag(safe(est.nivel_educativo), '#cffafe', '#0e7490') : ''}
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px;">
                <div style="font-size:10px;color:#6b7280;">
                  ${formatFecha(est.fecha_inicio)} – ${est.fecha_fin ? formatFecha(est.fecha_fin) : 'Actual'}
                </div>
                ${duracion ? `<div style="font-size:9px;color:#9ca3af;margin-top:2px;">${duracion}</div>` : ''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`
    : '';

  // ── Producción Académica ──
  const produccionHTML = (asp.produccion_academica?.length ?? 0) > 0
    ? `<div style="margin-bottom:24px;">
        ${sectionTitle('Producción Académica')}
        ${asp.produccion_academica!.map(prod =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#f8fafc;border-radius:6px;margin-bottom:6px;border-left:3px solid #f59e0b;">
            <div>
              <div style="font-size:11px;font-weight:600;color:#1f2937;">${safe(prod.titulo)}</div>
              ${safe(prod.tipo ?? prod.medio_divulgacion) !== '—' ? tag(safe(prod.tipo ?? prod.medio_divulgacion ?? ''), '#fef3c7', '#92400e') : ''}
            </div>
            <div style="font-size:10px;color:#9ca3af;">${formatFecha(prod.fecha ?? prod.fecha_divulgacion)}</div>
          </div>`
        ).join('')}
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; }
  </style>
</head>
<body>
<div id="hoja-vida-pdf" style="width:794px;background:#fff;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#0ea5e9 100%);padding:32px 40px;display:flex;align-items:center;gap:28px;">
    ${fotoHTML}
    <div style="flex:1;">
      <div style="font-size:24px;font-weight:800;color:#fff;line-height:1.2;text-shadow:0 2px 8px rgba(0,0,0,0.15);">${nombre}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:6px;font-weight:400;">
        ${dp.tipo_identificacion ? dp.tipo_identificacion + ': ' : 'C.C.: '}${dp.numero_identificacion}
      </div>
      ${dp.email ? `<div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">${dp.email}</div>` : ''}
      ${ic?.celular ? `<div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:2px;">Tel. ${ic.celular}</div>` : ''}
      ${dp.municipio ? `<div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:2px;">${[dp.municipio, dp.departamento].filter(Boolean).join(', ')}</div>` : ''}
    </div>
    <div style="text-align:right;">
      <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;backdrop-filter:blur(4px);">
        <div style="font-size:10px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">Hoja de Vida</div>
        <div style="font-size:11px;color:#fff;font-weight:700;margin-top:2px;">Universidad</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.8);">${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <div style="display:flex;gap:0;">

    <!-- LEFT COLUMN -->
    <div style="width:270px;background:#fafbff;padding:24px 20px;border-right:1px solid #e5e7eb;flex-shrink:0;">

      <div style="margin-bottom:20px;">
        ${sectionTitle('Datos Personales')}
        <table style="width:100%;border-collapse:collapse;">
          ${datosRows}
        </table>
      </div>

      ${idiomasHTML}
      ${aptitudesHTML}
      ${postulacionesHTML}

    </div>

    <!-- RIGHT COLUMN -->
    <div style="flex:1;padding:24px 28px;">
      ${experienciasHTML}
      ${estudiosHTML}
      ${produccionHTML}

      ${!experienciasHTML && !estudiosHTML && !produccionHTML
        ? `<div style="text-align:center;padding:60px 20px;color:#9ca3af;border:1px dashed #e5e7eb;border-radius:8px;margin:20px;">
            <div style="font-size:13px;">No hay información adicional registrada.</div>
          </div>`
        : ''}
    </div>

  </div>

  <!-- FOOTER -->
  <div style="background:linear-gradient(90deg,#4f46e5,#7c3aed);padding:12px 40px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:10px;color:rgba(255,255,255,0.8);">Sistema de Gestión Docente</span>
    <span style="font-size:10px;color:rgba(255,255,255,0.8);">Generado el ${new Date().toLocaleDateString('es-CO')}</span>
  </div>

</div>
</body>
</html>`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generarHojaVidaPDF(aspirante: AspiranteParaPDF): Promise<void> {
  // 1. Normalize and fetch photo as base64
  let fotoBase64: string | null = null;
  const rawFotoUrl = aspirante.datos_personales.foto_perfil_url;
  if (rawFotoUrl && rawFotoUrl !== 'undefined' && rawFotoUrl !== 'null') {
    // Try the URL as-is first
    fotoBase64 = await fetchImageAsBase64(rawFotoUrl);

    // If failed and URL contains /api/storage, try without /api prefix
    if (!fotoBase64 && rawFotoUrl.includes('/api/storage/')) {
      fotoBase64 = await fetchImageAsBase64(rawFotoUrl.replace('/api/storage/', '/storage/'));
    }
  }

  // 2. Build HTML — if base64 failed, pass raw URL as fallback (html2canvas will try useCORS)
  const fotoParam = fotoBase64 || (rawFotoUrl && rawFotoUrl !== 'undefined' ? rawFotoUrl : null);
  const html = buildHojaVidaHTML(aspirante, fotoParam);
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:794px;z-index:-1;';
  container.innerHTML = html;
  document.body.appendChild(container);

  const el = container.querySelector('#hoja-vida-pdf') as HTMLElement;

  try {
    // 3. Render to canvas — cast to any to support all html2canvas options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await (html2canvas as any)(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // 4. Build PDF — A4 portrait
    const imgWidth = 210; // mm
    const pageHeight = 297; // mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    let yOffset = 0;
    let remaining = imgHeight;
    let pageIndex = 0;

    while (remaining > 0) {
      const sliceHeight = Math.min(pageHeight, remaining);
      const sliceCanvas = document.createElement('canvas');
      const scale = canvas.width / imgWidth;
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight * scale;

      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(
        canvas,
        0, yOffset * scale,
        canvas.width, sliceCanvas.height,
        0, 0,
        sliceCanvas.width, sliceCanvas.height,
      );

      const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(sliceData, 'JPEG', 0, 0, imgWidth, sliceHeight);

      yOffset += sliceHeight;
      remaining -= sliceHeight;
      pageIndex++;
    }

    // 5. Save
    const nombreArchivo = [
      aspirante.datos_personales.primer_nombre,
      aspirante.datos_personales.primer_apellido,
    ]
      .filter(Boolean)
      .join('_')
      .replace(/\s+/g, '_');

    pdf.save(`HojaVida_${nombreArchivo}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
