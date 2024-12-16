import {Button, Form, Modal} from "react-bootstrap";
import {useModal} from "../SetIPModalProvider/useModal.ts";
import IpInput from "../IpInput/IpInput.tsx";
import React, {useEffect, useState} from "react";
import {getIPSuggestions, isValidIPv4} from "../../../../utils/helper.ts";
import {useReactFlow} from "@xyflow/react";
import {NodeTypes} from "../../constants.ts";

export default function () {
    const { setEdges } = useReactFlow();

    const { isVisible, label, type, hideModal } = useModal();

    const [isSourceIPSet, setIsSourceIPSet] = useState(false)
    const [isTargetIPSet, setIsTargetIPSet] = useState(false)
    const [ipSuggestions, setIpSuggestions] = useState<string[]>([])

    const [inputIP, setInputIP] = useState<string>("")

    const [maskValue, setMaskValue] = useState<string>('');


    const onEdgeSourceIpSet = (ip: string) => {

        setEdges((edges) => edges.map((edge) => {
            edge.data!.sourceIPAddress = ip
            return edge;
        } ));

        setIsTargetIPSet(true)
    };

    const onEdgeTargetIpSet = (ip: string) => {
        setEdges((edges) => edges.map((edge) => {
            edge.data!.targetIPAddress = ip
            return edge;
        } ));

        setIsSourceIPSet(true)
    };

    const onSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setInputIP(value)
    }

    const handleSourceInputBlur = () => {
        const ipWithoutUnderline = inputIP.replace(/_/g, "")
        if (isValidIPv4(ipWithoutUnderline)) {
            onEdgeSourceIpSet(ipWithoutUnderline)
        }
    };

    const onIPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setInputIP(value)
    }

    const handleIPSet = () => {

        if (inputIP.length > 0 && maskValue.length > 0) {
            const ipWithoutUnderline = inputIP.replace(/_/g, "")

            if (isValidIPv4(ipWithoutUnderline)) {

                // console.log(ipWithoutUnderline, type, NodeTypes["SOURCE"], NodeTypes["SOURCE"] === type)

                switch (type) {
                    case NodeTypes["SOURCE"]:
                        onEdgeSourceIpSet(ipWithoutUnderline)
                        break;
                    case NodeTypes["TARGET"]:
                        onEdgeTargetIpSet(ipWithoutUnderline)
                        break;
                }

                handleHideModal()
            }
        }
    };

    const handleHideModal = () => {
        setMaskValue("")
        hideModal();
    };

    useEffect(() => {
        if (isSourceIPSet || isTargetIPSet) {
            setIpSuggestions(getIPSuggestions(inputIP))
        }
    }, [isSourceIPSet, isTargetIPSet]);


    return (
        <Modal show={isVisible} onHide={handleHideModal}>
            <Modal.Header closeButton>
                <Modal.Title>{`Set IP for ${label}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                     <IpInput
                         onChange={onIPChange}
                         // handleInputBlur={handleTargetInputBlur}
                         maskValue={maskValue}
                         setMaskValue={setMaskValue}
                         type={type}
                         isIPSet={isTargetIPSet}
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