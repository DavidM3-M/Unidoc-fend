import ConvocatoriaSubida from "./ConvocatoriaSubida";
import InfoConvocatorias from "./InfoConvocatorias";




const Convocatorias = () => {

   return (
      <>
        <div className="flex w-full flex-col gap-y-8 lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] m-auto relative">
             <InfoConvocatorias/>    
             <ConvocatoriaSubida/>
        </div>
      </>
    );
  };
export default Convocatorias;