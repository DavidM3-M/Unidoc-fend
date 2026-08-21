import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { DataTable } from "../../componentes/tablas/DataTable";
import InputSearch from "../../componentes/formularios/InputSearch";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import { Link } from "react-router-dom";
import { DocumentTextIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { FileText } from 'lucide-react';
import EliminarBoton from '../../componentes/EliminarBoton';
import { AdjuntarArchivo } from "../../componentes/formularios/AdjuntarArchivo";
import { InputLabel } from "../../componentes/formularios/InputLabel";
import TextInput from "../../componentes/formularios/TextInput";
import TextArea from "../../componentes/formularios/TextArea";
import { ButtonPrimary } from "../../componentes/formularios/ButtonPrimary";
import Cookies from "js-cookie";

interface Documento {
  id_documento: number;
  archivo: string;
  archivo_url: string;
}

interface Normativa {
  id_normativa: number;
  nombre: string;
  descripcion?: string;
  tipo: string;
  documentos_normativa?: Documento[];
  created_at?: string;
}

const GestionNormativas = () => {
  const [normativas, setNormativas] = useState<Normativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  // Form/modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form fields
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [archivoFile, setArchivoFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  const fetchNormativas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/obtener-normativas");
      const data = response.data?.normativas || response.data || [];
      setNormativas(data);
    } catch (error) {
      console.error("Error al obtener normativas:", error);
      toast.error("Error al cargar normativas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNormativas();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setNombre("");
    setDescripcion("");
    setTipo("");
    setArchivoFile(null);
    setExistingFileUrl(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
      setTimeout(() => {
        const el = document.getElementById('nombre');
        (el as HTMLInputElement | null)?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isModalOpen]);

  const handleOpenEdit = async (id: number) => {
    try {
      const response = await axiosInstance.get(`/admin/obtener-normativa/${id}`);
      const n: Normativa = response.data.normativa || response.data;
      setIsEditing(true);
      setEditingId(id);
      setNombre(n.nombre || "");
      setDescripcion(n.descripcion || "");
      setTipo(n.tipo || "");
      if (n.documentos_normativa && n.documentos_normativa.length > 0) {
        setExistingFileUrl(n.documentos_normativa[0].archivo_url);
      } else {
        setExistingFileUrl(null);
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener la normativa:", error);
      toast.error("No se pudo cargar la normativa");
    }
  };

  const validateClient = (): string | null => {
    if (!nombre || nombre.trim().length === 0) return 'El nombre es requerido';
    if (!tipo || tipo.trim().length === 0) return 'El tipo es requerido';
    if (!isEditing && !archivoFile) return 'El archivo es requerido';
    if (archivoFile) {
      const allowed = ['application/pdf'];
      if (!allowed.includes(archivoFile.type)) return 'Solo se permiten archivos PDF';
      if (archivoFile.size > 4096 * 1024) return 'El archivo no debe superar 4MB';
    }
  if (descripcion && !/^[\p{L}\p{N}\s\-,.]+$/u.test(descripcion)) return 'Descripción contiene caracteres inválidos';
    return null;
  };

  const handleSubmit = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const clientError = validateClient();
    if (clientError) return toast.error(clientError);

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion || '');
    formData.append('tipo', tipo);
    if (archivoFile) formData.append('archivo', archivoFile);

    const token = Cookies.get('token');
    try {
      if (isEditing && editingId) {
        formData.append('_method', 'PUT');
        await toast.promise(
          axiosInstance.post(`/admin/actualizar-normativa/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } }),
          { pending: 'Actualizando normativa...', success: 'Normativa actualizada', error: 'Error al actualizar' }
        );
      } else {
        await toast.promise(
          axiosInstance.post('/admin/crear-normativa', formData, { headers: { Authorization: `Bearer ${token}` } }),
          { pending: 'Creando normativa...', success: 'Normativa creada', error: 'Error al crear normativa' }
        );
      }

      setIsModalOpen(false);
      fetchNormativas();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await toast.promise(
        axiosInstance.delete(`/admin/eliminar-normativa/${id}`),
        { pending: 'Eliminando normativa...', success: 'Normativa eliminada', error: 'Error al eliminar normativa' }
      );
      setNormativas((prev) => prev.filter((p) => p.id_normativa !== id));
    } catch (error) {
      console.error('Error al eliminar normativa', error);
      toast.error('Error al eliminar normativa');
    }
  };

  const columns = useMemo<ColumnDef<Normativa>[]>(() => {
    const DescriptionCell = ({ text }: { text?: string }) => {
      const [expanded, setExpanded] = useState(false);
      if (!text) return <span className="text-[#6b7a8d]">-</span>;
      return (
        <div className="text-sm text-[#2c3e50]">
          <div
            className={`overflow-hidden transition-all duration-200 ${expanded ? '' : 'max-h-[4.5rem]'}`}
            style={{ whiteSpace: 'normal' }}
          >
            <p className="m-0 leading-relaxed">{text}</p>
          </div>
          {text.length > 180 && (
            <button
              type="button"
              onClick={() => setExpanded((s) => !s)}
              className="mt-1 text-xs text-[#e8740e] font-bold hover:underline"
            >
              {expanded ? 'Leer menos' : 'Leer más'}
            </button>
          )}
        </div>
      );
    };

    return [
      { accessorKey: 'id_normativa', header: 'ID', size: 80, cell: ({ row }) => <span className="text-sm font-bold text-[#1e3a5f]">{row.original.id_normativa}</span> },
      { accessorKey: 'nombre', header: 'Nombre', size: 220 },
      { accessorKey: 'tipo', header: 'Tipo', size: 120 },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => (
          <div className="max-w-[220px] sm:max-w-[300px]">
            <DescriptionCell text={row.original.descripcion} />
          </div>
        ),
        size: 180,
      },
      {
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.documentos_normativa && row.original.documentos_normativa.length > 0 && (
              <a href={row.original.documentos_normativa[0].archivo_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white rounded-md flex items-center gap-2 text-sm font-bold transition-colors">
                <DocumentTextIcon className="w-4 h-4" /> Ver
              </a>
            )}
            <button onClick={() => handleOpenEdit(row.original.id_normativa)} className="px-3 py-1.5 border border-[#c89b14] text-[#c89b14] hover:bg-[#c89b14] hover:text-white rounded-md flex items-center gap-2 text-sm font-bold transition-colors">
              <PencilSquareIcon className="w-4 h-4" /> Editar
            </button>
            {/* EliminarBoton internamente debe manejar su estilo, pero lo dejamos aquí */}
            <EliminarBoton id={row.original.id_normativa} onConfirmDelete={handleDelete} />
          </div>
        ),
        size: 260,
      },
    ];
  }, []);

  return (
    <div className="bg-[#f3ede1] min-h-screen w-full p-4 sm:p-6 lg:p-8 font-sans">
      <div className="relative flex flex-col gap-6 w-full bg-[#ffffff] rounded-2xl shadow-lg border border-[rgba(30,58,95,0.09)] p-4 sm:p-6 lg:p-8">
        {/* contenido que se desenfoca cuando el panel está abierto */}
        <div className={isModalOpen ? 'pointer-events-none select-none transition-all duration-200 filter blur-sm' : 'transition-all duration-200'}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto">
            <div className="flex gap-1">
              <Link to={'/dashboard'}>
                <ButtonRegresar />
              </Link>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1e3a5f] flex items-center gap-2 flex-wrap tracking-tight">
                <FileText size={28} className="text-[#e8740e] flex-shrink-0" />
                <span>Gestión de Normativas</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6b7a8d] mt-1 font-medium">Crear, editar y eliminar normativas del sistema</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleOpenCreate} className="bg-[#e8740e] hover:bg-[#c2600b] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-md">
              Crear normativa
            </button>
          </div>
        </div>

        <div className="w-full mt-6 mb-2">
          <InputSearch className="w-full" placeholder="Buscar por nombre, tipo..." value={globalFilter} onChange={(e:any) => setGlobalFilter(e.target.value)} />
        </div>

        <div className="w-full overflow-x-auto hidden sm:block mt-6">
          <DataTable data={normativas} columns={columns} globalFilter={globalFilter} loading={loading} />
        </div>

      </div>

      {/* Modal formulario */}
      {isModalOpen && (
          <div aria-hidden={isModalOpen ? 'false' : 'true'} className="fixed inset-0 bg-[#1e3a5f]/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 pointer-events-auto">
            <div role="dialog" aria-modal="true" aria-label={isEditing ? 'Editar normativa' : 'Crear normativa'} className="bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5 sm:p-7 border border-[rgba(30,58,95,0.09)]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[rgba(30,58,95,0.09)]">
                <h3 className="text-2xl font-bold text-[#1e3a5f]">{isEditing ? 'Editar normativa' : 'Crear normativa'}</h3>
                <button onClick={() => setIsModalOpen(false)} aria-label="Cerrar" className="text-[#6b7a8d] hover:text-[#e8740e] hover:bg-[#f3ede1] rounded-full p-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <InputLabel htmlFor="nombre" value="Nombre*" />
                  <TextInput id="nombre" placeholder="Nombre normativa" value={nombre} onChange={(e:any)=>setNombre(e.target.value)} />
                </div>

                <div>
                  <InputLabel htmlFor="tipo" value="Tipo*" />
                  <TextInput id="tipo" placeholder="Tipo de normativa" value={tipo} onChange={(e:any)=>setTipo(e.target.value)} />
                </div>

                <div className="col-span-full">
                  <InputLabel htmlFor="descripcion" value="Descripción" />
                  <TextArea id="descripcion" placeholder="Escribe una breve descripción..." value={descripcion} onChange={(e:any)=>setDescripcion(e.target.value)} />
                </div>

                <div className="col-span-full bg-[#f3ede1] p-4 rounded-lg border border-[rgba(30,58,95,0.09)]">
                  <AdjuntarArchivo id="archivo" register={{ onChange: (ev:any)=> setArchivoFile(ev.target.files && ev.target.files[0] ? ev.target.files[0] : null) }} nombre={isEditing ? ' (opcional, si sube reemplaza)' : ''} />
                  {existingFileUrl && (
                    <p className="text-sm text-[#2c3e50] mt-3 font-medium flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-[#1e3a5f]"/>
                      Archivo actual: 
                      <a className="text-[#e8740e] hover:text-[#c2600b] underline font-bold" href={existingFileUrl} target="_blank" rel="noreferrer">
                        Ver documento
                      </a>
                    </p>
                  )}
                </div>

                <div className="col-span-full flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t border-[rgba(30,58,95,0.09)]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-[rgba(30,58,95,0.09)] text-[#2c3e50] bg-white hover:bg-[#f3ede1] font-bold text-sm transition-colors">
                    Cancelar
                  </button>
                  <ButtonPrimary 
                    className="!bg-[#e8740e] hover:!bg-[#c2600b] !text-white !font-bold"
                    value={isSubmitting ? 'Procesando...' : isEditing ? 'Actualizar normativa' : 'Crear normativa'} 
                    disabled={isSubmitting} 
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionNormativas;