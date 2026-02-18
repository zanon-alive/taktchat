import React, { useEffect, useState } from "react";
import { getBackendUrl } from "../../../config";
import useSettings from "../../../hooks/useSettings";

/**
 * Componente que carrega o widget de chat do site dinamicamente
 * quando a configuração enableSiteChatWidget estiver habilitada
 */
const SiteChatWidget = () => {
  const { getPublicSetting } = useSettings();
  const [enabled, setEnabled] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [companyToken, setCompanyToken] = useState(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Verificar se o widget está habilitado
        const widgetEnabled = await getPublicSetting("enableSiteChatWidget");
        if (widgetEnabled === "enabled" || widgetEnabled === "true") {
          setEnabled(true);

          // Tentar obter companyId ou companyToken
          // Por enquanto, vamos usar companyId = 1 (empresa padrão)
          // Em produção, isso pode vir de uma configuração específica
          const widgetCompanyId = await getPublicSetting("siteChatWidgetCompanyId");
          const widgetCompanyToken = await getPublicSetting("siteChatWidgetCompanyToken");

          if (widgetCompanyId) {
            setCompanyId(widgetCompanyId);
          } else if (widgetCompanyToken) {
            setCompanyToken(widgetCompanyToken);
          } else {
            // Fallback: usar companyId = 1 se não houver configuração específica
            setCompanyId("1");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configuração do widget:", error);
      }
    };

    loadConfig();
  }, [getPublicSetting]);

  useEffect(() => {
    if (!enabled || widgetLoaded) return;
    if (!companyId && !companyToken) return;

    // Verificar se o script já foi carregado
    const existingScript = document.querySelector('script[src*="widget.js"]');
    if (existingScript) {
      setWidgetLoaded(true);
      return;
    }

    // Criar e configurar o script do widget
    const script = document.createElement("script");
    const widgetUrl = `${window.location.origin}/widget.js`;
    
    script.src = widgetUrl;
    script.async = true;

    // Adicionar atributos de configuração
    if (companyToken) {
      script.setAttribute("data-company-token", companyToken);
    } else if (companyId) {
      script.setAttribute("data-company-id", companyId);
    }

    // Configurar API URL se necessário
    const apiUrl = getBackendUrl();
    if (apiUrl) {
      window.TaktChatWidget = window.TaktChatWidget || {};
      window.TaktChatWidget.apiUrl = apiUrl;
    }

    script.onload = () => {
      setWidgetLoaded(true);
    };

    script.onerror = () => {
      console.error("Erro ao carregar widget do chat do site");
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remover script se o componente for desmontado
      const scriptToRemove = document.querySelector('script[src*="widget.js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [enabled, companyId, companyToken, widgetLoaded]);

  // Não renderiza nada se não estiver habilitado
  if (!enabled) {
    return null;
  }

  return null; // O widget é injetado via script, não precisa renderizar nada
};

export default SiteChatWidget;
