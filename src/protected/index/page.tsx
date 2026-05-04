import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import InformacionPersonalDocente from './InformacionPersonalDocente'
import InformacionTrayectoriaDocente from './InformacionTrayectoriaDocente'
import PanelAdministrativo from './PanelAdministrativo'
import { RolesValidos } from '../../types/roles';

const Index = () => {
  const token = Cookies.get('token');
  const rol: RolesValidos | null = token
    ? (jwtDecode<{ rol: RolesValidos }>(token)?.rol ?? null)
    : null;

  if (rol === 'Administrativo') {
    return <PanelAdministrativo />;
  }

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