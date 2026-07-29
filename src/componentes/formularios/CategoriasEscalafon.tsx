type Categoria = {
  nombre: string;
  descripcion?: string;
  requisitos: string[] | null;
};

const CATEGORIAS: Categoria[] = [
  {
    nombre: "Auxiliar",
    descripcion: "Categoría base, cuando no cumple los requisitos de Asistente.",
    requisitos: null,
  },
  {
    nombre: "Asistente",
    requisitos: [
      "Maestría",
      "Inglés B1",
      "Evaluación docente ≥ 4.0",
      "20 puntos de producción académica",
      "4 años en planta",
    ],
  },
  {
    nombre: "Asociado",
    requisitos: [
      "Doctorado",
      "Inglés B2",
      "Evaluación docente ≥ 4.0",
      "30 puntos de producción académica",
      "6 años en planta",
    ],
  },
  {
    nombre: "Titular",
    requisitos: [
      "Doctorado",
      "Inglés B2",
      "Evaluación docente ≥ 4.0",
      "60 puntos de producción académica",
      "8 años en planta",
    ],
  },
];

type Props = {
  categoriaActual?: string;
};

const CategoriasEscalafon = ({ categoriaActual }: Props) => {
  return (
    <div className="grid gap-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIAS.map((cat) => {
          const esActual = categoriaActual === cat.nombre;

          return (
            <div
              key={cat.nombre}
              className={`rounded-xl border p-4 flex flex-col gap-2 ${
                esActual
                  ? "border-[#c89b14] bg-[#fdf7e6]"
                  : "border-[rgba(30,58,95,0.15)] bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#1e3a5f]">
                  {cat.nombre}
                </span>
                {esActual && (
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#c89b14] text-white px-2 py-0.5">
                    Actual
                  </span>
                )}
              </div>

              {cat.requisitos ? (
                <ul className="list-disc pl-4 text-xs text-[#2c3e50] space-y-0.5">
                  {cat.requisitos.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#2c3e50]">{cat.descripcion}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriasEscalafon;
