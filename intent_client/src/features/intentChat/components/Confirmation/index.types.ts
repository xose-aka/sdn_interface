import React from "react";

export interface ConfirmationProps {
    submitConfirmMessage: (isConfirm: boolean) => void,
    children: React.ReactNode
}