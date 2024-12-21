
import {API_CONFIG} from "../config/api.ts";
import axios from "axios";
import {TopoEntityDTO} from "../types";

export const sendTopo = async (token: string, topologyDTO: TopoEntityDTO[]): Promise<any> => {
    const response = await axios.post<TopoEntityDTO[]>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOPO_BUILD}`,
        {
            nodes: topologyDTO
        },
        { headers: { 'X-Token': token } }
    )

    return response.data
}

export const getToken = async (): Promise<any> => {
    return await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOKEN}`);
};