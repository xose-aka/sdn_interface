import {useEffect, useState} from "react";
import {getToken} from "../services/api.ts";


function useToken() {
    const [token, setToken] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState<boolean>(false);

    useEffect(() => {

        const savedToken = localStorage.getItem('token');

        if (savedToken) {
            setToken(savedToken)
        } else {
            getToken()
                .then(response => {
                    setToken(response.data.token)
                })
                .catch(error => {
                    console.log(error)
                });
        }
    }, [resetToken]);

    return { token, setResetToken };
}

export default useToken;