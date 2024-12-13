import {Button, Form, Modal} from "react-bootstrap";
import {useModal} from "../SetIPModalProvider/useModal.ts";
import IpInput from "../IpInput/IpInput.tsx";
import React, {useEffect, useState} from "react";
import {getIPSuggestions, isValidIPv4} from "../../../../utils/helper.ts";
import {useReactFlow} from "@xyflow/react";

export default function () {
    const { setEdges } = useReactFlow();

    const { isVisible, label, hideModal } = useModal();

    const [isSourceIPSet, setIsSourceIPSet] = useState(false)
    const [isTargetIPSet, setIsTargetIPSet] = useState(false)
    const [ipSuggestions, setIpSuggestions] = useState<string[]>([])

    const [inputIP, setInputIP] = useState<string>("")

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

    const onTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;  // TypeScript knows this is a string
        setInputIP(value)
    }

    const handleTargetInputBlur = () => {
        const ipWithoutUnderline = inputIP.replace(/_/g, "")
        if (isValidIPv4(ipWithoutUnderline)) {
            onEdgeTargetIpSet(ipWithoutUnderline)
        }
    };

    useEffect(() => {
        if (isSourceIPSet || isTargetIPSet) {
            setIpSuggestions(getIPSuggestions(inputIP))
        }
    }, [isSourceIPSet, isTargetIPSet]);

    return (
        <Modal show={isVisible} onHide={hideModal}>
            <Modal.Header closeButton>
                <Modal.Title>{`Set IP for ${label}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                     <IpInput
                         onChange={onTargetChange}
                         handleInputBlur={handleTargetInputBlur}
                         type={"target"}
                         isIPSet={isTargetIPSet}
                         ipSuggestions={ipSuggestions}
                         label={label}
                     />
                    {/*<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">*/}
                    {/*    <Form.Label>Email address</Form.Label>*/}
                    {/*    <Form.Control*/}
                    {/*        type="email"*/}
                    {/*        placeholder="name@example.com"*/}
                    {/*        autoFocus*/}
                    {/*    />*/}
                    {/*</Form.Group>*/}
                    {/*<Form.Group*/}
                    {/*    className="mb-3"*/}
                    {/*    controlId="exampleForm.ControlTextarea1"*/}
                    {/*>*/}
                    {/*    <Form.Label>Example textarea</Form.Label>*/}
                    {/*    <Form.Control as="textarea" rows={3} />*/}
                    {/*</Form.Group>*/}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hideModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={hideModal}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    )
}