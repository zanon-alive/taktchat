import React, { useEffect, useState } from "react";
import { Tooltip } from "@mui/material";
import api from "../../services/api";
import { formatBuildLabel, frontendBuildLabel } from "../../helpers/gitSha";

const VersionControl = ({ variant = "default" }) => {
  const frontendLabel = frontendBuildLabel();
  const [backendLabel, setBackendLabel] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchBackend = async () => {
      try {
        const { data } = await api.get("/version");
        if (!mounted) return;
        const raw = data?.backend?.commit || data?.backend?.commitShort || "";
        const pr = data?.backend?.pr || "";
        setBackendLabel(formatBuildLabel(raw, pr));
      } catch {
        if (mounted) setBackendLabel("");
      }
    };
    fetchBackend();
    return () => {
      mounted = false;
    };
  }, []);

  if (!frontendLabel) return null;

  const tooltip = backendLabel && backendLabel !== frontendLabel
    ? `frontend ${frontendLabel} · backend ${backendLabel}`
    : frontendLabel;
  const copyValue = frontendLabel;

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyValue);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silencioso
    }
  };

  const color = variant === "onDark" ? "rgba(255,255,255,0.55)" : "inherit";

  return (
    <Tooltip title={copied ? "Copiado" : tooltip} placement="top">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Versão ${frontendLabel}`}
        style={{
          all: "unset",
          cursor: "pointer",
          fontSize: 11,
          letterSpacing: "0.04em",
          opacity: 0.55,
          color,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          userSelect: "none",
        }}
      >
        {frontendLabel}
      </button>
    </Tooltip>
  );
};

export default VersionControl;
