import axiosInstance from "../../utils/axiosConfig";

// Tipos para las constantes
export interface TipoExperiencia {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface NivelIdioma {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface PerfilProfesional {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface TipoRequisitoAdicional {
  id: string;
  nombre: string;
  descripcion?: string;
}

// Servicio para obtener tipos de experiencia
export const getTiposExperiencia = async (): Promise<TipoExperiencia[]> => {
  try {
    const response = await axiosInstance.get('/talentoHumano/constantes/tipos-experiencia');
    // Transformar el array de strings en objetos con id y nombre
    const tipos = response.data.data || response.data.tipo_experiencia || [];
    return tipos.map((tipo: string, index: number) => ({
      id: (index + 1).toString(),
      nombre: tipo,
      descripcion: tipo
    }));
  } catch (error) {
    console.error('Error al obtener tipos de experiencia:', error);
    return [];
  }
};

// Servicio para obtener niveles de idioma
export const getNivelesIdioma = async (): Promise<NivelIdioma[]> => {
  try {
    const response = await axiosInstance.get('/talentoHumano/constantes/niveles-idioma');
    return response.data;
  } catch (error) {
    console.error('Error al obtener niveles de idioma:', error);
    return [];
  }
};

// Servicio para obtener perfiles profesionales
export const getPerfilesProfesionales = async (): Promise<PerfilProfesional[]> => {
  try {
    const response = await axiosInstance.get('/talentoHumano/constantes/perfiles-profesionales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfiles profesionales:', error);
    return [];
  }
};

// Servicio para obtener tipos de requisitos adicionales
export const getTiposRequisitosAdicionales = async (): Promise<TipoRequisitoAdicional[]> => {
  try {
    const response = await axiosInstance.get('/talentoHumano/constantes/tipos-requisitos-adicionales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de requisitos adicionales:', error);
    return [];
  }
};