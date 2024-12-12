import React, { createContext, useContext, useState, ReactNode } from 'react';


// Create the context with a default value
export const ModalContext = createContext<ModalContextType | undefined>(undefined);

// ModalProvider to wrap your application
export const SetIPModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const showModal = () => {
        // setModalContent();
        setIsVisible(true);
    };

    const hideModal = () => {
        // setModalContent(null);
        setIsVisible(false);
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal, isVisible }}>
            {children}
        </ModalContext.Provider>
    );
};
