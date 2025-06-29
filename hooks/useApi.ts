import axios from "axios";
import useBackendUrl from "./useBackendUrl";
export const useApi = async () => {
    const api = axios.create({
        baseURL: useBackendUrl(),
        withCredentials: true
    });
    return api;
}