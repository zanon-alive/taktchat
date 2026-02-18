import api from "../services/api";

const useChannelEntryConfigs = () => {
  const list = async () => {
    const { data } = await api.get("/channelEntryConfigs");
    return data;
  };

  const update = async (payload) => {
    const { data } = await api.put("/channelEntryConfigs", payload);
    return data;
  };

  return { list, update };
};

export default useChannelEntryConfigs;
