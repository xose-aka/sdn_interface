import {useEffect, useState} from "react";
import {getToken} from "../services/api.ts";


function useToken() {
    const [token, setToken] = useState<string | null>(null);

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
    }, []);

    return { token };
}

export default useToken;