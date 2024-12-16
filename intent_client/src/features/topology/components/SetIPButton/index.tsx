import {Badge, Button} from "react-bootstrap";
import React from "react";
import {useModal} from "../SetIPModalProvider/useModal.ts";

export default function IpSetButton(
    {
        // onClick,
        // handleInputBlur,
        // isIPSet,
        // ipSuggestions,
        showModal,
        ipAddress,
        label
    }: IpSetButtonProps) {


    console.log(ipAddress)

    let IPAddressLabel = "No IP address set"

    if ( ipAddress !== undefined && ipAddress.length > 0)
        IPAddressLabel = ipAddress

    return (
        <Button
            variant="primary"
            size="sm"
            style={{
                color: "white",
                position: "relative",
                width: "135px"
            }}
            onClick={() => showModal() }
        >
            <Badge
                bg="primary"
                style={{
                    position: "absolute",
                    top: "-10px",
                    left: "10px"
                }}
            > {label}</Badge>
            {IPAddressLabel}
        </Button>
    )
}