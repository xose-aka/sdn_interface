
// Define the type for the modal context state
type ModalContextType = {
    showModal: (label: string, type: string) => void;
    hideModal: () => void;
    isVisible: boolean;
    label: string;
    type: string;
};