import {Button, Form, Modal} from "react-bootstrap";
import {useModal} from "../SetIPModalProvider/useModal.ts";
import IpInput from "../IpInput/IpInput.tsx";
import React, {useEffect, useState} from "react";
import { isValidIPv4} from "../../../../utils/helper.ts";
import {useReactFlow} from "@xyflow/react";
import {NodeEdgeTypes} from "../../constants.ts";

export default function () {

    const { setEdges, getEdges } = useReactFlow();

    const { isVisible, label, type, hideModal, edgeId} = useModal();

    const [octets, setOctets] = useState<string[]>(["", "", "", ""]);

    const [localMask, setLocalMask] = useState<string>("");

    const onEdgeSourceIpSet = (ip: string, mask: string) => {

        setEdges((edges) => edges.map((edge) => {

            if (edgeId == edge.id) {
                edge.data!.sourceIPAddress = ip
                edge.data!.mask = mask
            }

            return edge;
        } ));

    };

    const onEdgeTargetIpSet = (ip: string, mask: string) => {

        setEdges((edges) => edges.map((edge) => {

            if (edgeId == edge.id) {
                edge.data!.targetIPAddress = ip
                edge.data!.mask = mask
            }

            return edge;
        } ));
    };

    const handleIPSet = () => {

        if (octets.every(element => element.trim() !== "") && localMask.length > 0) {

            const ip = octets.join(".")

            if (isValidIPv4(ip)) {

                switch (type) {
                    case NodeEdgeTypes["SOURCE"]:
                        onEdgeSourceIpSet(ip, localMask)
                        break;
                    case NodeEdgeTypes["TARGET"]:
                        onEdgeTargetIpSet(ip, localMask)
                        break;
                }

                handleHideModal()
            }
        }
    };

    const handleHideModal = () => {
        setLocalMask("")
        hideModal();
    };

    const handleMaskInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = event.target.value;

        // Remove non-numeric characters and limit to 2 digits
        inputValue = inputValue.replace(/[^0-9]/g, '').slice(0, 2);

        if (parseInt(inputValue) > 32) return

        setLocalMask(inputValue);
    }

    const handleOctetChange = (index: number, value: string) => {
        if (/^\d*$/.test(value) && +value >= 0 && +value <= 255) {
            const newOctets = [...octets];
            newOctets[index] = value;
            setOctets(newOctets);
        }
    };

    useEffect(() => {

        if (isVisible) {

            const edges = getEdges()

            for (const edge of edges) {
                if (edge.id == edgeId) {

                    const mask = edge?.data?.mask as string || "";
                    setLocalMask(mask)

                    if ( type === NodeEdgeTypes["SOURCE"] ) {
                        const sourceIP = edge?.data?.sourceIPAddress as string || "...";
                        const splitIP = sourceIP.split(".");  // Split the IP by dot into an array
                        setOctets(splitIP);

                    } else if ( type === NodeEdgeTypes["TARGET"] ) {
                        const targetIP = edge?.data?.targetIPAddress as string || "...";
                        const splitIP = targetIP.split(".");  // Split the IP by dot into an array
                        setOctets(splitIP);
                    }
                }
            }
        }
    }, [isVisible]);

    return (
        <Modal show={isVisible} onHide={handleHideModal}>
            <Modal.Header closeButton>
                <Modal.Title>{`Set IP for ${label}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                     <IpInput
                         maskValue={localMask}
                         handleMaskInput={handleMaskInput}
                         handleOctetChange={handleOctetChange}
                         octets={octets}
                         label={label}
                     />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleIPSet}>
                    Save
                </Button>
                <Button variant="secondary" onClick={handleHideModal}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}