import React from 'react';
import MaskedInput from 'react-text-mask';

const props = {
    guide: true,
    mask: (value: string) => {
        let result = [];
        const chunks = value.split(".");

        for (let i = 0; i < 4; ++i) {
            const chunk = (chunks[i] || "").replace(/_/gi, "");

            if (chunk === "") {
                result.push(/\d/, /\d/, /\d/, ".");
                continue;
            } else if (+chunk === 0) {
                result.push(/\d/, ".");
                continue;
            } else if (
                chunks.length < 4 ||
                (chunk.length < 3 && chunks[i].indexOf("_") !== -1)
            ) {
                if (
                    (chunk.length < 2 && +`${chunk}00` > 255) ||
                    (chunk.length < 3 && +`${chunk}0` > 255)
                ) {
                    result.push(/\d/, /\d/, ".");
                    continue;
                } else {
                    result.push(/\d/, /\d/, /\d/, ".");
                    continue;
                }
            } else {
                result.push(...new Array(chunk.length).fill(/\d/), ".");
                continue;
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
}

const IpInput: React.FC<IpInputProps> = ({onChange, handleInputBlur}) => {

    return (
        <div>
            <MaskedInput
                onChange={ onChange }
                onBlur={ handleInputBlur }
                className="bg-white text-reset"
                placeholder={"IP address e.g 192.168.0.1"}
                {...props} />
        </div>
    );
};

export default IpInput;
