import React, { createContext, ReactNode } from 'react';
import {useState} from "react";


// Create the context with a default value
export const ModalContext = createContext<ModalContextType | undefined>(undefined);

// ModalProvider to wrap your application
export const SetIPModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [isVisible, setIsVisible] = useState(false);

    const [label, setLabel] = useState("");

    const [type, setType] = useState("");

    const [edgeId, setEdgeId] = useState("");

    const showModal = (localEdgeId: string, localType: string, localLabel: string) => {
        setLabel(localLabel);
        setType(localType)
        setEdgeId(localEdgeId)
        setIsVisible(true);
    };

    const hideModal = () => {
        setIsVisible(false);
    };

    return (
        <ModalContext.Provider value={{ showModal, label, type, hideModal, isVisible, edgeId }}>
            {children}
        </ModalContext.Provider>
    );
};
