'use client'
import React, { ReactNode, useEffect } from 'react'
import { ReactPortal } from './ReactPortal';

interface ModalScreenProps {
    children: ReactNode;
    isOpen?: boolean;
    handleClose?: () => void;
    opacity?: number;
    backgroundColor?: string;
}

const ModalScreen = ( {children ,isOpen, handleClose, backgroundColor, opacity }: ModalScreenProps ) => {
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

  return (
    <ReactPortal wrapperId='react-portal-modal-container'>
      <>
        <div className='fixed top-0 left-0 w-screen h-screen z-40' style={{backgroundColor : backgroundColor ?? '#262626', opacity : opacity ?? 0.5}}/>
        <div className=" fixed z-50 rounded-2xl flex flex-col box-border bg-white p-2 sm:p-5 w-[95vw] max-w-md h-[95vh] max-h-[90vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-auto">
          {children}
        </div>
      </>
    </ReactPortal>
  ) 
}

export default ModalScreen