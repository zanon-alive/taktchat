import api from "../../services/api";

const useCompanies = () => {

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/companies',
            method: 'POST',
            data
        });
        return responseData;
    }

    const findAll = async (id) => {
        const { data } = await api.request({
            url: `/companies`,
            method: 'GET'
        });
        return data;
    }

    const list = async (id) => {
        const { data } = await api.request({
            url: `/companies/list`,
            method: 'GET'
        });
        return data;
    }

    const find = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'GET'
        });
        return data;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const updateSchedules = async (data) => {
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}/schedules`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const blockAccess = async (companyId, blocked) => {
        const { data: responseData } = await api.request({
            url: `/companies/${companyId}/block-access`,
            method: 'PATCH',
            data: { blocked }
        });
        return responseData;
    }

    return {
        save,
        update,
        remove,
        list,
        find,
        findAll,
        updateSchedules,
        blockAccess
    }
}

export default useCompanies;