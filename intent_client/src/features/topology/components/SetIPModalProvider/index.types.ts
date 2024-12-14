
// Define the type for the modal context state
type ModalContextType = {
    showModal: (label: string, type: string) => void;
    hideModal: () => void;
    // modalContent: ReactNode | null;
    isVisible: boolean;
    label: string;
    type: string;
};