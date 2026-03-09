import { XMarkIcon } from '@heroicons/react/24/outline'



type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}



export default function Modal({ open, onClose, children }:Props) {
  return (
    // backdrop
    <div
      onClick={onClose}
      className={`
        fixed inset-0 flex justify-center items-center transition-all duration-200
        ${open ? "visible bg-black/20" : "invisible bg-black/0"}
      `}
    >
      {/* modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative bg-white rounded-xl shadow p-6 transition-all duration-300
          ${open ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-3"}
        `}
        style={{ transitionTimingFunction: open ? 'cubic-bezier(0.16,1,0.3,1)' : 'cubic-bezier(0.4,0,1,1)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}