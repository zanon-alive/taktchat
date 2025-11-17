import { useEffect, useContext } from "react";
import { AuthContext } from "../context/Auth/AuthContext";

const useContactUpdates = (onContactUpdate) => {
  const { socket, user } = useContext(AuthContext);

  useEffect(() => {
    if (!socket || typeof socket.on !== 'function' || !user?.companyId) return;

    const companyId = user.companyId;
    const eventName = `company-${companyId}-contact`;

    const handleContactUpdate = (data) => {
      if (data.action === "update" && data.contact && onContactUpdate) {
        onContactUpdate(data.contact);
      }
    };

    socket.on(eventName, handleContactUpdate);

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off(eventName, handleContactUpdate);
      }
    };
  }, [socket, user?.companyId, onContactUpdate]);
};

export default useContactUpdates;
