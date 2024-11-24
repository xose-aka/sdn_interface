import React, {Dispatch, SetStateAction} from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info'; // Restrict to Bootstrap's alert types
  setShowAlert: Dispatch<SetStateAction<boolean>>,
}

const BootstrapAlert: React.FC<AlertProps> = ({ message,
                                                  type,
                                                  setShowAlert
}) => {

    const handleClose = () => {
        setShowAlert(false)
    }

    return (
        <div className={`alert alert-${type} alert-dismissible fade show`}
             role="alert"
            style={{
              "position": "absolute",
              "left": "50%",
              "top": "2%"
            }}
        >
          {message}
          {/*{onClose && (*/}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          {/*)}*/}
        </div>
    );
};

export default BootstrapAlert;
