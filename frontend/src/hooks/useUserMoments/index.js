import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
// import { SocketContext } from "../../context/Socket/SocketContext";

const useUserMoments = () => {
  const [users, setUsers] = useState([]);
  const [update, setUpdate] = useState(true);
  const [isUpdate, setIsUpdate] = useState([]);
  const { user, socket } = useContext(AuthContext);


  useEffect(() => {
    (async () => {
      try {
        if (update) {
          const { data } = await api.get("/usersMoments");

          setUsers(data);
          setUpdate(false);
        }
      } catch (err) {
        if (err.response?.status !== 500) {
          toastError(err);
        } else {
          toast.error(`${i18n.t("frontEndErrors.getUsers")}`);
        }
      }
    })();
  }, [update]);

  useEffect(() => {
    if (!user.id || !socket || typeof socket.on !== 'function' || !user?.companyId) {
      return;
    }

    const companyId = user.companyId;
    
    const onTicketEvent = (data) => {
      if (isUpdate !== data) {
        setIsUpdate(data)
        setUpdate(prevUpdate => !prevUpdate); // Usar o valor anterior de update
      }
    }
    const onAppMessage = (data) => {
      if (isUpdate !== data) {
        setIsUpdate(data)
        setUpdate(prevUpdate => !prevUpdate); // Usar o valor anterior de update
      }
    };
  
    socket.on(`company-${companyId}-ticket`, onTicketEvent);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);
    
    return () => {
      if (socket && typeof socket.off === 'function') {
        try {
          socket.off(`company-${companyId}-ticket`, onTicketEvent);
          socket.off(`company-${companyId}-appMessage`, onAppMessage);
        } catch (e) {
          console.debug("[useUserMoments] error in cleanup", e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.companyId]); // Dependências especificadas aqui  

  return { users };
};

export default useUserMoments;
