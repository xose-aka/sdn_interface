import React from 'react';
import {Form, Row} from "react-bootstrap";
import "./index.css"

interface IpInputProps {
    handleMaskInput: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleOctetChange: (index: number, value: string) => void
    label: string
    maskValue: string
    octets: string[]
}

const IpInput: React.FC<IpInputProps> = (
    {
        maskValue,
        octets,
        handleOctetChange,
        handleMaskInput,
        label
    }
    ) => {

    console.log(octets)

    return (
        <Row >
            <Form.Group className="col-9" controlId={`exampleForm.${label}`}>
                <Form.Label className="required">IP Address</Form.Label>
                <div className="d-flex justify-content-between">
                    {
                        octets.map((octet, index) => {
                            return  (
                                <>
                                    <div key={index}>
                                        <Form.Control
                                            type="text"
                                            maxLength={3}
                                            placeholder="0-255"
                                            value={octet}
                                            onChange={(e) => handleOctetChange(index, e.target.value)}
                                            autoFocus={ index === 0 }
                                        />
                                    </div>
                                    {
                                        index < 3 && <div className="h2">.</div>
                                    }
                                </>
                            )
                        })
                    }
                </div>
            </Form.Group>
            <div className={"col-1"}>
                <div className={"pt-4"} style={{ fontSize: 31 }}>
                    /
                </div>
            </div>
            <Form.Group className="col-2" controlId="exampleForm.ControlInput1">
                <Form.Label className="required">Mask</Form.Label>
                <Form.Control
                    type="text"
                    maxLength={2}
                    placeholder="Mask"
                    value={maskValue}
                    onChange={handleMaskInput}
                />
            </Form.Group>
        </Row>
    );
};

export default IpInput;
