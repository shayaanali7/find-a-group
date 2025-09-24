'use client'
import React, { ReactNode, useEffect } from 'react'
import { ReactPortal } from '../../Providers/ReactPortal';

interface ModalScreenProps {
    children: ReactNode;
    isOpen?: boolean;
    handleClose?: () => void;
    height?: string;
    width?: string;
}

const ModalScreen = ( {children ,isOpen, handleClose, height, width }: ModalScreenProps ) => {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (handleClose && event.key === 'Escape') {
        handleClose();
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [isOpen])

  if (!isOpen) return null;

  const modalClasses = `fixed z-50 rounded-2xl flex flex-col box-border bg-white p-2 sm:p-5 
    top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-auto
    shadow-2xl border border-gray-200/50 backdrop-blur-sm ${
    height && width 
      ? 'max-w-md' 
      : 'w-[95vw] max-w-md h-[95vh] max-h-[90vh]'
  }`;

  const modalStyle = height && width 
    ? { width, height } 
    : {};

  return (
    <ReactPortal wrapperId='react-portal-modal-container'>
      <>
        <div className='top-0 left-0 w-screen h-screen z-40 bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 relative overflow-hidden'>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse [animation-delay:2s]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse [animation-delay:4s]"></div>
          </div>
        </div>
        <div className={modalClasses} style={modalStyle}>
          {children}
        </div>
      </>
    </ReactPortal>
  ) 
}

export default ModalScreen