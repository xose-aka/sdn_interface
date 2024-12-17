import {Button, Form, Modal} from "react-bootstrap";
import {useModal} from "../SetIPModalProvider/useModal.ts";
import IpInput from "../IpInput/IpInput.tsx";
import React, {useEffect, useState} from "react";
import {getIPSuggestions, isValidIPv4} from "../../../../utils/helper.ts";
import {useReactFlow} from "@xyflow/react";
import {NodeTypes} from "../../constants.ts";

export default function () {
    const { setEdges, getEdges } = useReactFlow();

    const { isVisible, label, type, hideModal, edgeId} = useModal();

    const [isIPSuggest, setIsIPSuggest] = useState(false)
    const [ipSuggestions, setIpSuggestions] = useState<string[]>([])

    const [inputIP, setInputIP] = useState<string>("")

    const [localMask, setLocalMask] = useState<string>("");

    useEffect(() => {

        if (isVisible) {

            const edges = getEdges()

            for (const edge of edges) {
                if (edge.id == edgeId) {

                    const mask = edge?.data?.mask as string || "";
                    setLocalMask(mask)

                    if ( type === NodeTypes["SOURCE"] ) {
                        const sourceIP = edge?.data?.sourceIPAddress as string || "";
                        setInputIP(sourceIP)

                        const targetIP = edge?.data?.targetIPAddress as string || "";

                        if (targetIP && !sourceIP) {
                            console.log('aa')

                            setIpSuggestions(getIPSuggestions(targetIP, mask))
                            setIsIPSuggest(true)
                        }

                    } else if ( type === NodeTypes["TARGET"] ) {
                        const targetIP = edge?.data?.targetIPAddress as string || "";
                        setInputIP(targetIP)

                        const sourceIP = edge?.data?.sourceIPAddress as string || "";

                        if (!targetIP && sourceIP) {
                            setIpSuggestions(getIPSuggestions(sourceIP, mask))
                            setIsIPSuggest(true)
                        }
                    }
                }
            }
        }
    }, [isVisible]);

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

    const onIPChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = event.target.value
        setInputIP(value)
    }

    const onSelectIPChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setInputIP(value)
    }

    const handleIPSet = () => {

        if (inputIP.length > 0 && localMask.length > 0) {
            const ipWithoutUnderline = inputIP.replace(/_/g, "")

            if (isValidIPv4(ipWithoutUnderline)) {

                switch (type) {
                    case NodeTypes["SOURCE"]:
                        onEdgeSourceIpSet(ipWithoutUnderline, localMask)
                        break;
                    case NodeTypes["TARGET"]:
                        onEdgeTargetIpSet(ipWithoutUnderline, localMask)
                        break;
                }

                handleHideModal()
            }
        }
    };

    const handleHideModal = () => {
        setLocalMask("")
        setIsIPSuggest(false)
        hideModal();
    };

    // useEffect(() => {
    //     if (isIPSuggest) {
    //         console.log(inputIP, localMask)
    //         console.log(getIPSuggestions(inputIP, localMask))
    //         setIpSuggestions(getIPSuggestions(inputIP, localMask))
    //     }
    // }, [isIPSuggest]);


    return (
        <Modal show={isVisible} onHide={handleHideModal}>
            <Modal.Header closeButton>
                <Modal.Title>{`Set IP for ${label}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                     <IpInput
                         onChange={onIPChange}
                         onSelectChange={onSelectIPChange}
                         // handleInputBlur={handleTargetInputBlur}
                         maskValue={localMask}
                         setMaskValue={setLocalMask}
                         inputIP={inputIP}
                         type={type}
                         isIPSet={isIPSuggest}
                         ipSuggestions={ipSuggestions}
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