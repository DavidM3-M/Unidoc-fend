import ManualUsuario from "./cargaNormativas/CargaNormativas";

const DocumentosNormativa = () => {
  return (
    <>
      <div className="flex flex-col w-full">
        <div className="w-full flex flex-col bg-white md:py-12 px-8 rounded-xl gap-8">
          {/* Grid de normativas */}
          <div className="grid md:grid-cols-3 gap-x-8 lg:gap-x-24 gap-y-8">
            <ManualUsuario />
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentosNormativa;