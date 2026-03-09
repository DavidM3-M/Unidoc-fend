import InformacionPersonalDocente from './InformacionPersonalDocente'
import InformacionTrayectoriaDocente from './InformacionTrayectoriaDocente'


const Index = () => {

  return (
    <>
      <div className='flex  flex-col gap-y-4'>
        <InformacionPersonalDocente />
        < InformacionTrayectoriaDocente />
      </div>
    </>
  )
}

export default Index