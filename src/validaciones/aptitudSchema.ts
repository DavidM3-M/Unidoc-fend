import {z} from "zod";
import { TEXTO_LIBRE, MENSAJE_TEXTO_LIBRE } from "./textoLibre";




export const aptitudSchema = z.object({
  nombre_aptitud: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(50, { message: "Máximo 50 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),
  descripcion_aptitud: z
    .string()
    .min(1, { message: "Campo vacio" })
    .max(500, { message: "Máximo 500 caracteres" })
    .regex(TEXTO_LIBRE, {
      message: MENSAJE_TEXTO_LIBRE,
    }),
});