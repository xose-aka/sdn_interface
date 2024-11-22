import React, { useState } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info'; // Restrict to Bootstrap's alert types
  onClose?: () => void; // Optional close handler
}

const BootstrapAlert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert"
    style={{
      "position": "absolute",
      "left": "50%",
      "top": "2%"
    }}>
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default BootstrapAlert;
