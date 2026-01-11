import axios from "axios";
import { getBackendUrl } from "../config";

// Função helper para obter a URL do backend dinamicamente
const getDynamicBackendUrl = () => {
	const backendUrl = getBackendUrl();
	if (!backendUrl) {
		// Fallback para desenvolvimento
		return process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
	}
	return backendUrl;
};

const api = axios.create({
	baseURL: getDynamicBackendUrl(),
	withCredentials: true,
});

export const openApi = axios.create({
	baseURL: getDynamicBackendUrl()
});

export default api;
