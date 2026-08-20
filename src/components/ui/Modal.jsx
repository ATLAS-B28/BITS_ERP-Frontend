import {useEffect} from 'react'
import {Button} from './Button'

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size='md',
    footer,
}) {
    useEffect(() => {
        const handleEsc = (e) => {if (e.key == 'Escape') onClose()}
        if(isOpen) document.addEventListener('keydown', handleEsc)
        return () => {
            document.removeEventListener('keydown', handleEsc)
        }
    }, [isOpen, onClose])

    if(!isOpen) return null

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/**backdrop */}
            <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}/>
            {/**modal */}
            <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl
        shadow-xl flex flex-col max-h-[90vh]`}>
            {/**header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
            {/**body */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
                {children}
            </div>
            {/**footer */}
            {footer && (
                <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200">
                    {footer}
                </div>
            )}
        </div>
        </div>
    )
}