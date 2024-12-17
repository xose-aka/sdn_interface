
// Define the type for the modal context state
type ModalContextType = {
    showModal: (edgeId: string, type: string, label: string) => void;
    hideModal: () => void;
    isVisible: boolean;
    label: string;
    edgeId: string;
    type: string;
};