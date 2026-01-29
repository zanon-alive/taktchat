import React from "react";
import KanbanCard from "./KanbanCard";

/**
 * Card customizado para o Board do react-trello.
 * Lê metadata (ticket, tags, onMoveRequest, onClick) e renderiza KanbanCard.
 * Evita passar JSX em "description", que o Card padrão espera como string.
 */
function KanbanBoardCard(props) {
  const { metadata = {}, style = {}, className = "" } = props;

  if (!metadata.ticket) {
    return (
      <div style={style} className={className}>
        {props.description}
      </div>
    );
  }

  const { ticket, tags = [], onMoveRequest, onClick } = metadata;

  return (
    <div style={style} className={className}>
      <KanbanCard
        ticket={ticket}
        allTags={tags}
        onMoveRequest={onMoveRequest}
        onClick={onClick}
      />
    </div>
  );
}

export default KanbanBoardCard;
