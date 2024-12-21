import {Badge, Button} from "react-bootstrap";
import React from "react";

export default function IpSetButton(
    {
        mask,
        showModal,
        ipAddress,
        label
    }: IpSetButtonProps) {


    let IPAddressLabel = "No IP address set"

    if ( ipAddress !== undefined && ipAddress.length > 0)
        IPAddressLabel = `${ipAddress}/${mask}`

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