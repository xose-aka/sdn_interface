import React, {useContext} from "react";
import {ModalContext} from "./index.tsx";
import {Form} from "react-bootstrap";

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}