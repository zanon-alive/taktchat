import api from "../../services/api";

const useDashboard = () => {

    const find = async (params) => {
        const { data } = await api.request({
            url: `/dashboard`,
            method: 'GET',
            params
        });
        return data;
    }

    const getReport = async (params) => {
        const { data } = await api.request({
            url: `/ticketreport/reports`,
            method: 'GET',
            params
        });
        return data;
    }

    const getPartnerBillingReport = async (params) => {
        const { data } = await api.request({
            url: `/dashboard/partner-billing-report`,
            method: 'GET',
            params
        });
        return data;
    }

    const getPartnerBillingSnapshots = async (params = {}) => {
        const { data } = await api.request({
            url: `/dashboard/partner-billing-snapshots`,
            method: 'GET',
            params
        });
        return data;
    }

    const calculatePartnerBilling = async (body = {}) => {
        const { data } = await api.request({
            url: `/dashboard/partner-billing-report/calculate`,
            method: 'POST',
            data: body
        });
        return data;
    }

    return {
        find,
        getReport,
        getPartnerBillingReport,
        getPartnerBillingSnapshots,
        calculatePartnerBilling
    }
}

export default useDashboard;