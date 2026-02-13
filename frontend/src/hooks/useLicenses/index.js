import api from "../../services/api";

const useLicenses = () => {
  const list = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.companyId) params.append("companyId", filters.companyId);
    if (filters.status) params.append("status", filters.status);
    if (filters.planId) params.append("planId", filters.planId);
    
    const { data } = await api.request({
      url: `/licenses/list${params.toString() ? `?${params.toString()}` : ""}`,
      method: "GET"
    });
    return data;
  };

  const find = async (id) => {
    const { data } = await api.request({
      url: `/licenses/${id}`,
      method: "GET"
    });
    return data;
  };

  const save = async (payload) => {
    const { data } = await api.request({
      url: "/licenses",
      method: "POST",
      data: payload
    });
    return data;
  };

  const update = async (id, payload) => {
    const { data } = await api.request({
      url: `/licenses/${id}`,
      method: "PUT",
      data: payload
    });
    return data;
  };

  const remove = async (id) => {
    await api.request({
      url: `/licenses/${id}`,
      method: "DELETE"
    });
  };

  const registerPayment = async (id) => {
    const { data } = await api.request({
      url: `/licenses/${id}/register-payment`,
      method: "POST"
    });
    return data;
  };

  return { list, find, save, update, remove, registerPayment };
};

export default useLicenses;
