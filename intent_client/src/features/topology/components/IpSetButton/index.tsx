import {Badge, Button} from "react-bootstrap";
import React from "react";

export default function IpSetButton(
    {
        // onClick,
        // handleInputBlur,
        // type,
        // isIPSet,
        // ipSuggestions,
        label
    }: IpSetButtonProps) {
    return (
        <Button
            variant="primary"
            size="sm"
            style={{
                color: "white",
                position: "relative"
            }}
            // onClick={onClick}
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