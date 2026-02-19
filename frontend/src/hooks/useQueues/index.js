import { useCallback } from "react";
import api from "../../services/api";

const useQueues = () => {
	const findAll = useCallback(async () => {
		const { data } = await api.get("/queue");
		return data;
	}, []);

	return { findAll };
};

export default useQueues;
