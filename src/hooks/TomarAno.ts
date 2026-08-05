export const useObtenerAno = (): { obtenerAno: (fecha: string) => string } => {
  const obtenerAno = (fecha: string): string => {
    const fechaObjeto = new Date(fecha);
    
    if (isNaN(fechaObjeto.getTime())) {
      return 'Fecha inválida';
    }
    
    const año = fechaObjeto.getFullYear();
    return año.toString();
  };

  return { obtenerAno };
};
