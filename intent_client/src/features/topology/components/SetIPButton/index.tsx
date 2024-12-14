import {Badge, Button} from "react-bootstrap";
import React from "react";
import {useModal} from "../SetIPModalProvider/useModal.ts";

export default function IpSetButton(
    {
        // onClick,
        // handleInputBlur,
        type,
        // isIPSet,
        // ipSuggestions,
        label
    }: IpSetButtonProps) {

    const { showModal } = useModal();

    return (
        <Button
            variant="primary"
            size="sm"
            style={{
                color: "white",
                position: "relative"
            }}
            onClick={() => showModal(label, type)}
        >
            <Badge
                bg="primary"
                style={{
                    position: "absolute",
                    top: "-10px"
                }}
            > {label}</Badge>
            No IP address set
        </Button>
    )
}