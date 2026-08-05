// components/AgregarLink.tsx
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

interface AgregarLinkProps {
  to: string;
  texto: string;
}

export default function AgregarLink({ to, texto }: AgregarLinkProps) {
  return (
    <Link
      to={to}
      className="flex border-2 border-dashed border-gray-400 p-4 rounded-md w-full justify-center items-center hover:border-gray-500 transition gap-2"
    >
      <PlusIcon className="size-8 text-gray-600 " />
      <p className="text-gray-600 text-sm">{texto}</p>
    </Link>
  );
}
