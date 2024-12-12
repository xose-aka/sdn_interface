
// Define the type for the modal context state
type ModalContextType = {
    showModal: () => void;
    hideModal: () => void;
    // modalContent: ReactNode | null;
    isVisible: boolean;
};