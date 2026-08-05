
import FormacionEducativa from "./formacionEducativa/FormacionEducativa"
import FormacionExperiencia from "./formacionExperiencia/FormacionExperiencia"
import FormacionIdioma from "./formacionIdioma/FormacionIdioma"
import FormacionProduccion from "./formacionProduccion/FormacionProduccion"



const InformacionTrayectoriaDocente = () => {
  return (
    <>
      <div className="flex flex-col w-full  rounded-md lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] m-auto relative" >
        <div className="w-full flex flex-col bg-white md:py-12 p-8 rounded-xl gap-8" >

          <h2 className="font-bold text-2xl text-center" > Formación</h2>
          < div className="grid md:grid-cols-2 flex-col gap-x-8 lg:gap-x-24 gap-y-8 items-start justify-center" >
            <div className="flex  flex-col gap-8 ">
              <FormacionEducativa />
              <FormacionProduccion />
              <FormacionExperiencia />
            </div>
            <div className="flex flex-col gap-8">
              < FormacionIdioma />
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
export default InformacionTrayectoriaDocente