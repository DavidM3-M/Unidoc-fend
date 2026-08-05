import DocumentosNormativa from "./DocumentosNormativa";
import InformacionNormativas from "./InformacionNormativas";



const Normativas = () => {

   return (
      <>
        <div className="flex w-full flex-col gap-y-8 lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] m-auto relative">
          <InformacionNormativas/>        
          <DocumentosNormativa/>        
        </div>
      </>
    );
  };
export default Normativas;