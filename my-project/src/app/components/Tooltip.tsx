// src/Tooltip.tsx
import React from "react";

interface TooltipProps {
  x: number;
  y: number;
  id: number;
  name: string;
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ x, y, id, name, visible }) => {
  return (
    <div
      className={`absolute bg-white text-gray-900 text-xs shadow-sm rounded py-1 px-2 pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ top: y, left: x, transform: "translate(-50%, -105%)" }}>
      <p>#{id}</p>
      <p>{name}</p>
    </div>
  );
};

export default Tooltip;
