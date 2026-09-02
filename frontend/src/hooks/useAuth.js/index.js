import { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import { has, isArray } from "lodash";

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";
import logger from "../../utils/logger";
import { isNativeCapacitor } from "../../utils/nativeApp";
import { getUnauthenticatedRedirect } from "../../utils/publicSitePaths";
// import { useDate } from "../../hooks/useDate";
import moment from "moment";

function redirectUnauthenticatedGuest(history) {
  const dest = getUnauthenticatedRedirect(
    typeof window !== "undefined" ? window.location.pathname : "",
    { isNative: isNativeCapacitor() }
  );
  if (dest) {
    history.push(dest);
  }
}

function getApiErrorCode(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.response?.data?.code ||
    ""
  );
}

const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [socket, setSocket] = useState({});
  
  // Ref para rastrear se o componente está montado
  const isMountedRef = useRef(true);
  // Ref para evitar múltiplas tentativas simultâneas de refresh
  const isRefreshingRef = useRef(false);
  // Ref para controlar se já tentou fazer refresh inicial
  const hasTriedInitialRefreshRef = useRef(false);

  // Cleanup quando o componente desmonta
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Helper para atualizar estado apenas se montado
  const safeSetState = (setter, value) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
        safeSetState(setIsAuth, true);
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const status = error?.response?.status;
      const errorCode = getApiErrorCode(error);
      const isAuthRefreshCall = originalRequest?.url?.includes("/auth/refresh_token");

      if (status === 403 && errorCode === "ERR_BILLING_ONLY") {
        if (history.location.pathname !== "/financeiro") {
          history.push("/financeiro");
        }
        return Promise.reject(error);
      }
      
      // Evitar loop infinito: se já está tentando refresh ou é uma chamada de refresh, não tentar novamente
      if ((status === 401 || status === 403) && !originalRequest._retry && !isAuthRefreshCall && !isRefreshingRef.current) {
        originalRequest._retry = true;
        isRefreshingRef.current = true;
        
        try {
          const { data } = await api.post("/auth/refresh_token");
          if (data?.token) {
            localStorage.setItem("token", JSON.stringify(data.token));
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            isRefreshingRef.current = false;
            return api(originalRequest);
          }
        } catch (e) {
          // Refresh falhou: limpar estado e ir para landing (web na raiz) ou login
          isRefreshingRef.current = false;
          const refreshStatus = e?.response?.status;
          const refreshErrorCode = getApiErrorCode(e);
          
          // Se for 403, exibir mensagem específica
          if (refreshStatus === 403) {
            let message = i18n.t("auth.errors.accessBlocked");
            if (refreshErrorCode === "ERR_ACCESS_BLOCKED_PLATFORM") {
              message = i18n.t("auth.errors.accessBlockedPlatform");
            } else if (refreshErrorCode === "ERR_ACCESS_BLOCKED_PARTNER") {
              message = i18n.t("auth.errors.accessBlockedPartner");
            } else if (refreshErrorCode === "ERR_LICENSE_OVERDUE") {
              message = i18n.t("auth.errors.licenseOverdue");
            }
            toast.error(message);
          }
          
          localStorage.removeItem("token");
          api.defaults.headers.Authorization = undefined;
          safeSetState(setIsAuth, false);
          redirectUnauthenticatedGuest(history);
        }
      }
      
      if (status === 401) {
        localStorage.removeItem("token");
        api.defaults.headers.Authorization = undefined;
        safeSetState(setIsAuth, false);
        redirectUnauthenticatedGuest(history);
      }
      
      if (status === 403) {
        const blockedCode = getApiErrorCode(error);
        let message = i18n.t("auth.errors.accessBlocked");
        
        if (blockedCode === "ERR_ACCESS_BLOCKED_PLATFORM") {
          message = i18n.t("auth.errors.accessBlockedPlatform");
        } else if (blockedCode === "ERR_ACCESS_BLOCKED_PARTNER") {
          message = i18n.t("auth.errors.accessBlockedPartner");
        } else if (blockedCode === "ERR_LICENSE_OVERDUE") {
          message = i18n.t("auth.errors.licenseOverdue");
        }
        
        toast.error(message);
        localStorage.removeItem("token");
        api.defaults.headers.Authorization = undefined;
        safeSetState(setIsAuth, false);
        redirectUnauthenticatedGuest(history);
      }
      
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    isMountedRef.current = true;
    
    // Evitar múltiplas tentativas de refresh inicial
    if (hasTriedInitialRefreshRef.current) {
      return;
    }
    
    hasTriedInitialRefreshRef.current = true;
    isRefreshingRef.current = true;
    
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh_token");
        if (data?.token && isMountedRef.current) {
          localStorage.setItem("token", JSON.stringify(data.token));
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          safeSetState(setIsAuth, true);
          safeSetState(setUser, data.user);
          if (data.user?.billingOnly) {
            history.replace("/financeiro");
          }
        }
      } catch (err) {
        // falha de refresh inicial: garantir estado limpo
        if (isMountedRef.current) {
          localStorage.removeItem("token");
          api.defaults.headers.Authorization = undefined;
          safeSetState(setIsAuth, false);
          
          // Sem sessão: landing na raiz (web), login no nativo/painel, ficar em auth/marketing
          redirectUnauthenticatedGuest(history);
        }
      } finally {
        isRefreshingRef.current = false;
        if (isMountedRef.current) {
          safeSetState(setLoading, false);
        }
      }
    })();
  }, [history]);

  useEffect(() => {
    if (Object.keys(user).length && user.id > 0) {
      // console.log("Entrou useWhatsapp com user", Object.keys(user).length, Object.keys(socket).length ,user, socket)
      let io;
      if (!socket || !socket.on || typeof socket.on !== 'function') {
        io = socketConnection({ user });
        if (io && typeof io.on === 'function') {
          setSocket(io);
        } else {
          console.error('[useAuth] socketConnection não retornou uma instância válida', io);
          return;
        }
      } else {
        io = socket;
      }
      
      if (io && typeof io.on === 'function') {
        io.on(`company-${user?.companyId}-user`, (data) => {
          if (data.action === "update" && data.user.id === user.id && isMountedRef.current) {
            safeSetState(setUser, data.user);
          }
        });

        return () => {
          // console.log("desconectou o company user ", user.id)
          if (io && typeof io.off === 'function') {
            io.off(`company-${user?.companyId}-user`);
          }
          // io.disconnect();
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [user]);

  const handleLogin = async (userData) => {
    if (!isMountedRef.current) return;
    
    safeSetState(setLoading, true);

    try {
      const { data } = await api.post("/auth/login", userData);
      
      // Verificar se componente ainda está montado antes de continuar
      if (!isMountedRef.current) return;
      
      const {
        user: { company },
      } = data;

      if (has(company, "companieSettings") && isArray(company.companieSettings[0])) {
        const setting = company.companieSettings[0].find(
          (s) => s.key === "campaignsEnabled"
        );
        if (setting && setting.value === "true") {
          localStorage.setItem("cshow", null); //regra pra exibir campanhas
        }
      }

      if (has(company, "companieSettings") && isArray(company.companieSettings[0])) {
        const setting = company.companieSettings[0].find(
          (s) => s.key === "sendSignMessage"
        );

        const signEnable = setting.value === "enable";

        if (setting && setting.value === "enabled") {
          localStorage.setItem("sendSignMessage", signEnable); //regra pra exibir campanhas
        }
      }
      localStorage.setItem("profileImage", data.user.profileImage); //regra pra exibir imagem contato

      moment.locale('pt-br');
      const billingOnly = data.user?.billingOnly === true;
      let dueDate;
      if (data.user.company.id === 1) {
        dueDate = '2999-12-31T00:00:00.000Z'
      } else {
        dueDate = data.user.company.dueDate;
      }
      const vencimento = dueDate ? moment(dueDate).format("DD/MM/yyyy") : "";
      const diff = dueDate ? moment(dueDate).diff(moment()) : 0;
      const dias = moment.duration(diff).asDays();

      if (!isMountedRef.current) return;

      localStorage.setItem("token", JSON.stringify(data.token));
      if (vencimento) {
        localStorage.setItem("companyDueDate", vencimento);
      }
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      safeSetState(setUser, data.user);
      safeSetState(setIsAuth, true);

      if (billingOnly) {
        toast.warn(i18n.t("auth.toasts.billingOnly"));
        history.push("/financeiro");
        safeSetState(setLoading, false);
        return;
      }

      toast.success(i18n.t("auth.toasts.success"));
      if (dueDate && moment(dueDate).isValid() && Math.round(dias) < 5 && Math.round(dias) >= 0) {
        toast.warn(`Sua assinatura vence em ${Math.round(dias)} ${Math.round(dias) === 1 ? 'dia' : 'dias'} `);
      }
      history.push("/tickets");
      safeSetState(setLoading, false);

    } catch (err) {
      if (isMountedRef.current) {
        const status = err?.response?.status;
        const errorCode = getApiErrorCode(err);
        
        // Se for 403, exibir mensagem específica de bloqueio
        if (status === 403) {
          let message = i18n.t("auth.errors.accessBlocked");
          if (errorCode === "ERR_ACCESS_BLOCKED_PLATFORM") {
            message = i18n.t("auth.errors.accessBlockedPlatform");
          } else if (errorCode === "ERR_ACCESS_BLOCKED_PARTNER") {
            message = i18n.t("auth.errors.accessBlockedPartner");
          } else if (errorCode === "ERR_LICENSE_OVERDUE") {
            message = i18n.t("auth.errors.licenseOverdue");
          }
          toast.error(message);
        } else {
          toastError(err);
        }
        safeSetState(setLoading, false);
      }
    }
  };

  const handleLogout = async () => {
    if (!isMountedRef.current) return;
    
    safeSetState(setLoading, true);

    try {
      // socket.disconnect();
      await api.delete("/auth/logout");
      
      // Verificar se componente ainda está montado
      if (!isMountedRef.current) return;
      
      safeSetState(setIsAuth, false);
      safeSetState(setUser, {});
      localStorage.removeItem("token");
      localStorage.removeItem("cshow");
      // localStorage.removeItem("public-token");
      api.defaults.headers.Authorization = undefined;
      safeSetState(setLoading, false);
      history.push("/login");
    } catch (err) {
      if (isMountedRef.current) {
      toastError(err);
        safeSetState(setLoading, false);
      }
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      logger.debug(data);
      return data;
    } catch (_) {
      return null;
    }
  };

  return {
    isAuth,
    user,
    loading,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
    socket
  };
};

export default useAuth;
