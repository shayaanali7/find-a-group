import React, { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom';

const createWrapperAndAppendToBody = (wrapperId: string) => {
    if (!document) return null;

    const wrapperElement = document.createElement('div');
    wrapperElement.setAttribute('id', wrapperId);
    document.body.appendChild(wrapperElement);
    return wrapperElement;
};

export const ReactPortal = ( {children, wrapperId}: {children: React.ReactElement, wrapperId: string} ) => {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement>();

  useLayoutEffect(() => {
    let element = document.getElementById(wrapperId);
    let created = false;

    if (!element) {
      element = createWrapperAndAppendToBody(wrapperId);
      created = true;
    }

    setWrapperElement(element!);

    return () => {
      if (created && element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [wrapperId]);

  if (!wrapperElement) {
    return null;
  }

  return createPortal(children, wrapperElement);
}
