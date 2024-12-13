import React, {useState} from 'react';
import MaskedInput from 'react-text-mask';
import {Form} from "react-bootstrap";

const props = {
    guide: true,
    mask: (value: string) => {
        let result = [];
        const chunks = value.split(".");

        for (let i = 0; i < 4; ++i) {
            const chunk = (chunks[i] || "").replace(/_/gi, "");

            if (chunk === "") {
                result.push(/\d/, /\d/, /\d/, ".");

            } else if (+chunk === 0) {
                result.push(/\d/, ".");

            } else if (
                chunks.length < 4 ||
                (chunk.length < 3 && chunks[i].indexOf("_") !== -1)
            ) {
                if (
                    (chunk.length < 2 && +`${chunk}00` > 255) ||
                    (chunk.length < 3 && +`${chunk}0` > 255)
                ) {
                    result.push(/\d/, /\d/, ".");

                } else {
                    result.push(/\d/, /\d/, /\d/, ".");

                }
            } else {
                result.push(...new Array(chunk.length).fill(/\d/), ".");

            }
        }

        result = result.slice(0, -1);
        return result;
    },
    pipe: (value: string) => {
        if (value === "." || value.endsWith("..")) return false;

        const parts = value.split(".");

        if (
            parts.length > 4 ||
            parts.some((part) => {
                const onePart = parseInt(part, 10)

                // return part === "00" || part < 0 || part > 255)
                return onePart < 0 || onePart > 255
            })
        ) {
            return false;
        }

        return value;
    }
};

interface IpInputProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleInputBlur: () => void
    type: string
    isIPSet: boolean
    ipSuggestions: string[]
    label: string
}

const IpInput: React.FC<IpInputProps> = (
    {
        onChange,
        handleInputBlur,
        type,
        isIPSet,
        ipSuggestions,
        label
    }
    ) => {

    const [maskValue, setMaskValue] = useState<string>('');

    const handleMaskInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = event.target.value;

        // Remove non-numeric characters and limit to 2 digits
        inputValue = inputValue.replace(/[^0-9]/g, '').slice(0, 2);

        setMaskValue(inputValue);
    }

    return (
        <div className={"row"}>

            {
                // isIPSet ?
                //     <Form.Select aria-label={`Select ${type} ip address`} size="sm">
                //         <option>{`Select ${type} ip address`}</option>
                //         {
                //             ipSuggestions.map((suggestedIp) => (
                //                 <option key={suggestedIp} value={suggestedIp}>
                //                     {suggestedIp}
                //                 </option>
                //             ))
                //         }
                //     </Form.Select>
                //     :
            }
                <Form.Group className="col-9" controlId={`exampleForm.${label}`}>
                    <Form.Label>IP Address</Form.Label>
                        <MaskedInput
                            onChange={ onChange }
                            onBlur={ handleInputBlur }
                            className="bg-white text-reset form-control"
                            placeholder={`Enter IP address e.g 192.168.0.1`}
                            autoFocus
                            {...props} />
                </Form.Group>
                <div className={"col-1"}>
                    <div className={"pt-4"} style={{
                        fontSize: 31
                    }}>
                        /

                    </div>

                    {/*<div className={"d-flex flex-column justify-content-end"}>*/}
                    {/*    <div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
                <Form.Group className="col-2" controlId="exampleForm.ControlInput1">
                    <Form.Label>Mask</Form.Label>
                    <Form.Control
                        type="text"
                        maxLength={2}
                        placeholder="Mask"
                        value={maskValue}
                        onChange={handleMaskInput}
                    />
                </Form.Group>

            </div>


    );
};

export default IpInput;
