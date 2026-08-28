import {
  AccessTime,
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Image,
  LibraryBooks,
  Message,
  MicNone,
  Videocam
} from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { Typography } from "@mui/material";

const CONTENT_STYLES = {
  message: {
    Icon: Message,
    icon: "#64748B",
    background: "#F1F5F9",
    text: "#334155"
  },
  interval: {
    Icon: AccessTime,
    icon: "#F7953B",
    background: "#FFF7ED",
    text: "#9A3412"
  },
  img: {
    Icon: Image,
    icon: "#2563EB",
    background: "#EFF6FF",
    text: "#1E40AF"
  },
  audio: {
    Icon: MicNone,
    icon: "#0D9488",
    background: "#F0FDFA",
    text: "#115E59"
  },
  video: {
    Icon: Videocam,
    icon: "#7C3AED",
    background: "#F5F3FF",
    text: "#5B21B6"
  }
};

const getContentKind = item => {
  if (String(item).includes("message")) return "message";
  if (String(item).includes("interval")) return "interval";
  if (String(item).includes("img")) return "img";
  if (String(item).includes("audio")) return "audio";
  if (String(item).includes("video")) return "video";
  return null;
};

const ContentChip = ({ kind, label }) => {
  const style = CONTENT_STYLES[kind];
  if (!style) {
    return null;
  }
  const Icon = style.Icon;
  return (
    <div style={{ gap: "5px", padding: "6px" }}>
      <div
        style={{
          display: "flex",
          position: "relative",
          flexDirection: "row",
          justifyContent: "center"
        }}
      >
        <Icon sx={{ color: style.icon }} />
      </div>
      <Typography
        textAlign={"center"}
        sx={{
          textOverflow: "ellipsis",
          fontSize: "10px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          color: style.text
        }}
      >
        {label}
      </Typography>
    </div>
  );
};

const chipLabel = (kind, element) => {
  if (!element) {
    return "";
  }
  if (kind === "interval") {
    return `${element.value} segundos`;
  }
  if (kind === "message") {
    return element.value;
  }
  return element.original || element.value || "";
};

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const sequence = data.seq || [];
  const elements = data.elements || [];

  return (
    <div
      style={{
        backgroundColor: "#FEFAFA",
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid rgba(236, 88, 88, 0.25)",
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 3px 5px"
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{
          background: "#2563EB",
          width: "18px",
          height: "18px",
          top: "20px",
          left: "-12px",
          cursor: "pointer"
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffff",
            width: "10px",
            height: "10px",
            marginLeft: "3.5px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 5,
          top: 5,
          cursor: "pointer",
          gap: 6
        }}
      >
        <ContentCopy
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("duplicate");
          }}
          sx={{ width: "12px", height: "12px", color: "#EC5858" }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ width: "12px", height: "12px", color: "#EC5858" }}
        />
      </div>
      <div
        style={{
          color: "#F8FAFC",
          fontSize: "16px",
          flexDirection: "row",
          display: "flex"
        }}
      >
        <LibraryBooks
          sx={{
            width: "16px",
            height: "16px",
            marginRight: "4px",
            marginTop: "4px",
            color: "#EC5858"
          }}
        />
        <div style={{ color: "#232323", fontSize: "16px" }}>Conteúdo</div>
      </div>
      <div style={{ color: "#232323", fontSize: "12px", width: 180 }}>
        {sequence.map(item => {
          const kind = getContentKind(item);
          const element = elements.find(itemLoc => itemLoc.number === item);
          const style = CONTENT_STYLES[kind] || {
            background: "#F6EEEE"
          };
          return (
            <div
              key={item}
              style={{
                backgroundColor: style.background,
                marginBottom: "3px",
                borderRadius: "5px"
              }}
            >
              <ContentChip kind={kind} label={chipLabel(kind, element)} />
            </div>
          );
        })}
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "#2563EB",
          width: "18px",
          height: "18px",
          top: "90%",
          right: "-11px",
          cursor: "pointer"
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#ffff",
            width: "10px",
            height: "10px",
            marginLeft: "2.9px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});
